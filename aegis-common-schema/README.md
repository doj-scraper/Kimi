# Aegis Common Schema (MVP)

Canonical Pydantic v2 models and policy/obligation primitives used across Aegis modules.

## What’s included

- Base types: classification levels, markings, deterministic hashing helpers
- Policy & obligations: redaction rules, access decisions, aggregation result
- Access control engine: fail-secure decision flow + obligation computation
- Supply chain models: SBOM/HBOM, vulnerabilities, deterministic VRS inputs/outputs
- Integration tests: end-to-end classification/redaction flow

## Local dev

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest -q
mypy aegis_common_schema
```
