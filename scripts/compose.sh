#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

docker compose --file compose.yml down
docker volume rm meetonline_client_dist
docker compose --file compose.yml up --build

exit 0
