import pytest

from backend.app.services.unit_conversion import to_metric, with_metric


@pytest.mark.parametrize(
    "measure,expected",
    [
        ("2 oz", "60 ml"),
        ("1 oz", "30 ml"),
        ("1/2 oz", "15 ml"),
        ("1 1/2 oz", "45 ml"),
        ("3 tsp", "15 ml"),
    ],
)
def test_to_metric(measure, expected):
    assert to_metric(measure) == expected


def test_to_metric_unknown():
    assert to_metric("2 parts") is None


@pytest.mark.parametrize(
    "measure,expected",
    [
        ("2 oz", "2 oz (60 ml)"),
        ("3 tsp", "3 tsp (15 ml)"),
        ("30 ml", "30 ml"),
    ],
)
def test_with_metric(measure, expected):
    assert with_metric(measure) == expected
