# Copilot Instructions for CSC510 Software Engineering Projects

This repository contains three course projects with distinct architectures and tooling.

## Repository Structure

- **proj1/**: Project 1 files
- **proj2/**: EcoBites - Food delivery platform (Node.js + MongoDB + React)
- **proj3/**: Taste Buddies - Meal sharing platform (FastAPI + MongoDB + React)

## Project 2: EcoBites Architecture

### Stack
- **Backend**: Express.js with Mongoose ODM
- **Frontend**: React + Vite + TailwindCSS + React Query
- **Database**: MongoDB (Mongoose schemas)
- **Testing**: Jest (backend), Vitest (frontend)

### Key Patterns
- **Authentication**: JWT tokens stored in httpOnly cookies via `protect` middleware (`middleware/auth.middleware.js`)
- **Database**: Mongoose models use pre-save hooks for password hashing (`models/User.model.js`)
- **API Structure**: RESTful routes under `/api/*` - auth, menu, orders, restaurants, profile
- **User Roles**: `customer`, `restaurant`, `driver` - enforced via `authorize()` middleware

### Development Workflow
```bash
# Backend (proj2/Ecobites/server/)
npm run dev          # Start with nodemon
npm test             # Run Jest tests with coverage

# Frontend (proj2/Ecobites/client/)
npm run dev          # Vite dev server on :5173
npm test             # Vitest
npm run format       # Prettier formatting
```

### Testing
- Backend: Jest with mongodb-memory-server for integration tests
- Frontend: Vitest with @testing-library/react
- Services mocked using vi.mock() pattern (see `client/src/tests/services/`)

## Project 3: Taste Buddies Architecture

### Stack
- **Backend**: FastAPI with Motor (async MongoDB driver)
- **Frontend**: React + Vite + shadcn/ui components
- **Database**: MongoDB (Pydantic models, no ODM)
- **Testing**: Pytest with pytest-asyncio
- **Containerization**: Docker Compose orchestration

### Key Patterns
- **Authentication**: HTTPBearer tokens validated in `dependencies.py` via `get_current_user()`
- **Database**: Async Motor client, indexes created on startup in `main.py:startup_event()`
- **Models**: Pydantic models with Enum types (`UserRole`, `MealStatus`, `AccountStatus`) in `models.py`
- **Password Handling**: Dev mode supports plaintext passwords when `DEV_PLAINTEXT_PASSWORDS=1` in `.env`
- **Route Organization**: Modular routers (auth, user, meal, review) imported in `main.py`

### Development Workflow via CLI
```bash
# From proj3/ root - uses custom CLI tool
pip install -e .          # Install tastebuddiez CLI
tastebuddiez setup        # Initialize environment
tastebuddiez start        # Launch all services (docker-compose)
tastebuddiez test all     # Run all pytest suites
tastebuddiez stop         # Teardown services
```

The `tastebuddiez` CLI wraps docker-compose commands and manages service orchestration. All commands must run from proj3/ directory.

### Service Ports
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- MongoDB: localhost:27017

### Testing
- Backend: Pytest with async fixtures, Docker-based test services
- Test suites: `meals`, `users`, `main`, `all`
- Coverage reports extracted from test containers
- Tests run in isolated Docker containers defined in `docker-compose.test.yml`

## Common MongoDB Patterns

Both projects use MongoDB with different approaches:
- **proj2**: Mongoose ODM with schemas, middleware, virtuals
- **proj3**: Raw Motor driver with Pydantic validation, manual index management

When working with MongoDB:
- Check connection strings in `.env` files or `config/env.js`
- proj2 uses `mongoose.connect()`, proj3 uses `AsyncIOMotorClient`
- Database initialization happens on app startup in both projects

## Frontend Patterns

Both React frontends share similar patterns:
- Vite as build tool
- React Router for navigation
- TailwindCSS for styling
- Context providers for global state (Auth in proj2)
- Axios for API calls (proj2 uses cookies, proj3 may use token headers)

## When Adding Features

### Backend Routes (proj3)
1. Define Pydantic models in `models.py`
2. Create route file in `app/routes/`
3. Import router in `main.py`
4. Add database indexes in `startup_event()` if needed

### Backend Routes (proj2)
1. Define Mongoose schema in `models/*.model.js`
2. Create controller in `controller/`
3. Create route file in `routes/*.routes.js`
4. Mount router in `app.js`

### Authentication
- proj2: Use `protect` middleware, access user via `req.user`
- proj3: Use `Depends(get_current_user)`, access user dict from dependency

## Environment Variables

Critical environment variables to check:
- `MONGODB_URI` / `MONGODB_URL`: Database connection
- `JWT_SECRET`: Token signing (proj2)
- `DEV_PLAINTEXT_PASSWORDS`: Dev mode flag (proj3)
- `PORT`: Server port

## Debugging Tips

- proj3 prints auth debug logs: `[auth] token received:`, `[auth] found user:`
- Check Docker logs: `docker-compose logs -f` or `tastebuddiez logs`
- MongoDB shell access: `docker exec -it mongodb mongosh`
- Database indexes are logged on startup: `✅ Database indexes verified/created`
