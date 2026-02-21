"""Aegis Common Schema - Supply Chain Risk (Provenance)

CycloneDX/SPDX aligned data structures for SBOM/HBOM and vendor risk scoring.

Design goals:
- Deterministic VRS inputs hashing
- No non-deterministic helpers that invent vendor IDs/names
- Typed digests for integrity
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import UUID
import hashlib
import json

from pydantic import BaseModel, Field, ConfigDict, model_validator

from .base import AegisModel, ThreatLevel, CVESeverity, VendorRiskTier


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ComponentType(str, Enum):
    LIBRARY = "library"
    FRAMEWORK = "framework"
    APPLICATION = "application"
    CONTAINER = "container"
    OPERATING_SYSTEM = "operating_system"
    DEVICE = "device"
    FIRMWARE = "firmware"
    SOURCE = "source"


class LicenseCompliance(str, Enum):
    COMPLIANT = "compliant"
    INCOMPATIBLE = "incompatible"
    RESTRICTED = "restricted"
    UNKNOWN = "unknown"


class Digest(BaseModel):
    model_config = ConfigDict(frozen=True)

    alg: str
    value: str

    def __str__(self) -> str:
        return f"{self.alg}:{self.value}"


class Vulnerability(AegisModel):
    cve_id: str
    cwe_ids: list[str] = Field(default_factory=list)

    title: str
    description: Optional[str] = None

    cvss_v3_score: Optional[float] = Field(default=None, ge=0.0, le=10.0)
    cvss_v3_vector: Optional[str] = None
    severity: CVESeverity = Field(default=CVESeverity.UNKNOWN)

    published_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None

    is_in_kev: bool = False
    kev_added_date: Optional[datetime] = None
    kev_due_date: Optional[datetime] = None

    references: list[str] = Field(default_factory=list)
    is_active: bool = True


class Component(AegisModel):
    component_type: ComponentType
    component_id: str

    name: str
    version: str

    purl: Optional[str] = None

    supplier: Optional[str] = None
    author: Optional[str] = None

    license_id: Optional[str] = None
    license_compliance: LicenseCompliance = LicenseCompliance.UNKNOWN

    hashes: list[Digest] = Field(default_factory=list)

    known_vulnerabilities: list[UUID] = Field(default_factory=list)

    description: Optional[str] = None
    homepage: Optional[str] = None
    repository: Optional[str] = None


class SBOM(AegisModel):
    sbom_name: str
    sbom_version: str = "1"

    subject_name: str
    subject_type: ComponentType
    subject_purl: Optional[str] = None

    components: list[Component] = Field(default_factory=list)

    created_by: Optional[UUID] = None
    created_at_sbom: datetime = Field(default_factory=utcnow)

    sbom_digest: Optional[Digest] = None
    previous_sbom_hash: Optional[str] = None

    critical_vulnerabilities: int = 0
    high_vulnerabilities: int = 0
    medium_vulnerabilities: int = 0
    kev_vulnerabilities: int = 0


class HardwareComponent(AegisModel):
    component_type: str
    manufacturer: str
    model: str
    serial_number: Optional[str] = None

    firmware_version: Optional[str] = None
    firmware_vulnerabilities: list[UUID] = Field(default_factory=list)

    description: Optional[str] = None


class HBOM(AegisModel):
    hbom_name: str
    device_name: str

    components: list[HardwareComponent] = Field(default_factory=list)

    created_by: Optional[UUID] = None
    created_at_hbom: datetime = Field(default_factory=utcnow)

    firmware_vulnerabilities: int = 0


class Vendor(AegisModel):
    vendor_name: str
    vendor_aliases: list[str] = Field(default_factory=list)

    website: Optional[str] = None
    email: Optional[str] = None

    incident_count_12mo: int = 0
    breach_count: int = 0
    reputation_score: Optional[float] = Field(default=None, ge=0.0, le=10.0)

    description: Optional[str] = None
    tags: dict[str, str] = Field(default_factory=dict)


class VRSInputs(BaseModel):
    """Deterministic scoring inputs.

    inputs_hash is computed from a normalized JSON representation.
    """

    model_config = ConfigDict(frozen=True)

    critical_cve_count: int = 0
    high_cve_count: int = 0
    medium_cve_count: int = 0
    kev_present: bool = False

    incident_count_12mo: int = 0
    breach_count: int = 0
    reputation_score: float = 0.0

    days_since_sbom_update: int = 0
    asset_criticality: int = Field(default=0, ge=0, le=10)

    inputs_hash: str = ""

    @model_validator(mode="after")
    def _compute_hash(self) -> "VRSInputs":
        payload = {
            "critical_cve_count": self.critical_cve_count,
            "high_cve_count": self.high_cve_count,
            "medium_cve_count": self.medium_cve_count,
            "kev_present": self.kev_present,
            "incident_count_12mo": self.incident_count_12mo,
            "breach_count": self.breach_count,
            "reputation_score": round(float(self.reputation_score), 4),
            "days_since_sbom_update": self.days_since_sbom_update,
            "asset_criticality": self.asset_criticality,
        }
        s = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        h = hashlib.sha256(s.encode("utf-8")).hexdigest()
        object.__setattr__(self, "inputs_hash", f"sha256:{h}")
        return self


class VendorRiskScore(AegisModel):
    vendor_id: UUID
    vendor_name: str

    vrs: float = Field(ge=0.0, le=10.0)
    tier: VendorRiskTier

    cve_risk_score: float = Field(ge=0.0, le=10.0)
    vendor_history_score: float = Field(ge=0.0, le=10.0)
    freshness_score: float = Field(ge=0.0, le=10.0)
    criticality_score: float = Field(ge=0.0, le=10.0)

    inputs: VRSInputs

    calculated_at: datetime = Field(default_factory=utcnow)
    calculated_by: str = "provenance-service"
    calculation_version: str = "1.0.0"

    @staticmethod
    def calculate_scores(inputs: VRSInputs) -> tuple[float, float, float, float, float, VendorRiskTier]:
        total = max(1, inputs.critical_cve_count + inputs.high_cve_count + inputs.medium_cve_count)
        base = (inputs.critical_cve_count * 5 + inputs.high_cve_count * 3 + inputs.medium_cve_count * 1) / total
        cve_risk = min(10.0, base + (2.0 if inputs.kev_present else 0.0))

        hist_total = max(1, inputs.incident_count_12mo + inputs.breach_count)
        hist_base = (inputs.incident_count_12mo * 2 + inputs.breach_count * 3) / hist_total
        rep_bonus = (inputs.reputation_score / 10.0) * 5.0
        vendor_history = min(10.0, hist_base + rep_bonus)

        freshness = max(0.0, 10.0 - (inputs.days_since_sbom_update / 30.0))
        criticality = float(inputs.asset_criticality)

        vrs = (cve_risk * 0.35) + (vendor_history * 0.25) + (freshness * 0.20) + (criticality * 0.20)

        if vrs >= 8.0:
            tier = VendorRiskTier.CRITICAL
        elif vrs >= 6.0:
            tier = VendorRiskTier.HIGH
        elif vrs >= 4.0:
            tier = VendorRiskTier.MEDIUM
        else:
            tier = VendorRiskTier.LOW

        return round(vrs, 2), round(cve_risk, 2), round(vendor_history, 2), round(freshness, 2), round(criticality, 2), tier


class SBOMDiffAlert(AegisModel):
    alert_type: str
    severity: ThreatLevel

    sbom_id: UUID
    sbom_name: str

    component_name: Optional[str] = None
    old_version: Optional[str] = None
    new_version: Optional[str] = None

    change_description: str

    detected_at: datetime = Field(default_factory=utcnow)
    requires_review: bool = True
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[UUID] = None
    review_notes: Optional[str] = None
