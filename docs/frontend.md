# Frontend Documentation

The frontend is a single page application built with **React** and **TypeScript**. The project is scaffolded via Vite and uses Tailwind CSS for styling. Source files live in `frontend/src` and follow a component based structure.

## Project Layout

```
frontend/
├── src/
│   ├── components/   # Reusable UI pieces
│   ├── pages/        # Top level pages such as Inventory or Recipes
│   ├── contexts/     # React context providers
│   ├── assets/       # Static images and icons
│   ├── api.ts        # Helper for calling the backend API
│   └── ...
├── index.html        # Entry HTML used by Vite
└── vite.config.ts    # Vite configuration
```

Each page uses smaller components from the `components/` folder. Navigation is handled by React Router. Tailwind's utility classes are used for layout and styling which keeps the CSS minimal.

### Development

To start the development server run:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will reload when files in `src/` change. By default the frontend expects the backend to be available under `http://localhost:8000`; this can be adjusted in `frontend/.env`.

### Building for Production

For a production build execute:

```bash
npm run build
```

The compiled assets will be placed in `dist/`. They can be served by any static web server or by a reverse proxy in front of the FastAPI app.

### Linting

A basic ESLint configuration is included. Run `npm run lint` to check code quality.
