from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from .api import (
    ingredients,
    recipes,
    inventory,
    barcode,
    search,
    tags,
    categories,
    synonyms,
    unit_synonyms,
    shopping_list,
    suggestions,
    db_admin,
)

app = FastAPI(title="Bar Management")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def error_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    except Exception:
        logging.exception("Unhandled error")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "hello world"}


app.include_router(ingredients.router, prefix="/ingredients")
app.include_router(recipes.router, prefix="/recipes")
app.include_router(inventory.router, prefix="/inventory")
app.include_router(barcode.router, prefix="/barcode")
app.include_router(search.router, prefix="/search")
app.include_router(tags.router, prefix="/tags")
app.include_router(categories.router, prefix="/categories")
app.include_router(synonyms.router, prefix="/synonyms")
app.include_router(unit_synonyms.router, prefix="/unit-synonyms")
app.include_router(shopping_list.router, prefix="/shopping-list")
app.include_router(db_admin.router, prefix="/db")
app.include_router(suggestions.router, prefix="/suggestions")

