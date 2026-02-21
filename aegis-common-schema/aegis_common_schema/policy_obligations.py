"""Aegis Common Schema - Policy & Obligations

Defines:
- Redaction rules
- Access obligations and decisions
- Classification aggregation for UI banners
- Minimal redaction engine utility

This is a schema + utility module; enforcement belongs at service boundaries.
"""

from __future__ import annotations

from enum import Enum
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Set
from uuid import UUID, uuid4
import hashlib
import json
import hmac

from pydantic import BaseModel, Field, ConfigDict

from .base import ClassificationLevel, Compartment


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ObligationType(str, Enum):
    MASK_FIELD = "mask_field"
    REDACT_PORTION = "redact_portion"
    REQUIRE_MFA_STEP_UP = "require_mfa_step_up"
    REQUIRE_APPROVAL = "require_approval"
    AUDIT_ACCESS = "audit_access"
    RESTRICT_EXPORT = "restrict_export"
    RESTRICT_COPY = "restrict_copy"
    WATERMARK = "watermark"


class RedactionStrategy(str, Enum):
    MASK_WITH_BRACKETS = "mask_with_brackets"
    MASK_WITH_ASTERISKS = "mask_with_asterisks"
    MASK_WITH_HASH = "mask_with_hash"
    REMOVE_FIELD = "remove_field"
    TRUNCATE = "truncate"


class PolicyScope(str, Enum):
    GLOBAL = "global"
    ROLE_BASED = "role_based"
    ATTRIBUTE_BASED = "attribute_based"
    RESOURCE_BASED = "resource_based"


class FieldRedactionRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field_path: str
    field_type: str
    strategy: RedactionStrategy = RedactionStrategy.MASK_WITH_BRACKETS

    required_clearance: Optional[ClassificationLevel] = None
    required_compartments: List[Compartment] = Field(default_factory=list)

    description: Optional[str] = None
    tags: Dict[str, str] = Field(default_factory=dict)

    def should_redact(self, user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> bool:
        if self.required_clearance is not None:
            if user_clearance.numeric_value < self.required_clearance.numeric_value:
                return True
        if self.required_compartments:
            if not set(self.required_compartments).issubset(set(user_compartments)):
                return True
        return False

    def apply_redaction(self, value: Any) -> str:
        if self.strategy == RedactionStrategy.MASK_WITH_BRACKETS:
            return "[REDACTED]"
        if self.strategy == RedactionStrategy.MASK_WITH_ASTERISKS:
            return "****"
        if self.strategy == RedactionStrategy.MASK_WITH_HASH:
            return "#####"
        if self.strategy == RedactionStrategy.TRUNCATE:
            if isinstance(value, str) and len(value) > 6:
                return f"{value[:3]}...{value[-3:]}"
            return "[REDACTED]"
        # REMOVE_FIELD is handled by caller; default mask here
        return "[REDACTED]"


class PortionRedactionRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    portion_name: str
    portion_marking: str

    minimum_clearance: ClassificationLevel
    required_compartments: List[Compartment] = Field(default_factory=list)

    strategy: RedactionStrategy = RedactionStrategy.REMOVE_FIELD

    description: Optional[str] = None
    tags: Dict[str, str] = Field(default_factory=dict)

    def should_redact(self, user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> bool:
        if user_clearance.numeric_value < self.minimum_clearance.numeric_value:
            return True
        if self.required_compartments:
            if not set(self.required_compartments).issubset(set(user_compartments)):
                return True
        return False


class AccessObligation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    obligation_id: UUID = Field(default_factory=uuid4)
    obligation_type: ObligationType

    description: str
    triggered_when: str

    action: str
    action_params: Dict[str, Any] = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=utcnow)
    created_by: Optional[UUID] = None


class AccessDecisionObligation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    obligation_type: ObligationType
    resource_field: Optional[str] = None
    redaction_strategy: Optional[RedactionStrategy] = None
    reason: str


class ClassificationAggregationResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    highest_classification: ClassificationLevel
    all_classifications: List[ClassificationLevel]
    all_portion_markings: List[str]
    all_compartments: List[Compartment]

    computed_at: datetime = Field(default_factory=utcnow)
    computed_from_entity_count: int

    signature: Optional[str] = None
    signature_algorithm: str = "hmac-sha256"

    def compute_signature(self, signing_key: str) -> str:
        # Signature should not depend on computed_at to avoid breaking caching.
        payload = {
            "highest_classification": self.highest_classification.value,
            "all_portion_markings": sorted(self.all_portion_markings),
            "all_compartments": sorted([c.value for c in self.all_compartments]),
            "count": self.computed_from_entity_count,
        }
        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return hmac.new(signing_key.encode(), serialized.encode(), hashlib.sha256).hexdigest()

    @staticmethod
    def aggregate(entities: List[Dict[str, Any]], signing_key: Optional[str] = None) -> "ClassificationAggregationResult":
        classifications: List[ClassificationLevel] = []
        portion_markings_set: Set[str] = set()
        compartments_set: Set[Compartment] = set()

        for entity in entities:
            if "classification" in entity and entity["classification"] is not None:
                c = entity["classification"]
                classifications.append(c if isinstance(c, ClassificationLevel) else ClassificationLevel(c))
            if "portion_markings" in entity and entity["portion_markings"]:
                portion_markings_set.update(entity["portion_markings"])
            if "compartments" in entity and entity["compartments"]:
                for comp in entity["compartments"]:
                    compartments_set.add(comp if isinstance(comp, Compartment) else Compartment(comp))

        highest = max(classifications, key=lambda c: c.numeric_value, default=ClassificationLevel.UNCLASSIFIED)

        result = ClassificationAggregationResult(
            highest_classification=highest,
            all_classifications=classifications,
            all_portion_markings=sorted(list(portion_markings_set)),
            all_compartments=sorted(list(compartments_set), key=lambda c: c.value),
            computed_from_entity_count=len(entities),
        )

        if signing_key:
            result.signature = result.compute_signature(signing_key)

        return result


class ClassificationPolicy(BaseModel):
    model_config = ConfigDict(extra="forbid")

    policy_name: str
    policy_description: Optional[str] = None

    field_redaction_rules: List[FieldRedactionRule] = Field(default_factory=list)
    portion_redaction_rules: List[PortionRedactionRule] = Field(default_factory=list)
    access_obligations: List[AccessObligation] = Field(default_factory=list)

    scope: PolicyScope = PolicyScope.GLOBAL
    applicable_roles: List[str] = Field(default_factory=list)

    is_active: bool = True
    is_enforced: bool = True

    created_by: Optional[UUID] = None
    last_modified_by: Optional[UUID] = None


class AccessDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision_id: UUID = Field(default_factory=uuid4)
    allowed: bool
    reason: str

    obligations: List[AccessDecisionObligation] = Field(default_factory=list)

    highest_classification: Optional[ClassificationLevel] = None
    portion_markings: List[str] = Field(default_factory=list)

    decided_at: datetime = Field(default_factory=utcnow)
    decided_by: str = "access-control-engine"

    user_clearance: ClassificationLevel
    user_compartments: List[Compartment]
    resource_classification: ClassificationLevel
    resource_compartments: List[Compartment]


# ============================================================================
# REDACTION ENGINE (Utility)
# ============================================================================

class RedactionEngine:
    """Applies redaction rules to response payloads."""

    def __init__(self, policy: ClassificationPolicy):
        self.policy = policy

    def _set_path_redacted(self, current: Any, parts: List[str], redacted_value: Any) -> bool:
        if not parts:
            return False

        head = parts[0]
        tail = parts[1:]

        # list wildcard segment: key[*]
        if head.endswith("[*]"):
            key = head[:-3]
            if not isinstance(current, dict) or key not in current or not isinstance(current[key], list):
                return False
            changed = False
            for item in current[key]:
                changed |= self._set_path_redacted(item, tail, redacted_value)
            return changed

        if not isinstance(current, dict) or head not in current:
            return False

        if not tail:
            current[head] = redacted_value
            return True

        return self._set_path_redacted(current[head], tail, redacted_value)

    def redact_field(self, data: Dict[str, Any], field_path: str, user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> Dict[str, Any]:
        for rule in self.policy.field_redaction_rules:
            if rule.field_path != field_path:
                continue
            if not rule.should_redact(user_clearance, user_compartments):
                continue
            parts = field_path.split(".")
            redacted_value = rule.apply_redaction(None)
            self._set_path_redacted(data, parts, redacted_value)
        return data

    def compute_obligations(self, user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> List[AccessDecisionObligation]:
        obligations: List[AccessDecisionObligation] = []

        for rule in self.policy.field_redaction_rules:
            if rule.should_redact(user_clearance, user_compartments):
                obligations.append(
                    AccessDecisionObligation(
                        obligation_type=ObligationType.MASK_FIELD,
                        resource_field=rule.field_path,
                        redaction_strategy=rule.strategy,
                        reason="Redaction rule applies",
                    )
                )

        for portion_rule in self.policy.portion_redaction_rules:
            if portion_rule.should_redact(user_clearance, user_compartments):
                obligations.append(
                    AccessDecisionObligation(
                        obligation_type=ObligationType.REDACT_PORTION,
                        resource_field=portion_rule.portion_name,
                        redaction_strategy=portion_rule.strategy,
                        reason="Portion redaction rule applies",
                    )
                )

        return obligations

    def apply_obligations(self, data: Dict[str, Any], obligations: List[AccessDecisionObligation], user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> Dict[str, Any]:
        # MVP: apply only field masks; portion removal could be added later.
        for o in obligations:
            if o.obligation_type == ObligationType.MASK_FIELD and o.resource_field:
                data = self.redact_field(data, o.resource_field, user_clearance, user_compartments)
        return data
