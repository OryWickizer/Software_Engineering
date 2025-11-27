#!/usr/bin/env python3
import click
import subprocess
import sys
import os
from pathlib import Path


def get_project_root():
    """Get the project root directory where docker-compose.yml is located"""
    # If installed as package, files should be in package directory
    cli_dir = Path(__file__).parent
    if (cli_dir / "docker-compose.yml").exists():
        return cli_dir

    # Otherwise, look in current directory
    current = Path.cwd()
    if (current / "docker-compose.yml").exists():
        return current

    # Search parent directories
    for parent in current.parents:
        if (parent / "docker-compose.yml").exists():
            return parent

    raise FileNotFoundError("Could not find docker-compose.yml in project directory")


def ensure_frontend_dist():
    """Ensure frontend/dist/assets directory exists for tests"""
    try:
        project_root = get_project_root()
        dist_path = project_root / "frontend" / "dist" / "assets"

        if not dist_path.exists():
            click.secho("Creating frontend/dist/assets directory for tests...")
            dist_path.mkdir(parents=True, exist_ok=True)

            # Create placeholder files
            (dist_path / ".gitkeep").write_text("/* Test placeholder */")

        return True
    except Exception as e:
        click.secho(f"Warning: Could not create frontend dist directory: {e}", err=True)
        return False


@click.group()
def cli():
    """TasteBuddiez - Meal planning application"""
    pass


@cli.command()
@click.option("--build", is_flag=True, help="Build images before starting")
@click.option("--detach", "-d", is_flag=True, help="Run in detached mode")
def start(build, detach):
    """Start the TasteBuddiez application (frontend + backend + database)"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        cmd = ["docker-compose", "up"]

        if build:
            cmd.append("--build")

        if detach:
            cmd.append("-d")

        # Only start main services (not test services)
        cmd.extend(["mongodb", "fastapi-backend", "react-frontend"])

        click.secho("Starting TasteBuddiez...")
        click.secho(f"Project root: {project_root}")
        click.secho(f"Frontend will be available at: http://localhost:5173")
        click.secho(f"Backend API will be available at: http://localhost:8000")

        result = subprocess.run(cmd)
        sys.exit(result.returncode)

    except FileNotFoundError as e:
        click.secho(f"Error: {e}", err=True)
        sys.exit(1)
    except Exception as e:
        click.secho(f"Error starting application: {e}", err=True)
        sys.exit(1)


@cli.command()
def stop():
    """Stop the TasteBuddiez application"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        click.secho("Stopping TasteBuddiez...")
        result = subprocess.run(["docker-compose", "down"])
        sys.exit(result.returncode)

    except Exception as e:
        click.secho(f"Error stopping application: {e}", err=True)
        sys.exit(1)


@cli.command()
def restart():
    """Restart the TasteBuddiez application"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        click.secho("Restarting TasteBuddiez...")
        subprocess.run(["docker-compose", "restart"])

    except Exception as e:
        click.secho(f"Error restarting application: {e}", err=True)
        sys.exit(1)


@cli.command()
def logs():
    """Show logs from all services"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        result = subprocess.run(["docker-compose", "logs", "-f"])
        sys.exit(result.returncode)

    except Exception as e:
        click.secho(f"Error showing logs: {e}", err=True)
        sys.exit(1)


@cli.command()
def status():
    """Show status of all services"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        result = subprocess.run(["docker-compose", "ps"])
        sys.exit(result.returncode)

    except Exception as e:
        click.secho(f"Error showing status: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.argument("test_suite", required=False, default="all")
@click.option("--build", is_flag=True, help="Rebuild test containers before running")
@click.option("--keep", is_flag=True, help="Keep containers after tests finish")
@click.option(
    "--coverage", is_flag=True, help="Generate and extract coverage reports after tests"
)
def test(test_suite, build, keep, coverage):
    """Run tests (meals, users, main, or all)"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        valid_suites = ["meals", "users", "main", "all"]
        if test_suite not in valid_suites:
            click.secho(
                f"Invalid test suite. Choose from: {', '.join(valid_suites)}", err=True
            )
            sys.exit(1)

        # Ensure frontend dist directory exists
        ensure_frontend_dist()

        service_name = f"test-{test_suite}"

        click.secho(f"Running {test_suite} tests...")

        # Clean up any existing test containers first
        click.secho("Cleaning up old test containers...")
        subprocess.run(
            ["docker-compose", "--profile", "test", "down", "-v"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Build command
        cmd = ["docker-compose", "--profile", "test", "up"]

        if build:
            cmd.append("--build")

        # Use --abort-on-container-exit to stop when tests finish
        cmd.append("--abort-on-container-exit")

        # Add the specific service
        cmd.append(service_name)

        # Run tests
        result = subprocess.run(cmd)

        # If coverage enabled, try to extract reports from the container
        if coverage:
            click.secho("\nExtracting coverage reports...", fg="cyan")

            # Find the container ID (test service name should match)
            container_name = f"{service_name}".replace("_", "")
            container_id = subprocess.run(
                ["docker", "ps", "-aqf", f"name={service_name}"],
                capture_output=True,
                text=True,
            ).stdout.strip()

            if container_id:
                output_dir = os.path.join(project_root, "backend", "coverage_reports")
                os.makedirs(output_dir, exist_ok=True)

                files_to_copy = {
                    "/app/coverage.xml": os.path.join(output_dir, "coverage.xml"),
                    "/app/htmlcov": os.path.join(output_dir, "htmlcov"),
                }

                for src, dest in files_to_copy.items():
                    try:
                        subprocess.run(
                            ["docker", "cp", f"{container_id}:{src}", dest], check=True
                        )
                        click.secho(f"✅ Copied {src} → {dest}", fg="green")
                    except subprocess.CalledProcessError:
                        click.secho(
                            f"⚠️ Could not copy {src} (not found in container)",
                            fg="yellow",
                        )
            else:
                click.secho(
                    "⚠️ No test container found for coverage extraction", fg="yellow"
                )

        # Cleanup unless --keep flag is set
        if not keep:
            click.secho("\nCleaning up test containers...")
            subprocess.run(
                ["docker-compose", "--profile", "test", "down"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

        # Show summary
        if result.returncode == 0:
            click.secho("\n" + "=" * 50)
            click.secho("✓ Tests completed successfully!", fg="green")
            click.secho("=" * 50)
        else:
            click.secho("\n" + "=" * 50)
            click.secho("✗ Tests failed!", fg="red")
            click.secho("=" * 50)

        sys.exit(result.returncode)

    except Exception as e:
        click.secho(f"Error running tests: {e}", err=True)
        sys.exit(1)


@cli.command()
def clean():
    """Stop all services and remove volumes"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        if click.confirm("This will remove all data. Continue?"):
            click.secho("Cleaning up...")
            result = subprocess.run(["docker-compose", "down", "-v"])
            sys.exit(result.returncode)

    except Exception as e:
        click.secho(f"Error cleaning up: {e}", err=True)
        sys.exit(1)


@cli.command()
def setup():
    """Setup development environment (create necessary directories)"""
    try:
        project_root = get_project_root()
        os.chdir(project_root)

        click.secho("Setting up development environment...")

        # Create frontend dist directory
        ensure_frontend_dist()

        # Create .dockerignore files if they don't exist
        dockerignore_files = {
            "frontend/.dockerignore": """node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
dist
.vscode
.idea
*.log
coverage
.cache
""",
            ".dockerignore": """__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build
.pytest_cache
.coverage
htmlcov/
.tox/
.venv
venv/
ENV/
frontend/node_modules
frontend/npm-debug.log
.vscode
.idea
*.swp
.DS_Store
.git
.gitignore
*.log
.env
README.md
""",
        }

        for filepath, content in dockerignore_files.items():
            full_path = project_root / filepath
            if not full_path.exists():
                click.secho(f"Creating {filepath}...")
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(content)
            else:
                click.secho(f"✓ {filepath} already exists")

        click.secho("\n✓ Setup complete!")
        click.secho("\nYou can now run:")
        click.secho("  tastebuddiez start    - Start the application")
        click.secho("  tastebuddiez test all - Run all tests")

    except Exception as e:
        click.secho(f"Error during setup: {e}", err=True)
        sys.exit(1)


def main():
    """Main entry point"""
    cli()


if __name__ == "__main__":
    main()
