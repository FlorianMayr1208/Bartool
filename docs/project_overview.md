# Project Overview

BarTool is a bar management system aimed at hobbyists and small bars that want a lightweight tool to track inventory and recipes. The application is designed to be easy to deploy on modest hardware while still providing a modern web experience. Both the backend and the frontend are part of this repository.

## Architecture

The project follows a classic client–server design:

1. **Backend** – A FastAPI application that exposes a REST API for managing ingredients, recipes and inventory data. It uses SQLite via SQLAlchemy for persistence and Pydantic models for validation.
2. **Frontend** – A single page application built with React and Tailwind CSS. It consumes the API and offers pages for inventory, recipes, shopping lists and statistics.

The backend and frontend are versioned together and can be run independently during development. Deployment on a Raspberry Pi or similar device is the primary target scenario.

### Features

- Inventory tracking for bottles, syrups and any other bar supplies
- Storage of cocktail recipes with categorisation, tags and IBA lists
- Automatic generation of shopping lists based on the selected recipes
- Barcode scanning that fetches additional product data from Open Food Facts
- Export and import of the database for backup purposes

Additional details about the planned functionality and design decisions can be found in the existing documents such as `technical_specification.md`, `usecases.md` and `style_guide.md`.

## Directory Layout

```
Bartool/
├── backend/   # FastAPI application
├── frontend/  # React + Vite SPA
├── docs/      # Additional documentation
└── ...        # Project configuration and helper files
```

## Development Workflow

Typical development consists of running the backend and frontend locally. The frontend communicates with the backend via the API base URL defined in `frontend/.env`. See `docs/running_guide.md` for the full instructions. Unit tests for the backend reside in `backend/tests` and can be executed with `pytest`.
