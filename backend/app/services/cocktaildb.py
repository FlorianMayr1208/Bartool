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
