#!/usr/bin/env bash
# SQL linting script using sqlfluff

set -e

# Move to database directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT/database" || exit 1

# Check if sqlfluff is installed
if ! command -v sqlfluff &> /dev/null; then
    echo "Error: sqlfluff is not installed."
    echo "Please install it with: pip install sqlfluff"
    exit 1
fi

# Run sqlfluff lint
echo "Running SQL lint..."
sqlfluff lint init/schema.sql

exit $?
