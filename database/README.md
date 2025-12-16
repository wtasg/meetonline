# database

## SQL Linting

This project uses [sqlfluff](https://www.sqlfluff.com/) for SQL linting. sqlfluff is a free and open-source SQL linter that helps maintain consistent SQL code style.

### Requirements

- Python 3.x
- pip

### Installation

Install sqlfluff globally or locally:

```bash
pip install sqlfluff
```

Or install it in the user directory:

```bash
pip install --user sqlfluff
```

### Usage

Lint SQL files:

```bash
# From database directory
npm run lint

# Or directly from repository root
./scripts/sql-lint.sh

# Or directly with sqlfluff
cd database && sqlfluff lint init/schema.sql
```

Auto-fix linting issues where possible:

```bash
# From database directory
npm run lint:fix

# Or directly from repository root
./scripts/sql-lint-fix.sh

# Or directly with sqlfluff
cd database && sqlfluff fix init/schema.sql
```

### Configuration

SQL linting is configured in `.sqlfluff` in the repository root. The configuration:

- Uses PostgreSQL dialect
- Follows the project's 4-space indentation from `.editorconfig`
- Allows aligned column definitions in CREATE TABLE statements
- Excludes certain formatting rules to match existing code style

### Integration

SQL linting is automatically run as part of the pre-commit hook in `scripts/pre-commit.sh`.

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
