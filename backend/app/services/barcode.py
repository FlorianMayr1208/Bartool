import httpx
import json
from datetime import datetime, timedelta
from typing import Optional, Dict
from sqlalchemy.orm import Session

from ..db import crud

# Simple in-memory cache
_cache: Dict[str, Dict] = {}

API_URL = "https://world.openfoodfacts.org/api/v0/product"

async def fetch_barcode(ean: str, db: Session) -> Optional[Dict]:
    if ean in _cache:
        return _cache[ean]

    entry = crud.get_barcode_cache(db, ean)
    if entry:
        if datetime.utcnow() - entry.fetched_at < timedelta(days=30):
            data = json.loads(entry.data)
            result = {"name": data.get("product", {}).get("product_name")}
            _cache[ean] = result
            return result

    url = f"{API_URL}/{ean}.json"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get("status") != 1:
            return None
    crud.upsert_barcode_cache(db, ean, data)
    result = {"name": data.get("product", {}).get("product_name")}
    _cache[ean] = result
    return result
