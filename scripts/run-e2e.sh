#!/bin/bash

# Run E2E tests in Docker container
# This script builds and runs the E2E test suite
#
# Optimization strategy:
# - Base image (with Playwright browsers) is cached for 30 days
# - App image only rebuilds when package.json/package-lock.json changes
# - Source code and certificates are mounted as volumes (no rebuild needed)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$PROJECT_ROOT/client/react-client-app"
CLIENT_CONTAINER="manual-meetonline-client"

# Image names
BASE_IMAGE_NAME="meetonline-e2e-base:latest"
E2E_IMAGE_NAME="meetonline-e2e:latest"

# Cache duration: 30 days in seconds
CACHE_DURATION_SECONDS=$((30 * 24 * 60 * 60))

cleanup() {
    echo "ℹ️  Stopping client container..."
    docker stop "$CLIENT_CONTAINER" >/dev/null 2>&1 || true
    docker rm "$CLIENT_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup INT TERM EXIT

cd "$PROJECT_ROOT"

# Clean up any existing containers first
echo "ℹ️  Cleaning up existing containers..."
"$SCRIPT_DIR/manual-compose.sh" --clean

# Stop client container if already running
echo "ℹ️  Stopping any existing client container..."
docker stop "$CLIENT_CONTAINER" >/dev/null 2>&1 || true
docker rm "$CLIENT_CONTAINER" >/dev/null 2>&1 || true

# =============================================================================
# CERTIFICATE CHECK
# =============================================================================
echo "ℹ️  Checking certificates..."
if [ ! -f "$CLIENT_DIR/.cert/cert.pem" ] || [ ! -f "$CLIENT_DIR/.cert/key.pem" ]; then
    echo "ℹ️  Certificates not found. Generating..."
    "$SCRIPT_DIR/make.certs.sh"
else
    echo "ℹ️  Certificates found."
fi

# =============================================================================
# BASE IMAGE CHECK (30-day cache)
# =============================================================================
echo "ℹ️  Checking E2E base image..."
IMAGE_EXISTS=$(docker images -q "$BASE_IMAGE_NAME" 2> /dev/null)

SHOULD_BUILD_BASE=false

if [ -z "$IMAGE_EXISTS" ]; then
    echo "ℹ️  Base image not found. Building..."
    SHOULD_BUILD_BASE=true
else
    # Check image age
    CREATED_AT=$(docker inspect --format='{{.Created}}' "$BASE_IMAGE_NAME")
    # Convert to timestamp (compatible with Linux date)
    CREATED_TS=$(date -d "$CREATED_AT" +%s)
    CURRENT_TS=$(date +%s)
    AGE_SECONDS=$((CURRENT_TS - CREATED_TS))
    AGE_DAYS=$((AGE_SECONDS / 86400))
    
    if [ $AGE_SECONDS -gt $CACHE_DURATION_SECONDS ]; then
        echo "ℹ️  Base image is older than 30 days ($AGE_DAYS days). Rebuilding..."
        SHOULD_BUILD_BASE=true
    else
        echo "ℹ️  Base image is fresh (Age: $AGE_DAYS days, valid for $((30 - AGE_DAYS)) more days)."
    fi
fi

if [ "$SHOULD_BUILD_BASE" = true ]; then
    echo "ℹ️  Building E2E base image (this may take a while - downloading Playwright browsers)..."
    docker build -t "$BASE_IMAGE_NAME" -f "$CLIENT_DIR/e2e-base.Dockerfile" "$CLIENT_DIR"
fi

# =============================================================================
# E2E APP IMAGE CHECK
# =============================================================================
echo "ℹ️  Checking E2E app image..."
E2E_IMAGE_EXISTS=$(docker images -q "$E2E_IMAGE_NAME" 2> /dev/null)

SHOULD_BUILD_E2E=false

if [ -z "$E2E_IMAGE_EXISTS" ]; then
    echo "ℹ️  E2E app image not found. Building..."
    SHOULD_BUILD_E2E=true
else
    # Check if package.json or package-lock.json is newer than the image
    E2E_IMAGE_TS=$(docker inspect --format='{{.Created}}' "$E2E_IMAGE_NAME" | xargs -I{} date -d {} +%s)
    
    PKG_JSON_TS=$(stat -c %Y "$CLIENT_DIR/package.json" 2>/dev/null || echo 0)
    PKG_LOCK_TS=$(stat -c %Y "$CLIENT_DIR/package-lock.json" 2>/dev/null || echo 0)
    
    if [ "$PKG_JSON_TS" -gt "$E2E_IMAGE_TS" ] || [ "$PKG_LOCK_TS" -gt "$E2E_IMAGE_TS" ]; then
        echo "ℹ️  package.json or package-lock.json changed. Rebuilding E2E app image..."
        SHOULD_BUILD_E2E=true
    else
        echo "ℹ️  E2E app image is up to date."
    fi
fi

if [ "$SHOULD_BUILD_E2E" = true ]; then
    echo "ℹ️  Building E2E app image..."
    docker compose -f compose.yml -f compose.e2e.yml build e2e
fi

# =============================================================================
# RUN E2E TESTS
# =============================================================================
echo "ℹ️  Starting backend services (server + database)..."
docker compose -f compose.yml -f compose.e2e.yml up -d server database

echo "ℹ️  Waiting for services to be ready..."
sleep 5

echo "ℹ️  Running E2E tests..."
docker compose -f compose.yml -f compose.e2e.yml run --rm e2e
E2E_EXIT_CODE=$?

echo "ℹ️  Cleaning up E2E containers..."
docker compose -f compose.yml -f compose.e2e.yml down --remove-orphans

if [ $E2E_EXIT_CODE -eq 0 ]; then
    echo "✅ E2E tests completed!"
else
    echo "❌ E2E tests failed!"
fi
echo "📊 Reports available in: client/react-client-app/playwright-report/"

exit $E2E_EXIT_CODE
