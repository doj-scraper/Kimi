"""Integration tests: classification, access decisions, redaction.

Run:
  pip install -e .
  pytest -q
"""

import pytest
from uuid import uuid4

from aegis_common_schema.base import ClassificationLevel, Compartment
from aegis_common_schema.policy_obligations import (
    ClassificationPolicy,
    FieldRedactionRule,
    PortionRedactionRule,
    RedactionStrategy,
    ObligationType,
    ClassificationAggregationResult,
)
from aegis_common_schema.access_control_engine import AccessControlEngine


class TestClassificationAggregation:
    def test_aggregate_multiple_classifications(self):
        entities = [
            {"classification": ClassificationLevel.SECRET, "portion_markings": ["//NOFORN"]},
            {"classification": ClassificationLevel.TOP_SECRET, "portion_markings": ["//HUMINT"]},
            {"classification": ClassificationLevel.SECRET, "portion_markings": ["//NOCONTRACT"]},
        ]

        result = ClassificationAggregationResult.aggregate(entities)

        assert result.highest_classification == ClassificationLevel.TOP_SECRET
        assert len(result.all_classifications) == 3
        assert set(result.all_portion_markings) == {"//NOFORN", "//HUMINT", "//NOCONTRACT"}

    def test_aggregate_with_signature(self):
        entities = [{"classification": ClassificationLevel.SECRET, "portion_markings": ["//NOFORN"]}]
        signing_key = "test-signing-key-12345"
        result = ClassificationAggregationResult.aggregate(entities, signing_key=signing_key)

        assert result.signature is not None
        assert len(result.signature) == 64


class TestAccessControlEngine:
    @pytest.fixture
    def engine(self):
        return AccessControlEngine(ClassificationPolicy(policy_name="Test Policy"))

    def test_deny_insufficient_clearance(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.TOP_SECRET,
            resource_compartments=[Compartment.NOFORN],
            device_posture="trusted",
            session_active=True,
        )
        assert not decision.allowed
        assert "Insufficient clearance" in decision.reason

    def test_deny_missing_compartments(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.SECRET,
            resource_compartments=[Compartment.NOFORN, Compartment.HUMINT],
            device_posture="trusted",
            session_active=True,
        )
        assert not decision.allowed
        assert "Missing compartments" in decision.reason

    def test_allow_matching_clearance_and_compartments(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN, Compartment.HUMINT],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.SECRET,
            resource_compartments=[Compartment.NOFORN, Compartment.HUMINT],
            device_posture="trusted",
            session_active=True,
        )
        assert decision.allowed
        assert decision.reason == "All access control checks passed"

    def test_deny_suspended_account(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=True,
            resource_classification=ClassificationLevel.UNCLASSIFIED,
            resource_compartments=[],
            device_posture="trusted",
            session_active=True,
        )
        assert not decision.allowed
        assert "suspended" in decision.reason.lower()

    def test_deny_inactive_session(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.UNCLASSIFIED,
            resource_compartments=[],
            device_posture="trusted",
            session_active=False,
        )
        assert not decision.allowed
        assert "not active" in decision.reason.lower()

    def test_obligation_audit_access_for_classified_data(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.CUI,
            user_compartments=[],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.CUI,
            resource_compartments=[],
            device_posture="trusted",
            session_active=True,
        )
        assert decision.allowed
        assert any(o.obligation_type == ObligationType.AUDIT_ACCESS for o in decision.obligations)

    def test_obligation_mfa_for_untrusted_device(self, engine):
        decision = engine.make_access_decision(
            user_id=uuid4(),
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[],
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.SECRET,
            resource_compartments=[],
            device_posture="untrusted",
            session_active=True,
        )
        assert decision.allowed
        assert any(o.obligation_type == ObligationType.REQUIRE_MFA_STEP_UP for o in decision.obligations)


class TestRedactionRules:
    @pytest.fixture
    def policy_with_redaction(self):
        policy = ClassificationPolicy(policy_name="Redaction Policy")

        policy.field_redaction_rules.append(
            FieldRedactionRule(
                field_path="user.email",
                field_type="email",
                strategy=RedactionStrategy.MASK_WITH_BRACKETS,
                required_clearance=ClassificationLevel.SECRET,
            )
        )

        policy.field_redaction_rules.append(
            FieldRedactionRule(
                field_path="incident.affected_users[*].email",
                field_type="email",
                strategy=RedactionStrategy.MASK_WITH_BRACKETS,
                required_clearance=ClassificationLevel.SECRET,
                required_compartments=[Compartment.HUMINT],
            )
        )

        policy.portion_redaction_rules.append(
            PortionRedactionRule(
                portion_name="classified_section",
                portion_marking="//TS//SCI",
                minimum_clearance=ClassificationLevel.TS_SCI,
                strategy=RedactionStrategy.REMOVE_FIELD,
            )
        )

        return policy

    def test_field_redaction_applied_simple(self, policy_with_redaction):
        engine = AccessControlEngine(policy_with_redaction)
        data = {"user": {"name": "Alice Smith", "email": "alice@agency.gov"}}

        redacted = engine.apply_redaction(
            data,
            user_clearance=ClassificationLevel.CUI,
            user_compartments=[],
        )

        assert redacted["user"]["name"] == "Alice Smith"
        assert redacted["user"]["email"] == "[REDACTED]"

    def test_field_redaction_list_wildcard(self, policy_with_redaction):
        engine = AccessControlEngine(policy_with_redaction)
        data = {
            "incident": {
                "affected_users": [
                    {"name": "Alice", "email": "alice@agency.gov"},
                    {"name": "Bob", "email": "bob@agency.gov"},
                ]
            }
        }

        redacted = engine.apply_redaction(
            data,
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN],
        )

        assert redacted["incident"]["affected_users"][0]["email"] == "[REDACTED]"
        assert redacted["incident"]["affected_users"][1]["email"] == "[REDACTED]"

    def test_field_not_redacted_when_compartment_sufficient(self, policy_with_redaction):
        engine = AccessControlEngine(policy_with_redaction)
        data = {"incident": {"affected_users": [{"name": "Alice", "email": "alice@agency.gov"}]}}

        redacted = engine.apply_redaction(
            data,
            user_clearance=ClassificationLevel.SECRET,
            user_compartments=[Compartment.NOFORN, Compartment.HUMINT],
        )

        assert redacted["incident"]["affected_users"][0]["email"] == "alice@agency.gov"


class TestEndToEndFlow:
    def test_incident_access_with_aggregation_and_banner_values(self):
        policy = ClassificationPolicy(policy_name="E2E Test Policy")
        engine = AccessControlEngine(policy)

        user_id = uuid4()
        user_clearance = ClassificationLevel.SECRET
        user_compartments = [Compartment.NOFORN]

        incident_data = {
            "id": str(uuid4()),
            "title": "Phishing Campaign",
            "classification": ClassificationLevel.SECRET.value,
            "portion_markings": ["//NOFORN"],
            "compartments": [Compartment.NOFORN],
            "related_alerts": [
                {
                    "id": str(uuid4()),
                    "classification": ClassificationLevel.TOP_SECRET.value,
                    "portion_markings": ["//HUMINT"],
                    "compartments": [Compartment.HUMINT],
                }
            ],
        }

        decision = engine.make_access_decision(
            user_id=user_id,
            user_clearance=user_clearance,
            user_compartments=user_compartments,
            user_roles=["analyst"],
            user_mfa_verified=True,
            user_account_suspended=False,
            resource_classification=ClassificationLevel.SECRET,
            resource_compartments=[Compartment.NOFORN],
            device_posture="trusted",
            session_active=True,
        )
        assert decision.allowed

        entities_for_agg = [
            {
                "classification": ClassificationLevel(incident_data["classification"]),
                "portion_markings": incident_data["portion_markings"],
                "compartments": incident_data["compartments"],
            },
            *[
                {
                    "classification": ClassificationLevel(a["classification"]),
                    "portion_markings": a["portion_markings"],
                    "compartments": a["compartments"],
                }
                for a in incident_data["related_alerts"]
            ],
        ]

        agg = ClassificationAggregationResult.aggregate(entities_for_agg)

        assert agg.highest_classification == ClassificationLevel.TOP_SECRET
        assert set(agg.all_portion_markings) == {"//NOFORN", "//HUMINT"}
