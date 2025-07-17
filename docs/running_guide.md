# Running BarTool

This document describes how to set up and launch both the backend and the frontend. The steps assume a Unix-like environment with Python and Node.js installed.

## Backend Setup

1. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Create and seed the SQLite database (optional but recommended for demo data):
   ```bash
   python backend/app/db/seed_db.py
   ```
3. Start the FastAPI application:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
   The API will be reachable at `http://localhost:8000` and you can explore the docs at `/docs`.

## Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the npm dependencies:
   ```bash
   npm install
   ```
3. Ensure that `frontend/.env` contains the correct API base URL. The default is `VITE_API_BASE=http://localhost:8000`.
4. Start the development server:
   ```bash
   npm run dev
   ```
   This will open the application in your browser at `http://localhost:5173`.

## Production Build

To build the frontend for production and serve the compiled assets you can run:

```bash
npm run build
```

The generated files in `frontend/dist` can then be copied to any web server. The backend can be run with a process manager such as systemd or within a container.

## Running Tests

Backend tests can be executed with `pytest`:

```bash
pytest
```

They use an in-memory SQLite database so they do not affect your local data.
