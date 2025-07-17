# Technische Spezifikation: Barmanagement-System (Python-basiert)

## 1. Architektur-Überblick

- **Art:** Webanwendung
- **Backend:** Python (mit passendem Web-Framework)
- **Frontend:** Web-basiert, responsive (bedienbar per PC, Tablet, Smartphone)
- **Datenbank:** Leichtgewichtig, lokal betreibbar, geringe Systemanforderungen
- **Zielsystem:** Raspberry Pi (ab 3B+ aufwärts)
- **Netzwerk:** Lokale Nutzung (kein Cloud-Zwang, aber optional möglich)

---

## 2. Technologiestack

### Backend

- **Python 3.x**
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
  - Sehr schnell, modern, asynchron
  - Leichtgewichtiger als Django, einfacher als Flask für APIs
  - Integrierte OpenAPI/Swagger-Doku (für Entwicklung und API-Tests)

### Frontend

- **Framework:**
  - [React.js](https://react.dev/) (bei komplexerer UI, moderne Single Page App)
  - oder einfaches [Vue.js](https://vuejs.org/) (schnell erlernbar, ressourcenschonend)
  - Für einfache Prototypen reicht auch reines HTML5/Bootstrap mit etwas JavaScript
- **Mobile Unterstützung:**
  - Responsive Design (Bootstrap, TailwindCSS o. ä.)
  - Bedienbar per Smartphone (z. B. zum Barcodescannen via Kamera)

### Datenbank

- **SQLite** (leicht, Dateibasierend, ideal für lokale Apps)

### Authentifizierung

- Für lokale Nutzung ggf. ohne Login.


### Hosting / Deployment

- **Lokal auf Raspberry Pi:**
  - z. B. im Docker-Container
  - Systemd-Service für Autostart
  - Zugriff per Browser im LAN (z. B. `http://barpi.local:8000`)

### Weitere Tools

- **Barcodescanner:**
  - Webkamera-Modul via HTML5 (Frontend)
  - Python-Bibliothek z. B. [pyzbar](https://pypi.org/project/pyzbar/) oder [python-barcode](https://pypi.org/project/python-barcode/)
- **API für Cocktails/Spirituoseninfos:**
  - Eigene Datenbank oder Import von offenen Quellen (z. B. [thecocktaildb.com](https://www.thecocktaildb.com/))
- **Export/Import:**
  - CSV oder JSON für Inventar und Rezepte

---

## 3. Grober Systemaufbau

```
+--------------------+       +--------------------------+      +-------------------+
|   User (Browser)   | <---> |   FastAPI Backend (API)  | <--> |     SQLite DB     |
|  (PC, Tablet,      |       |                          |      |                   |
|   Smartphone)      |       |                          |      |                   |
+--------------------+       +--------------------------+      +-------------------+
         |                          ^
         v                          |
      Barcode-Scan (Kamera)         |
         |                          |
         v                          |
    Frontend Barcode-Library         |
        (z.B. html5-qrcode)         |
                                    |
    Rezepte & Inventar-Logik <------+
```

---

## 4. Empfehlungen für Haupt-Bibliotheken und Packages

- **FastAPI** für API/Backend
- **uvicorn** als ASGI-Server
- **SQLAlchemy** (ORM, Datenbankzugriff)
- **pydantic** (Datenvalidierung)
- **Jinja2** (wenn klassisches Templating im Backend)
- **React/Vue** oder HTML5/Bootstrap für UI
- **pyzbar** oder **zxing** (für Barcode-Erkennung im Backend)
- **html5-qrcode** (für Barcode-Scan direkt im Browser)
- **thecocktaildb API** (Datenimport Rezepte, falls gewünscht)

---

## 5. Datenmodell (Vorschlag, stark vereinfacht)

- **UserProfile** (id, name, preferences)
- **Ingredient** (id, name, typ, menge, ablaufdatum, barcode, notizen)
- **Recipe** (id, name, zutaten[], schritte[], bild, tags)
- **InventoryItem** (ingredient\_id, quantity, status)
- **ShoppingListItem** (ingredient\_id, quantity, gekauft)
- **Statistik** (timestamp, ingredient\_id, action, menge)

---

## 6. Wichtige Anforderungen für Raspberry Pi

- Ressourcenverbrauch beachten (FastAPI und SQLite sehr leichtgewichtig)
- Logging/Debugging im lokalen Netz
- Backup-Möglichkeit für Datenbank (z. B. automatisches Export-Feature)

---

## 7. Entwicklungs-Tipps

- Schrittweise vorgehen: Erst API & Datenmodell, dann UI-Prototyp
- Erst Kernfunktionen (Inventar, Rezepte, Vorschläge), dann Features wie Statistiken/Einkaufsliste
- Tests direkt auf Pi machen (Leistung, Speicher, Netzwerk)
- Für Kamera/Barcode: Test mit Smartphone-Webcam im Browser, erst dann native Pi-Cam

## 8. Suchlogik

### Funktionen

- Suche bei Name
- Suche bei Basisalkohol
- Vorschläge mit Inventar

### Vorschläge mit Inventar

- Alkohole müssen mehr Gewichtung haben, da sie teurer und schwieriger zu ersetzen sind
- Kategorie für nicht alkohole?