"""Convert common US/imperial units to metric."""

from __future__ import annotations

from fractions import Fraction

from .unit_synonyms import canonical_name

# Conversion factors to milliliters for canonical units
CONVERSION_TO_ML: dict[str, float] = {
    "ml": 1.0,
    "cl": 10.0,
    "l": 1000.0,
    "tsp": 5.0,
    "tbsp": 15.0,
    "oz": 30.0,
    "jigger": 45.0,
    "shot": 44.0,
    "cup": 240.0,
    "pt": 475.0,
    "qt": 946.0,
    "gal": 3785.0,
}


def _parse_measure(measure: str | None) -> tuple[float, str] | None:
    """Return numeric amount and canonical unit from a measure string."""
    if not measure:
        return None
    parts = measure.strip().split()
    if not parts:
        return None
    qty = 0.0
    idx = 0
    # allow quantities like "1 1/2" or "1/2"
    while idx < len(parts):
        try:
            qty += float(Fraction(parts[idx]))
            idx += 1
        except (ValueError, ZeroDivisionError):
            break
    if idx >= len(parts):
        return None
    unit = " ".join(parts[idx:]).strip()
    if not unit:
        return None
    unit = canonical_name(unit)
    return qty, unit


def to_metric(measure: str | None) -> str | None:
    """Return a metric representation of a measure string.

    Examples:
        >>> to_metric("2 oz")
        '60 ml'
    """
    parsed = _parse_measure(measure)
    if not parsed:
        return None
    qty, unit = parsed
    factor = CONVERSION_TO_ML.get(unit)
    if factor is None:
        return None
    ml_value = qty * factor
    if ml_value >= 1000:
        liters = ml_value / 1000
        if liters.is_integer():
            return f"{int(liters)} l"
        return f"{liters:.1f} l"
    if ml_value.is_integer():
        return f"{int(ml_value)} ml"
    return f"{ml_value:.1f} ml"


def with_metric(measure: str | None) -> str | None:
    """Return measure with metric equivalent appended if needed."""
    parsed = _parse_measure(measure)
    if not parsed:
        return measure
    _, unit = parsed
    if unit in {"ml", "cl", "l"}:
        return measure
    metric = to_metric(measure)
    if metric:
        return f"{measure} ({metric})"
    return measure

