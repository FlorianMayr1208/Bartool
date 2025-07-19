# Project To‑Do List – Bar Management System

Below is a step‑by‑step plan sliced into iterations.  


## 1  |  Backend Foundation (FastAPI + SQLite)
1. Create `backend/app/main.py` with “hello world” FastAPI and `/healthz`.  
2. Add dependency manager using a `requirements.txt` file and commit it.
3. Add **SQLAlchemy** & **pydantic**; create `Ingredient`, `Recipe`, `InventoryItem` models.  
4. Implement DB session helper and CRUD layer.  
5. Seed a tiny SQLite DB in `data/seed.sqlite`.  


---

## 2  |  API Design & First Endpoints
1. Sketch OpenAPI paths then code endpoints for  
   - `GET/POST /ingredients`  
   - `GET/POST /recipes` (import from CocktailDB)  
   - `GET/PATCH /inventory/{id}`  
2. Add pagination & error middleware.  
3. Write unit tests with **pytest** + **httpx** (≥ 80 % coverage).

---

## 3  |  Frontend Skeleton (React + Vite)
1. `npm create vite@latest frontend --template react-ts`.  
2. Install **React‑Router** and TailwindCSS.  
3. Create page shells: Dashboard, Inventory, Recipes, Shopping List, Stats.  
4. Add API client and fetch `/healthz` to verify backend.

---

## 4  |  Core Feature – Inventory Management
1. Integrate html5-qrcode barcode scanner; fallback to manual form.
2. Inventory table with editable quantity & delete.  
3. Backend barcode lookup route `GET /barcode/{ean}` with cache.  

---

## 5  |  Recipe & Suggestion Engine (MVP)
1. Import classic recipes into DB (`Recipe` + `RecipeIngredient`).  
2. Implement suggestion algorithm (exact match + intersection ranking).  
3. Expose `/suggestions?profile=alcoholfree&maxMissing=2`.  
4. Frontend: recipe grid, profile toggle, “why recommended” tooltip.

---

## 6  |  Shopping List + Exports
1. `POST /shopping-list` to auto‑generate missing ingredients.  
2. CSV/JSON export; include expiry labels.  
3. UI: checklist that PATCHes inventory; download buttons.

---

## 7  |  Statistics & Dashboard
1. Add `UsageLog` table.  
2. Nightly task computes top‑used and soon‑to‑expire items.  
3. Dashboard charts with **recharts**.

---

## 8  |  User Profiles & Filters
1. Add `UserProfile` table or static JSON.  
2. Middleware applies profile tags before suggestions.  
3. UI dropdown for profile switch.

---

## 9  |  Raspberry Pi Deployment
1. `pi/deploy.sh` installs Docker, pulls images, sets systemd service.  
2. Expose mDNS hostname `barpi.local`.  
3. Optional watchtower for auto‑updates.

---

## 10  |  Polish & Quality Gate
1. Accessibility audit (ARIA, contrast).  
2. Mobile UX tweaks (large hit areas).  
3. Backup script for SQLite (`/data/backups/YYYY-MM-DD.sqlite`).  
4. pre‑commit hooks: black, isort, flake8, prettier.  
5. Tag **v1.0.0**, update README.

---

## 11  |  Stretch Goals
- OAuth or PIN login  
- Voice assistant integration  
- NFC tags on bottles  

---

## Suggested Timeline

| Week | Focus                                  |
|------|----------------------------------------|
| 1    | Sections 0–1 – scaffold, DB models     |
| 2    | Sections 2–3 – API & UI skeleton       |
| 3    | Section 4 – inventory & barcode        |
| 4    | Section 5 – recipe engine              |
| 5    | Section 6 – shopping list & exports    |
| 6    | Section 7 – stats dashboard            |
| 7    | Section 8 – profiles, polish, tests    |
| 8    | Section 9 – Pi deployment, backups     |
| 9    | Section 10 – accessibility, docs, 1.0 |

---

Good luck and happy coding!  
