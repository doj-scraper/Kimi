"""Aegis Common Schema - Base Models & Enums (v2)

This module is intentionally small and dependency-light.
It provides:
- Core enums used across domains
- Base entity model with classification metadata
- Deterministic hashing helpers
- Standard event envelope

Notes:
- Uses timezone-aware UTC timestamps.
- compute_hash() is intended for audit/event chaining.
- stable_fingerprint() excludes timestamps by default.
"""

from __future__ import annotations

from enum import Enum
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Set
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict
import hashlib
import json


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ============================================================================
# ENUMERATIONS
# ============================================================================

class ClassificationLevel(str, Enum):
    """U.S. Government classification levels (EO 13526).

    Values are compact codes to keep payloads small.
    """

    UNCLASSIFIED = "U"
    CUI = "CUI"
    CONFIDENTIAL = "C"
    SECRET = "S"
    TOP_SECRET = "TS"
    TS_SCI = "TS//SCI"

    @property
    def numeric_value(self) -> int:
        mapping = {
            "U": 0,
            "CUI": 1,
            "C": 2,
            "S": 3,
            "TS": 4,
            "TS//SCI": 5,
        }
        return mapping[self.value]

    @property
    def banner_color(self) -> str:
        # Astro UXDS-style colors (as provided in your spec)
        mapping = {
            "U": "#007A33",
            "CUI": "#502B85",
            "C": "#0033A0",
            "S": "#C8102E",
            "TS": "#FF8C00",
            "TS//SCI": "#FCE83A",
        }
        return mapping[self.value]

    def can_access(self, required_level: "ClassificationLevel") -> bool:
        return self.numeric_value >= required_level.numeric_value


class Compartment(str, Enum):
    """Common compartment categories.

    Note: compartments/controls are often program-specific; keep this list minimal.
    """

    NOFORN = "NOFORN"
    NOCONTRACT = "NOCONTRACT"
    HUMINT = "HUMINT"
    SIGINT = "SIGINT"
    IMINT = "IMINT"
    TALENT_KEYHOLE = "TK"
    RUFF = "RUFF"


class ThreatLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

    @property
    def numeric_value(self) -> int:
        return {"critical": 5, "high": 4, "medium": 3, "low": 2, "info": 1}[self.value]


class IncidentState(str, Enum):
    NEW = "new"
    TRIAGED = "triaged"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    ERADICATED = "eradicated"
    RECOVERED = "recovered"
    CLOSED = "closed"
    ESCALATED = "escalated"


class UserAccessState(str, Enum):
    PENDING_VETTING = "pending_vetting"
    ACTIVE_PROVISIONAL = "active_provisional"
    ACTIVE_FULL = "active_full"
    SUSPENDED = "suspended"
    UNDER_REVIEW = "under_review"
    REVOKED = "revoked"
    REINSTATED = "reinstated"


class EventCategory(str, Enum):
    AUTHENTICATION = "authentication"
    PROCESS = "process"
    NETWORK = "network"
    FILE = "file"
    REGISTRY = "registry"
    THREAT = "threat"
    DETECTION = "detection"
    INCIDENT = "incident"
    ACCESS = "access"
    CONFIGURATION = "configuration"


class EventOutcome(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    UNKNOWN = "unknown"


class RoleType(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    SECURITY_OPS_MANAGER = "security_ops_manager"
    SENIOR_ANALYST = "senior_analyst"
    ANALYST = "analyst"
    JUNIOR_ANALYST = "junior_analyst"
    INCIDENT_RESPONDER = "incident_responder"
    THREAT_INTEL_OFFICER = "threat_intel_officer"
    INTELLIGENCE_ANALYST = "intelligence_analyst"
    SUPPLY_CHAIN_OFFICER = "supply_chain_officer"
    VENDOR_RISK_ANALYST = "vendor_risk_analyst"
    AUDITOR = "auditor"


class VendorRiskTier(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CVESeverity(str, Enum):
    UNKNOWN = "unknown"
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NONE = "none"


# ============================================================================
# CLASSIFICATION MARKING
# ============================================================================

class ClassificationMarking(BaseModel):
    model_config = ConfigDict(frozen=True)

    level: ClassificationLevel = ClassificationLevel.UNCLASSIFIED
    compartments: List[Compartment] = Field(default_factory=list)
    portion_markings: List[str] = Field(default_factory=list)

    def can_be_accessed_by(self, user_clearance: ClassificationLevel, user_compartments: List[Compartment]) -> bool:
        if not user_clearance.can_access(self.level):
            return False
        if not set(self.compartments).issubset(set(user_compartments)):
            return False
        return True


# ============================================================================
# BASE MODEL
# ============================================================================

class AegisModel(BaseModel):
    """Base model for all Aegis entities with common metadata."""

    model_config = ConfigDict(
        validate_assignment=True,
        extra="forbid",
        json_encoders={
            datetime: lambda v: v.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
            UUID: lambda v: str(v),
        },
    )

    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    classification: ClassificationLevel = Field(default=ClassificationLevel.UNCLASSIFIED)
    compartments: List[Compartment] = Field(default_factory=list)
    portion_markings: List[str] = Field(default_factory=list)

    tenant_id: Optional[UUID] = None

    def update_timestamp(self) -> None:
        self.updated_at = utcnow()

    def stable_fingerprint(self, *, exclude: Optional[Set[str]] = None) -> str:
        exclude = set(exclude or set())
        exclude |= {"created_at", "updated_at"}
        payload = self.model_dump(mode="json", exclude=exclude)
        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
        return "sha256:" + hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def compute_hash(self) -> str:
        """Deterministic SHA256 hash of the full model dump (used for chaining)."""
        serialized = json.dumps(self.model_dump(mode="json"), sort_keys=True, separators=(",", ":"), default=str)
        return "sha256:" + hashlib.sha256(serialized.encode("utf-8")).hexdigest()


# ============================================================================
# EVENT ENVELOPE
# ============================================================================

class EventEnvelope(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: UUID = Field(default_factory=uuid4)
    event_type: str
    occurred_at: datetime = Field(default_factory=utcnow)
    producer: str
    schema_version: str = "1.0.0"

    classification: ClassificationLevel = ClassificationLevel.UNCLASSIFIED
    portion_markings: List[str] = Field(default_factory=list)

    actor: Dict[str, Any]
    request_id: Optional[UUID] = None
    correlation_id: Optional[UUID] = None

    hash_chain_prev: Optional[str] = None
    payload: Dict[str, Any]

    def compute_hash(self) -> str:
        serialized = json.dumps(self.model_dump(mode="json"), sort_keys=True, separators=(",", ":"), default=str)
        return "sha256:" + hashlib.sha256(serialized.encode("utf-8")).hexdigest()


SCHEMA_VERSION = "1.0.0"
