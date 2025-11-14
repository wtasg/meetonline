#!/usr/bin/env bash

# set -euxo pipefail

docker compose --file compose.yml down
docker volume rm meetonline_client_dist
docker compose --file compose.yml up --build
