#!/usr/bin/env bash

echo "Running lint before commit..."

# Move to repo root
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT" || exit 1

# Run SQL lint
echo "Running SQL lint..."
cd database || exit 1
npm run lint
SQL_RESULT=$?

# Run server lint
echo "Running server lint..."
cd ../server/node-server-app || exit 1
npm run lint
SERVER_RESULT=$?

# Run client lint
echo "Running client lint..."
cd ../../client/react-client-app || exit 1
npm run lint
CLIENT_RESULT=$?

# Check results
if [[ "$SQL_RESULT" -ne 0 || "$SERVER_RESULT" -ne 0 || "$CLIENT_RESULT" -ne 0 ]]; then
  echo "Lint failed — aborting commit."
  exit 1
fi

echo "Lint passed — proceeding with commit."

exit 0
