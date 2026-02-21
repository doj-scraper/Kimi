from __future__ import annotations

from typing import Any, Dict, List, Tuple
from uuid import UUID

from aegis_common_schema.base import ClassificationLevel, Compartment
from aegis_common_schema.policy_obligations import (
    ClassificationAggregationResult,
    ClassificationPolicy,
    FieldRedactionRule,
    RedactionStrategy,
)
from aegis_common_schema.access_control_engine import AccessControlEngine


# Simple demo policy: redact email unless user has HUMINT
def build_demo_policy() -> ClassificationPolicy:
    policy = ClassificationPolicy(policy_name="Demo Policy")

    policy.field_redaction_rules.append(
        FieldRedactionRule(
            field_path="incident.affected_users[*].email",
            field_type="email",
            strategy=RedactionStrategy.MASK_WITH_BRACKETS,
            required_clearance=ClassificationLevel.SECRET,
            required_compartments=[Compartment.HUMINT],
            description="Redact user emails unless HUMINT compartment present.",
        )
    )
    return policy


def evaluate_and_render(
    *,
    user_id: UUID,
    user_clearance: ClassificationLevel,
    user_compartments: List[Compartment],
    user_roles: List[str],
    user_mfa_verified: bool,
    user_account_suspended: bool,
    device_posture: str,
    session_active: bool,
    resource_classification: ClassificationLevel,
    resource_compartments: List[Compartment],
    incident_payload: Dict[str, Any],
    signing_key: str | None = None,
) -> Tuple[bool, str, Dict[str, str], Dict[str, Any]]:
    """
    Returns:
      allowed, reason, headers, body
    """
    policy = build_demo_policy()
    engine = AccessControlEngine(policy, signing_key=signing_key)

    decision = engine.make_access_decision(
        user_id=user_id,
        user_clearance=user_clearance,
        user_compartments=user_compartments,
        user_roles=user_roles,
        user_mfa_verified=user_mfa_verified,
        user_account_suspended=user_account_suspended,
        resource_classification=resource_classification,
        resource_compartments=resource_compartments,
        device_posture=device_posture,
        session_active=session_active,
    )

    if not decision.allowed:
        return False, decision.reason, {}, {"error": decision.reason}

    # Apply redaction AFTER allow
    redacted = engine.apply_redaction(
        incident_payload,
        user_clearance=user_clearance,
        user_compartments=user_compartments,
    )

    # Banner must reflect highest classification of what you return (aggregation)
    entities_for_agg = []

    # incident itself
    entities_for_agg.append(
        {
            "classification": ClassificationLevel(redacted.get("classification", ClassificationLevel.UNCLASSIFIED.value)),
            "portion_markings": redacted.get("portion_markings", []),
            "compartments": redacted.get("compartments", []),
        }
    )

    # related alerts (if any)
    for a in redacted.get("related_alerts", []) or []:
        entities_for_agg.append(
            {
                "classification": ClassificationLevel(a.get("classification", ClassificationLevel.UNCLASSIFIED.value)),
                "portion_markings": a.get("portion_markings", []),
                "compartments": a.get("compartments", []),
            }
        )

    agg = ClassificationAggregationResult.aggregate(entities_for_agg, signing_key=signing_key)

    headers = {
        "X-Classification": agg.highest_classification.value,
        "X-Portion-Markings": ",".join(agg.all_portion_markings),
    }
    if agg.signature:
        headers["X-Classification-Signature"] = agg.signature

    # Optional: expose obligations for demo visibility
    redacted["_access_obligations"] = [o.model_dump(mode="json") for o in decision.obligations]

    return True, decision.reason, headers, redacted
