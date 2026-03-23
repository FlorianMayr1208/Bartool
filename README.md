# BarTool

BarTool is a lightweight bar management system intended to run even on a small device such as a Raspberry Pi. The backend is implemented with [FastAPI](https://fastapi.tiangolo.com/) and stores its data in a local SQLite database. A React + Tailwind CSS frontend provides pages to browse your inventory, manage recipes, and keep track of a shopping list.

## Features

- **Inventory management** – keep an overview of all bottles and ingredients
- **Recipe storage** – save your favourite cocktails and browse suggestions
- **Shopping list** – collect missing items you need to buy
- **Statistics dashboard** – view usage data and upcoming expiries

The project is still in an early stage and focuses on a clean API structure and a minimal, responsive UI.

## Running the project

### Backend

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

After the frontend starts, open `http://localhost:5173` in your browser. If the backend runs on a different port, set `VITE_API_BASE` when starting the frontend, for example:

```bash
VITE_API_BASE=http://localhost:8000 npm run dev
```

## Database initialization

Before using the app you can create the local SQLite database with a small seeding script:

```bash
python backend/app/db/seed_db.py
```

This will generate `data/seed.sqlite` and insert a few example records so the API has initial data to work with.

---

This repository also contains a collection of planning documents such as `technical_specification.md` and `usecases.md` that describe the intended functionality and architecture.
