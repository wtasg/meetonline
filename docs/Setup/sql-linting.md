# SQL Linting Setup

This guide explains how to set up and use SQL linting for the meetonline project.

## Overview

The project uses [sqlfluff](https://www.sqlfluff.com/) for SQL linting. sqlfluff is a free, open-source SQL linter that:

- Supports multiple SQL dialects (we use PostgreSQL)
- Enforces consistent code style
- Can automatically fix many formatting issues
- Integrates with CI/CD pipelines

**Important**: SQL linting runs inside a Docker container. You do not need to install Python or sqlfluff locally.

## Installation

### Prerequisites

- Docker (required)

### Setup

The SQL linting Docker image will be built automatically the first time you run linting commands. No manual installation is needed.

To manually build the Docker image:

```bash
docker build -t meetonline-sql-lint:latest -f database/Dockerfile.lint database/
```

## Usage

### Linting SQL Files

From the database directory:

```bash
cd database
npm run lint
```

From the repository root:

```bash
./scripts/sql-lint.sh
```

### Auto-fixing Issues

Many linting issues can be automatically fixed:

From the database directory:

```bash
cd database
npm run lint:fix
```

From the repository root:

```bash
./scripts/sql-lint-fix.sh
```

## How It Works

The SQL linting scripts use a Docker container to run sqlfluff:

1. **Image**: A lightweight Python Docker image (`python:3.12-slim`) with sqlfluff installed
2. **Volume Mounting**: The repository is mounted into the container as a volume
3. **Configuration**: The `.sqlfluff` config file is mounted read-only
4. **Execution**: sqlfluff runs inside the container against the SQL files

### Script Behavior

- `sql-lint.sh`: Mounts the repository as read-only and runs lint checks
- `sql-lint-fix.sh`: Mounts the repository as read-write to allow auto-fixing

## Configuration

SQL linting is configured in `.sqlfluff` at the repository root.

### Current Configuration

- **Dialect**: PostgreSQL
- **Indentation**: 4 spaces (matching `.editorconfig`)
- **Max line length**: 120 characters
- **Excluded rules**: Several rules are excluded to allow for:
  - Aligned column definitions in CREATE TABLE statements
  - Custom indentation for readability
  - Common SQL keywords used as column names (e.g., `password`, `group`)
  - Mixed case for SQL keywords like `CURRENT_TIMESTAMP`

### Customizing Configuration

Edit `.sqlfluff` to adjust linting rules. See the [sqlfluff documentation](https://docs.sqlfluff.com/en/stable/configuration/index.html) for available options.

## Pre-commit Integration

SQL linting runs automatically as part of the pre-commit hook (`scripts/pre-commit.sh`). This ensures all SQL changes are linted before being committed.

To bypass the pre-commit hook (not recommended):

```bash
git commit --no-verify
```

## Common Issues

### Docker not found

If you get a "Docker is not installed" error:

1. Install Docker following the [official installation guide](https://docs.docker.com/get-docker/)
2. Ensure Docker daemon is running
3. Verify installation: `docker --version`

### Docker image build fails

If the image fails to build:

1. Check your internet connection (needs to download base image and packages)
2. Ensure you have sufficient disk space
3. Try building manually to see detailed errors:

   ```bash
   docker build -t meetonline-sql-lint:latest -f database/Dockerfile.lint database/
   ```

### Linting errors

If linting fails:

1. Review the error messages - they usually indicate the line and issue
2. Try auto-fixing: `npm run lint:fix` (from database directory)
3. For issues that can't be auto-fixed, manually adjust the SQL code
4. If a rule seems incorrect for the project, consider excluding it in `.sqlfluff`

### Permission issues

If you encounter permission issues with Docker:

1. Ensure your user is in the `docker` group (Linux)
2. On Windows/Mac, ensure Docker Desktop is running with proper permissions

## Docker Image Details

**Location**: `database/Dockerfile.lint`

**Base Image**: `python:3.12-slim`

**Installed Packages**: `sqlfluff==3.5.0`

**Size**: Approximately 150MB (base + sqlfluff and dependencies)

## Resources

- [sqlfluff Documentation](https://docs.sqlfluff.com/)
- [sqlfluff GitHub](https://github.com/sqlfluff/sqlfluff)
- [PostgreSQL Dialect Rules](https://docs.sqlfluff.com/en/stable/dialects.html#postgresql)
- [Docker Documentation](https://docs.docker.com/)
