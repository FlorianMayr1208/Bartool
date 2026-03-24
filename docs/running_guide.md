# Running BarTool

Minimal setup for local development.

## 1) Backend (FastAPI)

```bash
pip install -r requirements.txt
python backend/app/db/seed_db.py   # optional sample data
uvicorn backend.app.main:app --reload
```

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## 2) Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173`
- API base URL is read from `frontend/.env` (`VITE_API_BASE`).

## 3) Production notes

```bash
cd frontend
npm run build
```

Build output is written to `frontend/dist` and can be served by any static web server.
