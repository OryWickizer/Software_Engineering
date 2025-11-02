[![DOI](https://zenodo.org/badge/1044954690.svg)](https://doi.org/10.5281/zenodo.17497556)

# EcoBites Monorepo (Client + Server)


This repo contains a React frontend (Vite + Tailwind) and a Node/Express backend with MongoDB and Jest tests.

## Structure

- `Ecobites/client/` — React 18 app built with Vite and Tailwind CSS
  - Routing via `react-router-dom`
  - Pages: `Index`, `login`, `Drivers`, `Customer`
  - Sections: `Hero`, `Mission`, `HowItWorks`
  - Site chrome: `Header`, `Footer`
  - Tests with Vitest + React Testing Library
- `Ecobites/server/` — Express API with Mongoose models
  - Auth endpoints: register, login (JWT)
  - Health endpoint
  - Mongo connection via `mongoose`
  - Tests with Jest + Supertest and an in-memory MongoDB
- `client/` — A separate, unused `Hero.tsx` example component (TypeScript). Not wired to the running app.

## Backend (Ecobites/server)

### Tech
- Express 5, Mongoose 8, JWT, bcrypt
- ESM modules (`type: module`)
- Jest 30 + Supertest + `mongodb-memory-server` for integration tests

### Key files
- `src/app.js` — Express app setup (CORS, JSON, routes)
- `src/server.js` — Starts server after DB connection
- `src/config/env.js` — Loads env vars, connects to Mongo
- `src/routes/index.js` — `GET /api/health`
- `src/routes/auth.routes.js` — `POST /api/auth/register`, `POST /api/auth/login`
- `src/controller/auth.controller.js` — Register/login logic, issues JWT
- `src/models/User.model.js` — Mongoose user model with password hashing + compare
- `src/middleware/auth.middleware.js` — JWT auth/authorize helpers (not yet applied to routes)
- `src/setupTests.js` — Test helpers for in-memory Mongo

### Endpoints
- `GET /api/health` — Service status
- `POST /api/auth/register` — Body: `{ name, email, password, role? }` → Creates user, returns `{ token, user }`
- `POST /api/auth/login` — Body: `{ email, password }` → Returns `{ token, user }`

### Env vars (.env)
- `MONGODB_URI` — Required to run server locally (not used by tests)
- `PORT` (default 3000)
- `JWT_SECRET` (default insecure fallback)

### Run (Windows, cmd.exe)
From `Ecobites/server`:

```
npm install
npm start
```

Optional dev reload:
```
npm run dev
```

### Test (Windows, cmd.exe)
The `package.json` uses POSIX env var syntax. On Windows cmd.exe, run:

```
set "NODE_OPTIONS=--experimental-vm-modules" && npx jest --coverage
```

Or install cross-env and update scripts:

```
npm i -D cross-env
```
Then in `package.json` scripts:
```
"test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --coverage",
"test:watch": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --watch"
```

## Frontend (Ecobites/client)

### Tech
- React 18 + Vite 7 + Tailwind CSS 4
- React Router DOM
- Vitest + React Testing Library

### App flow
- `src/main.jsx` mounts `<App />` with `<BrowserRouter />`
- `src/App.jsx` defines routes:
  - `/` → `Index` (landing, uses `Hero`, `Mission`, `HowItWorks`)
  - `/login` → `login` (form UI; currently logs inputs, no API hookup yet)
  - `/driver` → `Drivers` (driver dashboard mock)
  - `/customer` → `Customer` (simple cart mock)
- Header/Footer provide navigation and brand; Tailwind used for styling

### Run (Windows, cmd.exe)
From `Ecobites/client`:

```
npm install
npm run dev
```

Vite dev server starts (typically http://localhost:5173).

### Test
From `Ecobites/client`:
```
npm test
```

## Notes and next steps
- The login/register page UI isn’t wired to the backend yet. Hook up to `/api/auth/register` and `/api/auth/login` with fetch/axios.
- Protect future API routes using `authenticateToken` middleware in `src/middleware/auth.middleware.js`.
- Consider moving or removing the top-level `client/` folder (TSX demo) if unused to avoid confusion.
- For Windows compatibility, consider switching server test scripts to `cross-env`.
- Ensure a valid `.env` in `Ecobites/server` with `MONGODB_URI` and a strong `JWT_SECRET` before running.
