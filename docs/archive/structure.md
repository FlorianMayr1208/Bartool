# Current repository structure overview

This snapshot reflects the local-only application scope that is currently implemented in the repo.

```text
Bartool/
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI routes for ingredients, inventory, recipes, and synonyms
│   │   │   ├── __init__.py
│   │   │   ├── ingredients.py
│   │   │   ├── inventory.py
│   │   │   ├── recipes.py
│   │   │   └── synonyms.py
│   │   ├── db/                 # SQLAlchemy models, Pydantic schemas, CRUD helpers, DB setup
│   │   │   ├── __init__.py
│   │   │   ├── crud.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── seed_db.py
│   │   │   └── session.py
│   │   ├── services/           # Local service helpers (for example synonym normalization)
│   │   │   ├── __init__.py
│   │   │   ├── synonyms.json
│   │   │   └── synonyms.py
│   │   └── main.py             # FastAPI application entry point
│   └── tests/                  # API tests
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared UI such as navigation
│   │   ├── pages/              # Inventory, recipes, recipe detail, and synonyms pages
│   │   ├── api.ts              # Frontend API client wrappers
│   │   ├── App.tsx             # React router setup
│   │   └── main.tsx            # Frontend entry point
│   ├── package.json
│   └── package-lock.json
├── docs/archive/               # Historical planning/spec material and lightweight architecture notes
└── README.md                   # Source of truth for current product scope
```
