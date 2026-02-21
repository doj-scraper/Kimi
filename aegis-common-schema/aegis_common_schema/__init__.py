"""Aegis Common Schema (Pydantic v2).

Canonical models shared across Aegis modules.
"""

from .base import (
    SCHEMA_VERSION,
    ClassificationLevel,
    ThreatLevel,
    IncidentState,
    UserAccessState,
    EventCategory,
    EventOutcome,
    RoleType,
    CVESeverity,
    VendorRiskTier,
    AegisModel,
    ClassificationMarking,
    EventEnvelope,
)

__all__ = [
    "SCHEMA_VERSION",
    "ClassificationLevel",
    "ThreatLevel",
    "IncidentState",
    "UserAccessState",
    "EventCategory",
    "EventOutcome",
    "RoleType",
    "CVESeverity",
    "VendorRiskTier",
    "AegisModel",
    "ClassificationMarking",
    "EventEnvelope",
]
