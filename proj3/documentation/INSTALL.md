# TasteBuddiez Installation Guide

## Prerequisites

Before installing TasteBuddiez, ensure you have the following installed on your system:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Python** (version 3.7 or higher)
- **pip** (Python package installer)

## Installation

### 1. Clone the Repository

```bash
git clone <https://github.com/madisonbook/CSC510.git>
cd tastebuddiez
```

### 2. Install the CLI Tool

Install the TasteBuddiez CLI tool using pip:

```bash
pip install -e .
```

This will install the `tastebuddiez` command globally on your system.

### 3. Setup Development Environment

Run the setup command to create necessary directories and configuration files:

```bash
tastebuddiez setup
```

This command will:
- Create the `frontend/dist/assets` directory
- Generate `.dockerignore` files if they don't exist
- Prepare your environment for development

## Starting the Application

### Basic Start

To start all services (MongoDB, Backend, Frontend):

```bash
tastebuddiez start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

### Start with Build

To rebuild Docker images before starting:

```bash
tastebuddiez start --build
```

### Start in Detached Mode

To run services in the background:

```bash
tastebuddiez start -d
```

or combine both options:

```bash
tastebuddiez start --build -d
```

## Managing the Application

### Check Status

View the status of all running services:

```bash
tastebuddiez status
```

### View Logs

Follow logs from all services in real-time:

```bash
tastebuddiez logs
```

### Restart Services

Restart all services without rebuilding:

```bash
tastebuddiez restart
```

### Stop Services

Stop all running services:

```bash
tastebuddiez stop
```

### Clean Up

Stop all services and remove volumes (⚠️ this will delete all data):

```bash
tastebuddiez clean
```

## Running Tests

### Run All Tests

```bash
tastebuddiez test all
```

### Run Specific Test Suites

Run tests for specific components:

```bash
tastebuddiez test meals
tastebuddiez test users
tastebuddiez test main
```

### Test Options

**Rebuild test containers:**
```bash
tastebuddiez test all --build
```

**Keep test containers after completion:**
```bash
tastebuddiez test all --keep
```

**Generate coverage reports:**
```bash
tastebuddiez test all --coverage
```

Coverage reports will be saved to `backend/coverage_reports/`:
- `coverage.xml` - XML coverage report
- `htmlcov/` - HTML coverage report (open `index.html` in a browser)

**Combine options:**
```bash
tastebuddiez test all --build --coverage
```

## Project Structure

The CLI expects the following project structure:

```
proj2/
├── docker-compose.yml
├── frontend/
│   └── dist/
│       └── assets/
├── backend/
│   └── coverage_reports/  (created by --coverage flag)
└── cli.py
```

## Troubleshooting

### Cannot find docker-compose.yml

Ensure you're running commands from within the project directory or one of its subdirectories. The CLI will search for `docker-compose.yml` in the current directory and parent directories.

### Frontend dist directory missing

Run the setup command:

```bash
tastebuddiez setup
```

### Port conflicts

If ports 5173 or 8000 are already in use, you'll need to:
1. Stop the conflicting services
2. Or modify the port mappings in `docker-compose.yml`

### Permission errors

On Linux, you may need to run Docker commands with `sudo` or add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```

Then log out and log back in for the changes to take effect.

## Available Commands Summary

| Command | Description |
|---------|-------------|
| `tastebuddiez setup` | Initialize development environment |
| `tastebuddiez start` | Start all services |
| `tastebuddiez stop` | Stop all services |
| `tastebuddiez restart` | Restart all services |
| `tastebuddiez status` | Show service status |
| `tastebuddiez logs` | View service logs |
| `tastebuddiez test [suite]` | Run tests |
| `tastebuddiez clean` | Remove all containers and volumes |

## Getting Help

For command-specific help:

```bash
tastebuddiez --help
tastebuddiez start --help
tastebuddiez test --help
```
