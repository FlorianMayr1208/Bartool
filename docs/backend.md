# Backend Documentation

The backend is implemented with **FastAPI** and uses **SQLAlchemy** for database access. Its main responsibility is to provide a RESTful API that the frontend can consume. The backend was designed to be small and easy to run on a single board computer such as a Raspberry Pi.

## Structure

The code lives under `backend/app` and is split into several modules:

- `api/` – route handlers grouped by resource (ingredients, recipes, inventory and so on)
- `db/` – SQLAlchemy models, CRUD functions and the session helper
- `services/` – integrations with third-party APIs like Open Food Facts or thecocktaildb
- `main.py` – application entry point that mounts all routers and configures middleware

The database schema is created on start if it does not yet exist. A helper script `backend/app/db/seed_db.py` inserts some sample data for development purposes.

### Dependencies

All Python dependencies are listed in `requirements.txt`. Install them with:

```bash
pip install -r requirements.txt
```

During development the backend can be started with Uvicorn:

```bash
uvicorn backend.app.main:app --reload
```

### API Overview

The API exposes endpoints for managing ingredients, recipes, inventory items and shopping lists. The complete path definitions can be inspected in `openapi_paths.yaml` and when running the server the interactive Swagger UI is available at `http://localhost:8000/docs`.

Each router in `backend/app/api` corresponds to a domain of the application:

- `ingredients.py`
- `recipes.py`
- `inventory.py`
- `shopping_list.py`
- `search.py` and others

Models are defined in `backend/app/db/models.py` and the Pydantic schemas reside in `backend/app/db/schemas.py`.

### Tests

Unit and integration tests are located in `backend/tests`. They can be executed with:

```bash
pytest
```

The tests spin up the FastAPI app with an in-memory SQLite database to verify the behaviour of the API endpoints.
