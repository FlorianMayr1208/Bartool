# BarTool

BarTool is a lightweight bar management system intended to run even on a small device such as a Raspberry Pi. The backend is implemented with [FastAPI](https://fastapi.tiangolo.com/) and stores its data in a local SQLite database. A simple React + Tailwind CSS frontend provides pages to browse your inventory, manage recipes and keep track of a shopping list.

## Features

- **Inventory management** – keep an overview of all bottles and ingredients
- **Recipe storage** – save your favourite cocktails and browse suggestions
- **Shopping list** – collect missing items you need to buy
- **Barcode scanning** – looks up product info via Open Food Facts
- **Statistics dashboard** – view usage data and upcoming expiries

The project is still in an early stage and focuses on a clean API structure and a minimal, responsive UI.

The repository currently focuses on development and runtime workflows; legacy automated test scaffolding has been removed from the setup instructions.

## Running

### 1) Backend (FastAPI)

```bash
pip install -r requirements.txt
python backend/app/db/seed_db.py   # optional sample data
uvicorn backend.app.main:app --reload
```

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

### 2) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`
- API base URL is read from `frontend/.env` (`VITE_API_BASE`, default `http://localhost:8000`). Adjust if your backend runs on a different host or port.

### 3) Production

```bash
cd frontend
npm run build
```

Build output is written to `frontend/dist` and can be served by any static web server.

## Notes

- **Database**: `seed_db.py` generates `data/seed.sqlite` with a few example records so the API has initial data to work with.
- **Barcode lookup**: Scanning a bottle sends a request to `/barcode/{EAN}`. The backend queries the public **Open Food Facts** API and returns the product name, brand and image URL if available.
- **Docs**: `docs/macros.md` contains ingredient macro classification notes.
