#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd server/node-server-app
npm install --no-fund
npm run build:certs
cd ../..

cd client/react-client-app
npm install --no-fund
npm run build:certs
cd ../..
