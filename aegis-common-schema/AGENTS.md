# AGENTS.md - Aegis Common Schema

This file provides essential context for AI coding agents working on the Aegis Common Schema project.

---

## Project Overview

Aegis Common Schema is a Python library providing canonical Pydantic v2 models and policy/obligation primitives used across Aegis modules. It implements classification-aware access control, deterministic redaction, and supply chain risk models for security-focused applications.

**Key Capabilities:**
- Base types: classification levels, markings, deterministic hashing helpers
- Policy & obligations: redaction rules, access decisions, aggregation results
- Access control engine: fail-secure decision flow + obligation computation
- Supply chain models: SBOM/HBOM, vulnerabilities, deterministic VRS inputs/outputs

---

## Technology Stack

| Component | Version/Type |
|-----------|--------------|
| Python | >= 3.10 |
| Framework | Pydantic v2 |
| Build System | setuptools |
| Testing | pytest |
| Type Checking | mypy |

**Dependencies:**
- `pydantic>=2.6` (runtime)
- `pytest>=8.0`, `mypy>=1.8`, `types-requests` (dev)

---

## Module Organization

```
aegis_common_schema/
├── __init__.py           # Public API exports
├── base.py               # Core enums, AegisModel, EventEnvelope
├── policy_obligations.py # Redaction rules, obligations, ClassificationPolicy
├── access_control_engine.py  # AccessControlEngine, fail-secure decisions
└── supply_chain.py       # SBOM/HBOM, VendorRiskScore, VRSInputs

tests/
└── integration/
    └── test_classification_redaction.py  # End-to-end integration tests

docs/
├── ci-workflow-reference.yml  # CI workflow template
└── system-design.md           # Architecture documentation
```

### Module Details

**`base.py`**
- Core enumerations: `ClassificationLevel`, `Compartment`, `ThreatLevel`, `IncidentState`, `UserAccessState`, `EventCategory`, `EventOutcome`, `RoleType`, `CVESeverity`, `VendorRiskTier`
- `ClassificationMarking`: Immutable classification metadata with compartment checks
- `AegisModel`: Base model for all Aegis entities with deterministic hashing (`stable_fingerprint()`, `compute_hash()`)
- `EventEnvelope`: Standard event envelope with hash chain support

**`policy_obligations.py`**
- `ObligationType`, `RedactionStrategy`, `PolicyScope`: Policy enums
- `FieldRedactionRule`: Field-level redaction with path support (including `[*]` wildcards)
- `PortionRedactionRule`: Portion-level redaction rules
- `AccessObligation`, `AccessDecisionObligation`: Obligation definitions
- `ClassificationAggregationResult`: Computes highest classification across entities with optional HMAC signature
- `ClassificationPolicy`: Container for redaction rules and obligations
- `RedactionEngine`: Applies redaction rules to response payloads

**`access_control_engine.py`**
- `AccessDenialReason`: Enumeration of denial reasons
- `AccessControlEngine`: Implements fail-secure access decisions
  - Check order: account status → session status → clearance → compartments → need-to-know
  - Obligations: MFA step-up, audit access (computed after successful authorization)
  - Redaction: Applied after allow using policy rules

**`supply_chain.py`**
- `ComponentType`, `LicenseCompliance`: Supply chain enums
- `Digest`, `Vulnerability`, `Component`, `SBOM`: SBOM-related models
- `HardwareComponent`, `HBOM`: Hardware bill of materials
- `Vendor`: Vendor information with incident/reputation tracking
- `VRSInputs`: Deterministic vendor risk scoring inputs with auto-computed hash
- `VendorRiskScore`: Computed risk score with tier classification
- `SBOMDiffAlert`: SBOM change detection alerts

---

## Build and Test Commands

### Local Development Setup

```bash
# Create virtual environment
python -m venv .venv && source .venv/bin/activate

# Install with dev dependencies
pip install -e ".[dev]"
```

### Testing

```bash
# Run all tests (quiet mode)
pytest -q

# Run with verbose output
pytest -v
```

### Type Checking

```bash
# Run mypy on the package
mypy aegis_common_schema
```

### Build

```bash
# Build distribution (uses setuptools)
python -m build
```

---

## Code Style Guidelines

### General Conventions

- **Imports**: Use `from __future__ import annotations` for forward references
- **Type hints**: Fully typed; use `Optional`, `List`, `Dict`, `Set`, `Any` from `typing`
- **Timestamps**: Always timezone-aware UTC using `datetime.now(timezone.utc)`
  - Helper: `utcnow()` function defined in each module
- **UUIDs**: Use `uuid4()` for identifiers, `UUID` type from `uuid` module

### Pydantic Model Conventions

```python
class MyModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",      # Reject unknown fields
        frozen=True,         # For immutable models
        validate_assignment=True,  # For mutable models
    )
    
    # Field definitions with defaults
    field_name: str = Field(default_factory=list)  # For mutable defaults
    optional_field: Optional[str] = None
    constrained_field: float = Field(ge=0.0, le=10.0)
```

### Model Configuration Patterns

- **Immutable models** (policies, rules): `ConfigDict(frozen=True, extra="forbid")`
- **Entity models** (AegisModel): `ConfigDict(validate_assignment=True, extra="forbid")` with JSON encoders
- **Event envelopes**: `ConfigDict(extra="forbid")`

### JSON Serialization

Custom encoders in `AegisModel`:
- `datetime`: Convert to UTC ISO format, replace `+00:00` with `Z`
- `UUID`: Convert to string

### Hashing Conventions

- Deterministic SHA256: `json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)`
- Hash prefix: `"sha256:" + hex_digest`
- HMAC signatures: Use for `ClassificationAggregationResult.compute_signature()`

---

## Testing Strategy

### Test Organization

Tests are in `tests/integration/` and cover:

1. **Classification Aggregation** (`TestClassificationAggregation`)
   - Multiple classification aggregation
   - HMAC signature verification

2. **Access Control Engine** (`TestAccessControlEngine`)
   - Denial scenarios: insufficient clearance, missing compartments, suspended account, inactive session
   - Allow scenarios: matching clearance/compartments
   - Obligation generation: audit access, MFA step-up

3. **Redaction Rules** (`TestRedactionRules`)
   - Simple field redaction
   - List wildcard redaction (`[*]`)
   - Compartment-based redaction bypass

4. **End-to-End Flow** (`TestEndToEndFlow`)
   - Complete access decision → aggregation flow

### Writing Tests

```python
# Use pytest fixtures for common setup
@pytest.fixture
def engine():
    return AccessControlEngine(ClassificationPolicy(policy_name="Test Policy"))

# Test naming: test_<scenario>_<expected_outcome>
def test_deny_insufficient_clearance(self, engine):
    decision = engine.make_access_decision(...)
    assert not decision.allowed
    assert "Insufficient clearance" in decision.reason
```

---

## Security Considerations

### Fail-Secure Defaults

The system implements deny-by-default security:

1. **Access Control Check Order** (short-circuit on first failure):
   - Account status: deny if suspended
   - Session status: deny if inactive/expired
   - Clearance: deny if user clearance < resource classification
   - Compartments: deny if user missing required compartments
   - Need-to-know: deny if user lacks required roles

2. **Classification Levels** (numeric values for comparison):
   - UNCLASSIFIED (0) < CUI (1) < CONFIDENTIAL (2) < SECRET (3) < TOP_SECRET (4) < TS_SCI (5)

3. **Unknown/Unset Handling**:
   - Unknown posture → treated as most restrictive
   - Missing markings → default to UNCLASSIFIED

### Obligations (Computed After Allow)

- `REQUIRE_MFA_STEP_UP`: Device untrusted on Secret+, or Secret+ without MFA
- `AUDIT_ACCESS`: CUI+ data access
- `MASK_FIELD`/`REDACT_PORTION`: Policy-driven field/portion redaction

### Redaction Strategy

- Redaction is applied **after** access is allowed
- Rules support field paths with `[*]` wildcard for lists
- Compartment checks: user must have ALL required compartments

### Data Integrity

- **Deterministic hashing**: All models support `stable_fingerprint()` (excludes timestamps) and `compute_hash()` (full model)
- **Hash chaining**: `EventEnvelope` includes `hash_chain_prev` for audit trails
- **HMAC signatures**: `ClassificationAggregationResult` supports signing with optional key

### No Non-Deterministic Helpers

- No auto-generated vendor IDs/names
- All IDs must be explicitly provided (UUIDs)
- Hash computations use normalized JSON (sorted keys, compact separators)

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Triggers: Push, Pull Request
- Python version: 3.11
- Steps:
  1. Checkout code
  2. Setup Python
  3. Install with dev dependencies: `pip install -e ".[dev]"`
  4. Run tests: `pytest -q`
  5. Type checking: `mypy aegis_common_schema`

---

## Package Information

- **Name**: `aegis-common-schema`
- **Version**: 1.0.0
- **Schema Version**: 1.0.0 (declared in `base.py`)
- **Python Requires**: >= 3.10
- **License**: (not specified in package metadata)

---

## Reference Documentation

- `docs/system-design.md`: Detailed architecture for classification & redaction
- `docs/ci-workflow-reference.yml`: CI workflow template
