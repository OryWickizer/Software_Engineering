[![DOI](https://zenodo.org/badge/1044954690.svg)](https://doi.org/10.5281/zenodo.17497556)
[![CI](https://github.com/your-username/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/your-repo/actions/workflows/ci.yml)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=flat&logo=eslint&logoColor=white)](Ecobites/client/eslint.config.js)
[![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat&logo=prettier&logoColor=black)](Ecobites/client/.prettierrc)
[![Coverage](https://img.shields.io/badge/Coverage-56%25-yellow)](Ecobites/server/coverage/lcov-report/index.html)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node.js-18-green.svg)](https://nodejs.org/)
[![GitHub issues](https://img.shields.io/github/issues/your-username/your-repo)](https://github.com/your-username/your-repo/issues)
[![GitHub stars](https://img.shields.io/github/stars/your-username/your-repo)](https://github.com/your-username/your-repo/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/your-username/your-repo)](https://github.com/your-username/your-repo)

# EcoBites Monorepo (Client + Server)

This repo contains a React frontend (Vite + Tailwind) and a Node/Express backend with MongoDB and Jest tests.

## Structure

- `Ecobites/client/` — React 18 app built with Vite and Tailwind CSS
  - Routing via `react-router-dom`
  - Pages: `Index`, `login`, `Drivers`, `Customer`, `Checkout`, `Profile`
  - Sections: `Hero`, `Mission`, `HowItWorks`, `WhatsNew`
  - Site chrome: `Header`, `Footer`
  - Authentication with JWT and context
  - Tests with Vitest + React Testing Library
- `Ecobites/server/` — Express API with Mongoose models
  - Auth endpoints: register, login (JWT)
  - Order management, menu items, restaurant management
  - Health endpoint
  - Mongo connection via `mongoose`
  - Tests with Jest + Supertest and an in-memory MongoDB
- `docs/` — Project documentation (how, what, why)

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
  - `/login` → `login` (authentication with backend API integration)
  - `/driver` → `Drivers` (driver dashboard with order management)
  - `/customer` → `Customer` (customer interface with cart and orders)
  - `/checkout` → `Checkout` (order placement and eco-rewards)
  - `/profile` → `Profile` (user profile management)
- Header/Footer provide navigation and brand; Tailwind used for styling
- Authentication context manages user state and API calls

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

## Getting Started

See [INSTALL.md](INSTALL.md) for detailed setup instructions.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Documentation

- [How it works](docs/how.md) — User tutorials and workflows
- [What it does](docs/what.md) — Component and function descriptions
- [Why it matters](docs/why.md) — Project mission and impact

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
