import httpx
from typing import Optional, Dict

# Simple in-memory cache
_cache: Dict[str, Dict] = {}

API_URL = "https://world.openfoodfacts.org/api/v0/product"

async def fetch_barcode(ean: str) -> Optional[Dict]:
    if ean in _cache:
        return _cache[ean]
    url = f"{API_URL}/{ean}.json"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") != 1:
            return None
        result = {"name": data.get("product", {}).get("product_name")}
        _cache[ean] = result
        return result
