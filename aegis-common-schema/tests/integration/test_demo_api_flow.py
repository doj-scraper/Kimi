import pytest
from fastapi.testclient import TestClient

from apps.aegis_demo_api.main import app

client = TestClient(app)


def test_demo_incident_headers_and_redaction():
    incident_id = "00000000-0000-0000-0000-000000000001"

    # User lacks HUMINT -> emails redacted
    r = client.get(
        f"/demo/incidents/{incident_id}",
        headers={
            "X-User-Clearance": "S",
            "X-User-Compartments": "NOFORN",
            "X-User-Roles": "analyst",
            "X-User-MFA-Verified": "true",
            "X-User-Suspended": "false",
            "X-Device-Posture": "trusted",
            "X-Session-Active": "true",
        },
    )

    assert r.status_code == 200

    # Banner aggregation should reflect related TOP_SECRET alert => TS
    assert r.headers["X-Classification"] == "TS"
    assert "//NOFORN" in r.headers.get("X-Portion-Markings", "")
    assert "//HUMINT" in r.headers.get("X-Portion-Markings", "")

    body = r.json()
    users = body["incident"]["affected_users"]
    assert users[0]["email"] == "[REDACTED]"
    assert users[1]["email"] == "[REDACTED]"


def test_demo_incident_denied_missing_compartment():
    incident_id = "00000000-0000-0000-0000-000000000002"

    # Resource requires NOFORN (hardcoded); user has none -> deny
    r = client.get(
        f"/demo/incidents/{incident_id}",
        headers={
            "X-User-Clearance": "S",
            "X-User-Compartments": "",  # missing NOFORN
        },
    )
    assert r.status_code == 403


def test_demo_incident_no_redaction_with_humint():
    """When user has HUMINT compartment, emails should NOT be redacted."""
    incident_id = "00000000-0000-0000-0000-000000000003"

    r = client.get(
        f"/demo/incidents/{incident_id}",
        headers={
            "X-User-Clearance": "S",
            "X-User-Compartments": "NOFORN,HUMINT",
            "X-User-Roles": "analyst",
            "X-User-MFA-Verified": "true",
            "X-User-Suspended": "false",
            "X-Device-Posture": "trusted",
            "X-Session-Active": "true",
        },
    )

    assert r.status_code == 200

    body = r.json()
    users = body["incident"]["affected_users"]
    # With HUMINT, emails should NOT be redacted
    assert users[0]["email"] == "alice@agency.gov"
    assert users[1]["email"] == "bob@agency.gov"


def test_health_endpoint():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_demo_incident_denied_insufficient_clearance():
    """User with CUI clearance trying to access SECRET resource should be denied."""
    incident_id = "00000000-0000-0000-0000-000000000004"

    r = client.get(
        f"/demo/incidents/{incident_id}",
        headers={
            "X-User-Clearance": "CUI",
            "X-User-Compartments": "NOFORN",
            "X-User-Roles": "analyst",
            "X-User-MFA-Verified": "true",
            "X-User-Suspended": "false",
            "X-Device-Posture": "trusted",
            "X-Session-Active": "true",
        },
    )

    assert r.status_code == 403
    assert "Insufficient clearance" in r.json()["error"]


def test_demo_incident_denied_suspended_account():
    """Suspended user should be denied access."""
    incident_id = "00000000-0000-0000-0000-000000000005"

    r = client.get(
        f"/demo/incidents/{incident_id}",
        headers={
            "X-User-Clearance": "S",
            "X-User-Compartments": "NOFORN",
            "X-User-Roles": "analyst",
            "X-User-MFA-Verified": "true",
            "X-User-Suspended": "true",  # account suspended
            "X-Device-Posture": "trusted",
            "X-Session-Active": "true",
        },
    )

    assert r.status_code == 403
    assert "suspended" in r.json()["error"].lower()


def test_demo_incident_denied_inactive_session():
    """Inactive session should be denied."""
    incident_id = "00000000-0000-0000-0000-000000000006"

    r = client.get(
        f"/demo/incidents/{incident_id}",
        headers={
            "X-User-Clearance": "S",
            "X-User-Compartments": "NOFORN",
            "X-User-Roles": "analyst",
            "X-User-MFA-Verified": "true",
            "X-User-Suspended": "false",
            "X-Device-Posture": "trusted",
            "X-Session-Active": "false",  # session inactive
        },
    )

    assert r.status_code == 403
    assert "not active" in r.json()["error"].lower()
