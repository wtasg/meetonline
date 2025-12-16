#!/usr/bin/env bash
# SQL linting script using sqlfluff in Docker

set -e

# Move to repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT" || exit 1

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker to run SQL linting."
    exit 1
fi

# Build the SQL lint image if it doesn't exist
if ! docker image inspect meetonline-sql-lint:latest >/dev/null 2>&1; then
    echo "Building SQL lint Docker image..."
    docker build -t meetonline-sql-lint:latest -f database/Dockerfile.lint database/
fi

# Run sqlfluff lint in Docker
echo "Running SQL lint..."
docker run --rm \
    -v "$REPO_ROOT:/workspace:ro" \
    -v "$REPO_ROOT/.sqlfluff:/workspace/.sqlfluff:ro" \
    -w /workspace \
    meetonline-sql-lint:latest \
    sqlfluff lint database/init/schema.sql
