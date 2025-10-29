#!/bin/bash

echo " Running pre-commit lint checks (Node $(node -v))..."

echo " Linting frontend..."
cd client/react-client-app
npm run lint
if [ $? -ne 0 ]; then
  echo " Frontend lint failed — aborting commit."
  exit 1
fi

echo " Linting backend..."
cd ../../server/node-server-app
npm run lint
if [ $? -ne 0 ]; then
  echo " Backend lint failed — aborting commit."
  exit 1
fi

echo " Lint passed for both frontend & backend. Proceeding with commit."
exit 0
