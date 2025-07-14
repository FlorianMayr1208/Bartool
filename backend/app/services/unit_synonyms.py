"""Manage measurement unit synonym mappings."""

from __future__ import annotations

import json
from pathlib import Path

_FILE = Path(__file__).with_name("unit_synonyms.json")

try:
    with _FILE.open() as f:
        ALIASES: dict[str, str] = json.load(f)
except FileNotFoundError:  # pragma: no cover - default when file missing
    ALIASES = {
        "ounce": "oz",
        "ounces": "oz",
        "milliliter": "ml",
        "milliliters": "ml",
    }
    with _FILE.open("w") as f:
        json.dump(ALIASES, f, indent=2)


def _save() -> None:
    with _FILE.open("w") as f:
        json.dump(ALIASES, f, indent=2)


def canonical_name(name: str) -> str:
    """Return a normalized unit name using known aliases."""
    key = name.strip().lower()
    if key in ALIASES:
        return ALIASES[key]
    return name.strip().lower()


def add_synonym(alias: str, canonical: str) -> dict[str, str]:
    ALIASES[alias.strip().lower()] = canonical.strip().lower()
    _save()
    return {"alias": alias.strip().lower(), "canonical": canonical.strip().lower()}


def delete_synonym(alias: str) -> None:
    ALIASES.pop(alias.strip().lower(), None)
    _save()


def list_synonyms() -> list[dict[str, str]]:
    return [{"alias": a, "canonical": c} for a, c in ALIASES.items()]


def import_synonyms(mapping: dict[str, str]) -> None:
    """Import multiple unit synonyms."""
    for alias, canonical in mapping.items():
        ALIASES[alias.strip().lower()] = canonical.strip().lower()
    _save()
