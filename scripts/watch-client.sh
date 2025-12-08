#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

CLIENT_DIR="client/react-client-app"
CONTAINER_NAME="manual-meetonline-client-dev"
PORT=5173

cleanup() {
    echo "Stopping dev client..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
    exit 0
}
trap cleanup INT TERM

echo "Starting Vite dev server in Docker with live reload..."

docker run \
    --user $(id -u):$(id -g) \
    --name "$CONTAINER_NAME" \
    --network manual-meetonline-network \
    --env-file "$CLIENT_DIR/local.env" \
    --volume "$(pwd)/$CLIENT_DIR:/app" \
    --workdir /app \
    --publish $PORT:$PORT \
    --detach node:25-bullseye \
    bash -c "npm run dev -- --host"

echo "Dev client is running. Hit CTRL+C to exit."

docker logs --follow "${CONTAINER_NAME}"

echo "Stopping container."

docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
