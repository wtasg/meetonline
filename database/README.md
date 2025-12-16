# database

## SQL Linting

This project uses [sqlfluff](https://www.sqlfluff.com/) for SQL linting. sqlfluff is a free and open-source SQL linter that helps maintain consistent SQL code style.

### Requirements

- Docker

### Setup

The SQL linting runs inside a Docker container, so you don't need to install sqlfluff locally. The Docker image will be built automatically when you first run the linting commands.

### Usage

Lint SQL files:

```bash
# From database directory
npm run lint

# Or directly from repository root
./scripts/sql-lint.sh
```

Auto-fix linting issues where possible:

```bash
# From database directory
npm run lint:fix

# Or directly from repository root
./scripts/sql-lint-fix.sh
```

### Configuration

SQL linting is configured in `.sqlfluff` in the repository root. The configuration:

- Uses PostgreSQL dialect
- Follows the project's 4-space indentation from `.editorconfig`
- Allows aligned column definitions in CREATE TABLE statements
- Excludes certain formatting rules to match existing code style

### Integration

SQL linting is automatically run as part of the pre-commit hook in `scripts/pre-commit.sh`.

### Docker Image

The SQL linting uses a dedicated Docker image defined in `database/Dockerfile.lint`. The image:
- Based on `python:3.12-slim`
- Includes sqlfluff version 3.5.0
- Is built automatically when needed
- Can be manually built with: `docker build -t meetonline-sql-lint:latest -f database/Dockerfile.lint database/`

## Database Access

```bash
# psql
docker exec --interactive --tty manual-meetonline-database \
    psql \
    --host=localhost \
    --port=5432 \
    --dbname=meetonline \
    --username myuser \
    --password
```
