# BarTool

BarTool is a small full-stack cocktail workspace built around a FastAPI backend and a React/Vite frontend. The current product scope is intentionally narrow: contributors should treat this README as the primary reference for what the app actually does today.

## Current product scope

The repository currently supports these implemented workflows:

- Maintain an ingredient inventory with create, list, update, and delete operations.
- Look up a barcode and prefill an ingredient name when adding inventory items.
- Search CocktailDB for recipes, save recipes locally, and view saved recipe details.
- Manage ingredient-name synonyms that help recipe imports map variant names onto existing ingredients.

## Frontend pages that currently exist

The frontend router exposes these pages:

| Route | Page | Status |
| --- | --- | --- |
| `/` | Redirect | Immediately redirects to `/inventory` |
| `/inventory` | Inventory | Fully wired to inventory and barcode APIs |
| `/recipes` | Recipes | Search remote recipes and save them locally |
| `/recipes/:id` | Recipe detail | View one saved recipe |
| `/synonyms` | Synonyms | Fully wired to synonym management APIs |

## Backend API routes that currently exist

The FastAPI app mounts these routes today:

### Ingredients

- `GET /ingredients/` — list ingredients.
- `POST /ingredients/` — create an ingredient.

### Inventory

- `GET /inventory/` — list inventory items with ingredient data.
- `POST /inventory/` — create an inventory item.
- `GET /inventory/{item_id}` — fetch one inventory item.
- `PATCH /inventory/{item_id}` — update quantity or status.
- `DELETE /inventory/{item_id}` — delete an inventory item.

### Recipes

- `GET /recipes/search?q=...` — search CocktailDB-backed recipe results.
- `GET /recipes/` — list locally saved recipes.
- `GET /recipes/{recipe_id}` — fetch one saved recipe.
- `POST /recipes/` — import/save a recipe by name.

### Barcode

- `GET /barcode/{ean}` — look up a barcode.

### Synonyms

- `GET /synonyms/` — list configured synonyms.
- `POST /synonyms/` — create a synonym.
- `DELETE /synonyms/{alias}` — delete a synonym.

## What is intentionally out of scope right now

The repo still contains code scaffolding and historical documents for broader bar-management ideas, but the following are **not** implemented as real end-user features today:

- Shopping-list generation logic or a dedicated shopping-list UI.
- Statistics or analytics pages.
- User profiles, favorites, advanced filtering, or deployment automation.
- A maintained standalone OpenAPI design document separate from the FastAPI code.

Historical planning/spec files were moved to `docs/archive/` so they remain available for context without competing with the current implementation.

## Repository layout

```text
backend/   FastAPI app, SQLAlchemy models, and API tests
frontend/  React/Vite UI with page-level routing
docs/archive/  Historical specs, use cases, and planning notes
```

## Local development

### Backend

Create a Python environment, install dependencies, and run the FastAPI app:

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

The API will be available at `http://localhost:8000` by default.

### Seed data

To generate the local SQLite seed database used by the backend:

```bash
python backend/app/db/seed_db.py
```

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

If your backend is not running on the same origin, set `VITE_API_BASE` when starting the frontend. Example:

```bash
VITE_API_BASE=http://localhost:8000 npm run dev
```

## Contributor guidance

When updating docs, keep this README aligned with the actual router pages in `frontend/src/App.tsx` and the mounted FastAPI routers in `backend/app/main.py`. Avoid documenting demo-only routes or placeholder flows that are not part of the current product experience. If the implemented scope expands materially, update this README first and only add extra documentation when contributors actively need it.
