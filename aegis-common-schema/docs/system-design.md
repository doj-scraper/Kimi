# Aegis System Design: Classification & Redaction Architecture

## Overview

This document specifies how Aegis enforces classification-aware access control and deterministic redaction. The system implements fail-secure defaults: deny by default, allow only when all checks pass.

## 1. Classification Aggregation

### 1.1 Highest Classification Computation

When a user views a resource (incident, alert, threat intel), the system must compute the highest classification level of all visible data and display it in the UI banner.

Algorithm:

- Input: List of entities visible to user
  - incidents[*].classification
  - related_alerts[*].classification
  - evidence_items[*].classification
  - threat_intel[*].classification
- Output: ClassificationAggregationResult
  - highest_classification: max(all classifications)
  - all_portion_markings: union of all portion markings
  - all_compartments: union of all compartments
  - signature: HMAC-SHA256(result, signing_key) (optional defense-in-depth)

Example aggregation:

```json
{
  "highest_classification": "TS",
  "all_portion_markings": ["//NOFORN", "//HUMINT"],
  "all_compartments": ["NOFORN", "HUMINT"],
  "signature": "abc123def456..."
}
```

Implementation note: the UI banner should be populated from the aggregation result over the response payload (not from the resource access decision alone).

### 1.2 Portion Marking Aggregation

Portion markings are aggregated via set union across all visible entities.

Display rule (Astro UXDS style):

- Top banner: [HIGHEST_CLASSIFICATION] | [PORTION_MARKINGS]
- Example: [TOP SECRET] | [//NOFORN] [//HUMINT]

## 2. Access Control Decision Flow

### 2.1 Fail-Secure Checks (All Must Pass)

Check order (short-circuit on first failure):

1. Account status: user not suspended
2. Session status: session active and not expired
3. Clearance: user_clearance >= resource_classification
4. Compartments: user_compartments ⊇ resource_compartments
5. Need-to-know (ABAC): user satisfies resource attributes (if present)

If any check fails: deny.

### 2.2 Conditional Checks (Trigger Obligations)

If all fail-secure checks pass, compute obligations such as:

- require_mfa_step_up (device untrusted for Secret+; or Secret+ without MFA)
- audit_access (CUI+)
- mask_field / redact_portion (policy-driven)

## 3. Redaction Rules

### 3.1 Field-Level Redaction

FieldRedactionRule defines how to redact a field path (supports a limited wildcard segment [*]).

### 3.2 Portion-Level Redaction

PortionRedactionRule defines how to hide a named portion (remove field or mask).

## 4. Implementation Layers

- DB: PostgreSQL RLS for row filtering
- API: middleware performs access decision, then redaction, then classification aggregation and headers
- UI: banners/portion markings render from server-provided headers and response content

## 5. Audit Trail & Immutability

All access decisions must be logged. Hash chaining and (optional) HMAC signatures provide tamper evidence.

## 6. Fail-Secure Defaults

- Default deny
- Unknown posture / unknown markings treated as most restrictive
- Audit all decisions for CUI+ access
