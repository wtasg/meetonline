# SQL Linting Setup

This guide explains how to set up and use SQL linting for the meetonline project.

## Overview

The project uses [sqlfluff](https://www.sqlfluff.com/) for SQL linting. sqlfluff is a free, open-source SQL linter that:

- Supports multiple SQL dialects (we use PostgreSQL)
- Enforces consistent code style
- Can automatically fix many formatting issues
- Integrates with CI/CD pipelines

## Installation

### Prerequisites

- Python 3.x
- pip (Python package manager)

### Install sqlfluff

Install sqlfluff using pip:

```bash
# Install globally
pip install sqlfluff

# Or install in user directory (recommended)
pip install --user sqlfluff
```

Verify installation:

```bash
sqlfluff --version
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

Using sqlfluff directly:

```bash
cd database
sqlfluff lint init/schema.sql
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

Using sqlfluff directly:

```bash
cd database
sqlfluff fix init/schema.sql
```

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

Edit `.sqlfluff` to adjust linting rules. See the [sqlfluff documentation](https://docs.sqlfluff.com/en/stable/configuration.html) for available options.

## Pre-commit Integration

SQL linting runs automatically as part of the pre-commit hook (`scripts/pre-commit.sh`). This ensures all SQL changes are linted before being committed.

To bypass the pre-commit hook (not recommended):

```bash
git commit --no-verify
```

## Common Issues

### sqlfluff not found

If you get a "command not found" error:

1. Make sure sqlfluff is installed: `pip install --user sqlfluff`
2. Check if `~/.local/bin` is in your PATH
3. Add it to your PATH if needed:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

### Linting errors

If linting fails:

1. Review the error messages - they usually indicate the line and issue
2. Try auto-fixing: `npm run lint:fix` (from database directory)
3. For issues that can't be auto-fixed, manually adjust the SQL code
4. If a rule seems incorrect for the project, consider excluding it in `.sqlfluff`

## Resources

- [sqlfluff Documentation](https://docs.sqlfluff.com/)
- [sqlfluff GitHub](https://github.com/sqlfluff/sqlfluff)
- [PostgreSQL Dialect Rules](https://docs.sqlfluff.com/en/stable/dialects.html#postgresql)
