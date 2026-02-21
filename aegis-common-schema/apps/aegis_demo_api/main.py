from __future__ import annotations

from uuid import UUID, uuid4
from typing import List, Optional

from fastapi import FastAPI, Header, Response
from fastapi.responses import JSONResponse

from aegis_common_schema.base import ClassificationLevel, Compartment

from .security_context import evaluate_and_render

app = FastAPI(title="Aegis Demo API", version="0.1.0")


def _parse_compartments(raw: Optional[str]) -> List[Compartment]:
    """
    Accepts "NOFORN,HUMINT" -> [Compartment.NOFORN, Compartment.HUMINT]
    """
    if not raw:
        return []
    items = [x.strip() for x in raw.split(",") if x.strip()]
    return [Compartment(i) for i in items]


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/demo/incidents/{incident_id}")
def get_demo_incident(
    incident_id: UUID,
    response: Response,
    # demo "auth context" via headers (replace with JWT later)
    x_user_id: Optional[UUID] = Header(default=None),
    x_user_clearance: str = Header(default=ClassificationLevel.SECRET.value),
    x_user_compartments: Optional[str] = Header(default=None),
    x_user_roles: Optional[str] = Header(default="analyst"),
    x_user_mfa_verified: bool = Header(default=True),
    x_user_suspended: bool = Header(default=False),
    x_device_posture: str = Header(default="trusted"),
    x_session_active: bool = Header(default=True),
):
    user_id = x_user_id or uuid4()
    user_clearance = ClassificationLevel(x_user_clearance)
    user_compartments = _parse_compartments(x_user_compartments)
    user_roles = [r.strip() for r in (x_user_roles or "").split(",") if r.strip()]

    # Demo payload includes a related alert at higher classification to prove banner aggregation
    incident_payload = {
        "id": str(incident_id),
        "title": "Phishing Campaign (Demo)",
        "classification": ClassificationLevel.SECRET.value,
        "portion_markings": ["//NOFORN"],
        "compartments": [Compartment.NOFORN],
        "incident": {
            "affected_users": [
                {"name": "Alice Smith", "email": "alice@agency.gov"},
                {"name": "Bob Jones", "email": "bob@agency.gov"},
            ]
        },
        "related_alerts": [
            {
                "id": str(uuid4()),
                "classification": ClassificationLevel.TOP_SECRET.value,
                "portion_markings": ["//HUMINT"],
                "compartments": [Compartment.HUMINT],
                "summary": "Related alert at higher classification (demo).",
            }
        ],
    }

    allowed, reason, headers, body = evaluate_and_render(
        user_id=user_id,
        user_clearance=user_clearance,
        user_compartments=user_compartments,
        user_roles=user_roles,
        user_mfa_verified=x_user_mfa_verified,
        user_account_suspended=x_user_suspended,
        device_posture=x_device_posture,
        session_active=x_session_active,
        resource_classification=ClassificationLevel.SECRET,
        resource_compartments=[Compartment.NOFORN],
        incident_payload=incident_payload,
        signing_key="demo-signing-key",  # replace with Vault later
    )

    if not allowed:
        return JSONResponse(status_code=403, content=body)

    for k, v in headers.items():
        response.headers[k] = v

    return body
