#!/usr/bin/env bash

set -euxo pipefail

cp client/react-client-app/docker.env client/react-client-app/.env
cp database/local.env database/.env
cp server/node-server-app/local.env server/node-server-app/.env

