from typing import List, Optional
from app.models.rule import Rule, RuleOperator, RuleAction

def evaluate_rules(transaction: dict, rules: List[Rule]) -> Optional[dict]:
    """
    Run all active rules against a transaction.
    Returns the highest priority triggered rule or None.
    """
    triggered = []

    for rule in rules:
        if not rule.is_active:
            continue

        field_value = _get_field_value(transaction, rule.field)
        if field_value is None:
            continue

        if _evaluate_condition(field_value, rule.operator, rule.value):
            triggered.append(rule)

    if not triggered:
        return None

    # Return highest priority triggered rule
    triggered.sort(key=lambda r: r.priority, reverse=True)
    top_rule = triggered[0]

    return {
        "rule_id"    : str(top_rule.id),
        "rule_name"  : top_rule.name,
        "action"     : top_rule.action.value,
        "field"      : top_rule.field,
        "operator"   : top_rule.operator.value,
        "value"      : top_rule.value,
        "description": top_rule.description
    }

def _get_field_value(transaction: dict, field: str) -> Optional[float]:
    """Extract field value from transaction dict."""
    mapping = {
        "amount"         : transaction.get("amount", 0),
        "fraud_score"    : transaction.get("fraud_score", 0),
        "is_new_device"  : 1 if transaction.get("device_id") and
                           transaction.get("device_id", "").startswith("new") else 0,
        "is_night"       : _is_night(),
        "is_round_amount": 1 if transaction.get("amount", 0) % 10 == 0 else 0,
        "is_small_amount": 1 if transaction.get("amount", 0) < 10 else 0,
    }
    return mapping.get(field)

def _evaluate_condition(field_value: float, operator: RuleOperator, rule_value: float) -> bool:
    """Evaluate a single rule condition."""
    if operator == RuleOperator.greater_than:
        return field_value > rule_value
    elif operator == RuleOperator.less_than:
        return field_value < rule_value
    elif operator == RuleOperator.equals:
        return field_value == rule_value
    elif operator == RuleOperator.not_equals:
        return field_value != rule_value
    return False

def _is_night() -> int:
    from datetime import datetime
    hour = datetime.now().hour
    return 1 if (hour >= 22 or hour <= 5) else 0