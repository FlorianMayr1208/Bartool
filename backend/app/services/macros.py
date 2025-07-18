"""Classify ingredients and recipes using keyword macros."""

from __future__ import annotations

import re
import unicodedata
from pathlib import Path

import yaml

_FILE = Path(__file__).with_name("macros.yaml")


def _load_macros() -> dict[str, list[str]]:
    if not _FILE.exists():
        return {}
    with _FILE.open() as f:
        data = yaml.safe_load(f) or {}
    return {k: [w.lower() for w in v] for k, v in data.items()}


MACROS = _load_macros()


def list_macros() -> list[str]:
    """Return all available macro names sorted alphabetically."""
    return sorted(MACROS.keys())

# simple set of common words to ignore
STOP_WORDS = {
    "of",
    "the",
    "and",
    "juice",
    "saft",
}


def normalize(text: str) -> str:
    """Lowercase text and strip diacritics."""
    text = text.strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text


def tokenize(text: str) -> list[str]:
    text = normalize(text)
    tokens = re.split(r"[\s,/()+-]+", text)
    return [t for t in tokens if t and t not in STOP_WORDS]


def macros_for_tokens(tokens: list[str]) -> list[str]:
    hits: set[str] = set()
    for token in tokens:
        for macro, words in MACROS.items():
            if any(word in token for word in words):
                hits.add(macro)
    return list(hits)


def macros_for_ingredient(name: str) -> list[str]:
    """Return macro keywords for a single ingredient name."""
    return macros_for_tokens(tokenize(name))


def classify_recipe(recipe) -> dict[str, int]:
    """Return macro hit counts for a recipe object or dict."""
    scores: dict[str, int] = {}
    for ing in getattr(recipe, "ingredients", []):
        if isinstance(ing, dict):
            name = ing.get("name", "")
        else:
            name = getattr(ing, "name", "")
        for macro in macros_for_ingredient(name):
            scores[macro] = scores.get(macro, 0) + 1
    return scores


def macros_for_recipe(recipe) -> list[str]:
    """Return macro keywords present in a recipe object or dict."""
    return list(classify_recipe(recipe).keys())
