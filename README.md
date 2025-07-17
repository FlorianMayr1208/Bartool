# BarTool

BarTool is a lightweight bar management system intended to run even on a small device such as a Raspberry Pi. The backend is implemented with [FastAPI](https://fastapi.tiangolo.com/) and stores its data in a local SQLite database. A simple React + Tailwind CSS frontend provides pages to browse your inventory, manage recipes and keep track of a shopping list.

## Features

- **Inventory management** – keep an overview of all bottles and ingredients
- **Recipe storage** – save your favourite cocktails and browse suggestions
- **Shopping list** – collect missing items you need to buy
- **Barcode scanning** – looks up product info via Open Food Facts
- **Statistics dashboard** – view usage data and upcoming expiries

The project is still in an early stage and focuses on a clean API structure and a minimal, responsive UI.

## Documentation

Additional documentation is available in the `docs/` directory:

- `project_overview.md` – general information about the architecture
- `backend.md` – details about the FastAPI backend
- `frontend.md` – description of the React frontend
- `running_guide.md` – step-by-step guide for launching the application

## Quickstart

The following commands will launch the backend and frontend in development mode. See `docs/running_guide.md` for a more detailed explanation.

```bash
# install Python dependencies
pip install -r requirements.txt

# start the backend
uvicorn backend.app.main:app --reload
```

For the frontend, install the npm packages and run Vite:

```bash
cd frontend
npm install
npm run dev
```

### Database initialization

Before using the app you can create the local SQLite database with a small seeding script:

```bash
python backend/app/db/seed_db.py
```

This will generate `data/seed.sqlite` and insert a few example records so the API has initial data to work with. Afterwards open `http://localhost:5173` in your browser. The frontend reads the API base URL from `frontend/.env`, which by default contains `VITE_API_BASE=http://localhost:8000`. If your backend runs on a different host or port, adjust this value before starting the frontend.

### Barcode lookup

Scanning a bottle in the inventory page sends a request to `/barcode/{EAN}`. The backend queries the public **Open Food Facts** API and returns the product name, brand and image URL if available.

---

This repository also contains a collection of documents (`technical_specification.md`, `usecases.md`) describing the planned functionality and architecture.
