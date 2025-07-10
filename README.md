# BarTool

BarTool is a lightweight bar management system intended to run even on a small device such as a Raspberry Pi.  The backend is implemented with [FastAPI](https://fastapi.tiangolo.com/) and stores its data in a local SQLite database.  A simple React + Tailwind CSS frontend provides pages to browse your inventory, manage recipes and keep track of a shopping list.

## Features

- **Inventory management** – keep an overview of all bottles and ingredients
- **Recipe storage** – save your favourite cocktails and browse suggestions
- **Shopping list** – collect missing items you need to buy
- **Statistics dashboard** – view usage data and upcoming expiries

The project is still in an early stage and focuses on a clean API structure and a minimal, responsive UI.

## Running the project

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

Afterwards open `http://localhost:5173` in your browser.  If the backend runs on a different port, set the environment variable `VITE_API_BASE` when starting the
frontend, e.g. `VITE_API_BASE=http://localhost:8000 npm run dev`.

---

This repository also contains a collection of documents (`technical_specification.md`, `usecases.md`) describing the planned functionality and architecture.
