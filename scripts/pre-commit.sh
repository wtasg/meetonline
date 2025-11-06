#!/usr/bin/env bash

echo "Running lint before commit..."

# Move to repo root
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Run server lint
cd server/node-server-app
npm run lint
SERVER_RESULT=$?

# Run client lint
cd ../../client/react-client-app
npm run lint
CLIENT_RESULT=$?

# Check results
if [[ "$SERVER_RESULT" -ne 0 || "$CLIENT_RESULT" -ne 0 ]]; then
  echo "❌ Lint failed — aborting commit."
  exit 1
fi

echo "✅ Lint passed — proceeding with commit."
exit 0

