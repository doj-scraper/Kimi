"""Aegis Access Control Engine (MVP)

Implements fail-secure decisions:
1) account status
2) session status
3) clearance check
4) compartment check
5) need-to-know (simple ABAC)

Then computes obligations:
- MFA step-up for untrusted devices on Secret+
- MFA requirement for Secret+ if not verified
- audit obligation for CUI+

Redaction is applied *after allow* using policy redaction rules.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID

from .base import ClassificationLevel, Compartment
from .policy_obligations import (
    ClassificationPolicy,
    AccessDecision,
    AccessDecisionObligation,
    ObligationType,
    RedactionEngine,
)


class AccessDenialReason(str, Enum):
    INSUFFICIENT_CLEARANCE = "insufficient_clearance"
    MISSING_COMPARTMENTS = "missing_compartments"
    DEVICE_UNTRUSTED = "device_untrusted"
    SESSION_EXPIRED = "session_expired"
    NEED_TO_KNOW_DENIED = "need_to_know_denied"
    MFA_NOT_VERIFIED = "mfa_not_verified"
    ACCOUNT_SUSPENDED = "account_suspended"
    UNKNOWN = "unknown"


class AccessControlEngine:
    def __init__(self, policy: ClassificationPolicy, signing_key: Optional[str] = None):
        self.policy = policy
        self.signing_key = signing_key
        self.redaction_engine = RedactionEngine(policy)

    def make_access_decision(
        self,
        *,
        user_id: UUID,
        user_clearance: ClassificationLevel,
        user_compartments: List[Compartment],
        user_roles: List[str],
        user_mfa_verified: bool,
        user_account_suspended: bool,
        resource_classification: ClassificationLevel,
        resource_compartments: List[Compartment],
        resource_need_to_know_attrs: Optional[Dict[str, Any]] = None,
        device_posture: str = "unknown",
        session_active: bool = True,
    ) -> AccessDecision:

        # 1) account
        if user_account_suspended:
            return AccessDecision(
                allowed=False,
                reason="User account is suspended",
                user_clearance=user_clearance,
                user_compartments=user_compartments,
                resource_classification=resource_classification,
                resource_compartments=resource_compartments,
            )

        # 2) session
        if not session_active:
            return AccessDecision(
                allowed=False,
                reason="Session is not active",
                user_clearance=user_clearance,
                user_compartments=user_compartments,
                resource_classification=resource_classification,
                resource_compartments=resource_compartments,
            )

        # 3) clearance
        if user_clearance.numeric_value < resource_classification.numeric_value:
            return AccessDecision(
                allowed=False,
                reason=f"Insufficient clearance: user has {user_clearance.value}, resource requires {resource_classification.value}",
                user_clearance=user_clearance,
                user_compartments=user_compartments,
                resource_classification=resource_classification,
                resource_compartments=resource_compartments,
            )

        # 4) compartments
        if not set(resource_compartments).issubset(set(user_compartments)):
            missing = set(resource_compartments) - set(user_compartments)
            return AccessDecision(
                allowed=False,
                reason=f"Missing compartments: {', '.join([c.value for c in sorted(missing, key=lambda x: x.value)])}",
                user_clearance=user_clearance,
                user_compartments=user_compartments,
                resource_classification=resource_classification,
                resource_compartments=resource_compartments,
            )

        # 5) need-to-know (simple)
        if resource_need_to_know_attrs:
            if not self._check_need_to_know(user_roles, resource_need_to_know_attrs):
                return AccessDecision(
                    allowed=False,
                    reason="Need-to-know denied",
                    user_clearance=user_clearance,
                    user_compartments=user_compartments,
                    resource_classification=resource_classification,
                    resource_compartments=resource_compartments,
                )

        # obligations
        obligations: List[AccessDecisionObligation] = []

        # Device posture → step-up on Secret+
        if device_posture == "untrusted" and resource_classification.numeric_value >= ClassificationLevel.SECRET.numeric_value:
            obligations.append(
                AccessDecisionObligation(
                    obligation_type=ObligationType.REQUIRE_MFA_STEP_UP,
                    reason="Device is untrusted; Secret+ data requires additional MFA",
                )
            )

        # MFA required on Secret+
        if resource_classification.numeric_value >= ClassificationLevel.SECRET.numeric_value and not user_mfa_verified:
            obligations.append(
                AccessDecisionObligation(
                    obligation_type=ObligationType.REQUIRE_MFA_STEP_UP,
                    reason="Secret+ data requires MFA verification",
                )
            )

        # Audit on CUI+
        if resource_classification.numeric_value >= ClassificationLevel.CUI.numeric_value:
            obligations.append(
                AccessDecisionObligation(
                    obligation_type=ObligationType.AUDIT_ACCESS,
                    reason=f"Accessing {resource_classification.value} data",
                )
            )

        return AccessDecision(
            allowed=True,
            reason="All access control checks passed",
            obligations=obligations,
            highest_classification=resource_classification,
            portion_markings=[f"//{c.value}" for c in resource_compartments],
            user_clearance=user_clearance,
            user_compartments=user_compartments,
            resource_classification=resource_classification,
            resource_compartments=resource_compartments,
        )

    def _check_need_to_know(self, user_roles: List[str], resource_attrs: Dict[str, Any]) -> bool:
        if not resource_attrs:
            return True

        required_roles = resource_attrs.get("required_roles")
        if required_roles:
            if not any(r in user_roles for r in required_roles):
                return False

        # Extend here for sectors, programs, mission tags, etc.
        return True

    def apply_redaction(self, data: Dict[str, Any], user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> Dict[str, Any]:
        obligations = self.redaction_engine.compute_obligations(user_clearance, user_compartments)
        return self.redaction_engine.apply_obligations(data, obligations, user_clearance, user_compartments)
