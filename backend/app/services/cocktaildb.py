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


async def search_recipes_details(name: str) -> list[dict]:
    """Return basic recipe information for matches."""
    url = f"{API_BASE}/search.php"
    params = {"s": name}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        drinks = data.get("drinks") or []
        results = []
        for d in drinks:
            results.append(
                {
                    "name": d.get("strDrink"),
                    "alcoholic": d.get("strAlcoholic"),
                    "instructions": d.get("strInstructions"),
                    "thumb": d.get("strDrinkThumb"),
                }
            )
        return results


async def fetch_recipe_details(name: str) -> dict | None:
    """Fetch detailed recipe information for the first matching drink."""
    url = f"{API_BASE}/search.php"
    params = {"s": name}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        drinks = data.get("drinks")
        if not drinks:
            return None
        d = drinks[0]
        tags = [t.strip() for t in (d.get("strTags") or "").split(",") if t.strip()]
        categories = [c.strip() for c in (d.get("strCategory") or "").split(",") if c.strip()]
        ibas = [i.strip() for i in (d.get("strIBA") or "").split(",") if i.strip()]
        ingredients = []
        for i in range(1, 16):
            ing = d.get(f"strIngredient{i}")
            meas = d.get(f"strMeasure{i}")
            if ing:
                ingredients.append({"name": ing, "measure": meas})
        return {
            "name": d.get("strDrink"),
            "alcoholic": d.get("strAlcoholic"),
            "instructions": d.get("strInstructions"),
            "thumb": d.get("strDrinkThumb"),
            "tags": tags,
            "categories": categories,
            "ibas": ibas,
            "ingredients": ingredients,
        }
