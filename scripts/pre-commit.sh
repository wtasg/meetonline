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

# Run markdown lint
echo "Running markdown lint..."
cd ../.. || exit 1
./node_modules/.bin/markdown-link-check --ignore node_modules --quiet **/*.md
MARKDOWN_RESULT=$?

# Check results
if [[ "$SQL_RESULT" -ne 0 || "$SERVER_RESULT" -ne 0 || "$CLIENT_RESULT" -ne 0 || "$MARKDOWN_RESULT" -ne 0 ]]; then
  echo "Lint failed: Do not commit!"
  exit 1
fi

echo "Lint passed: You can proceed with commit."

exit 0
