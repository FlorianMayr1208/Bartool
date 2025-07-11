ALIASES = {
    "dark rum": "Rum",
    "white rum": "Rum",
    "fresh lime juice": "Lime juice",
}


def canonical_name(name: str) -> str:
    """Return a normalized ingredient name using known aliases."""
    key = name.strip().lower()
    if key in ALIASES:
        return ALIASES[key]
    return name.strip().title()
