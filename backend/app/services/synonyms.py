"""Manage ingredient synonym mappings."""

from __future__ import annotations

import json
from pathlib import Path


_FILE = Path(__file__).with_name("synonyms.json")

try:
    with _FILE.open() as f:
        ALIASES: dict[str, str] = json.load(f)
except FileNotFoundError:  # pragma: no cover - default when file missing
    ALIASES = {
        "dark rum": "Rum",
        "white rum": "Rum",
        "fresh lime juice": "Lime juice",
    }
    with _FILE.open("w") as f:  # ensure default file exists
        json.dump(ALIASES, f, indent=2)


def _save() -> None:
    with _FILE.open("w") as f:
        json.dump(ALIASES, f, indent=2)


def list_synonyms() -> list[dict[str, str]]:
    """Return all known aliases."""
    return [{"alias": a, "canonical": c} for a, c in ALIASES.items()]


def add_synonym(alias: str, canonical: str) -> dict[str, str]:
    """Add or update a synonym mapping."""
    ALIASES[alias.strip().lower()] = canonical.strip().title()
    _save()
    return {"alias": alias.strip().lower(), "canonical": canonical.strip().title()}


def delete_synonym(alias: str) -> None:
    """Remove a synonym if present."""
    ALIASES.pop(alias.strip().lower(), None)
    _save()


def canonical_name(name: str) -> str:
    """Return a normalized ingredient name using known aliases."""
    key = name.strip().lower()
    if key in ALIASES:
        return ALIASES[key]
    return name.strip().title()
