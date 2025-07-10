barmanagement/
├── backend/
│   ├── app/
│   │   ├── api/                # API-Endpunkte (z.B. /inventory, /recipes, /users)
│   │   │   ├── __init__.py
│   │   │   ├── inventory.py
│   │   │   ├── recipes.py
│   │   │   ├── users.py
│   │   │   └── shoppinglist.py
│   │   ├── core/               # Zentrale Logik, Einstellungen, Hilfsfunktionen
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── utils.py
│   │   ├── db/                 # Datenbankmodelle und Verbindung
│   │   │   ├── __init__.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py      # Pydantic Schemas für Validierung
│   │   │   └── crud.py
│   │   ├── services/           # Externe Services (z.B. Barcode, Rezeptdatenbank)
│   │   │   ├── __init__.py
│   │   │   └── barcode.py
│   │   ├── static/             # Statische Dateien (Bilder, Export-Dateien)
│   │   ├── templates/          # Für Jinja2, falls notwendig (z.B. E-Mail-Vorlagen)
│   │   ├── main.py             # FastAPI App-Entry-Point
│   │   └── requirements.txt    # Python Abhängigkeiten
│   ├── alembic/                # DB-Migrationen (optional)
│   ├── tests/                  # Unit- und Integrationstests
│   └── Dockerfile              # Für Container-Deployment (optional)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── pages/              # Seiten (Home, Inventar, Rezepte, Statistik, etc.)
│   │   ├── api/                # JS-Fetches zur Backend-API
│   │   ├── utils/              # Hilfsfunktionen
│   │   ├── styles/             # CSS/Tailwind/Bootstrap
│   │   └── App.jsx             # Haupteinstieg für React
│   ├── package.json            # JS-Abhängigkeiten
│   └── vite.config.js          # (oder webpack.config.js)
│
├── data/                       # (Initiale) Datenbank, Import/Export-Dateien, Backups
│   └── barmanagement.db
│
├── README.md
├── .gitignore
└── docker-compose.yml          # Für gemeinsames Starten von Backend & Frontend (optional)
