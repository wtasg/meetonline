#!/usr/bin/env bash

set -euxo pipefail

cd server/node-server-app
npm install
npm run build:certs
cd ../..

