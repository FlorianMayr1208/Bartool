import httpx

API_BASE = "https://www.thecocktaildb.com/api/json/v1/1"

async def fetch_recipe_name(name: str) -> str | None:
    url = f"{API_BASE}/search.php"
    params = {"s": name}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        drinks = data.get("drinks")
        if not drinks:
            return None
        return drinks[0].get("strDrink")


async def search_recipes(name: str) -> list[str]:
    """Return a list of recipe names matching the search term."""
    url = f"{API_BASE}/search.php"
    params = {"s": name}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        drinks = data.get("drinks") or []
        return [d.get("strDrink") for d in drinks if d.get("strDrink")]
