import httpx
from typing import Optional, Dict, Tuple
from sqlalchemy.orm import Session

from ..db import crud
import json

# Simple in-memory cache
_cache: Dict[str, Dict] = {}

API_URL = "https://world.openfoodfacts.org/api/v0/product"

async def fetch_barcode(ean: str, db: Session) -> Tuple[Optional[Dict], bool]:
    """Fetch barcode information, returning data and cache flag."""
    if ean in _cache:
        return _cache[ean], True

    entry = crud.get_barcode_cache(db, ean)
    if entry:
        data = json.loads(entry.json)
        _cache[ean] = data
        return data, True

    url = f"{API_URL}/{ean}.json"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
    if resp.status_code != 200:
        return None, False
    data = resp.json()
    if data.get("status") != 1:
        return None, False
    product = data.get("product", {})
    result = {
        "name": product.get("product_name"),
        "brand": product.get("brands"),
        "image_url": product.get("image_front_url"),
        "keywords": product.get("_keywords", []),
    }
    crud.store_barcode_cache(db, ean, data)
    _cache[ean] = result
    return result, False
