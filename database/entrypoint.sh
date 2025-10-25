#!/usr/bin/env bash

set -euxo pipefail

ENV_FILE_PATHS="./local.env /local.env .env"

for f in $ENV_FILE_PATHS; do
  if [ -f "$f" ]; then
    echo "Found env file: $f"
    set -a
    . "$f"
    set +a
    break
  fi
done

echo "Loaded environment:"
echo "POSTGRES_USER=${POSTGRES_USER:-not set}"
echo "POSTGRES_DB=${POSTGRES_DB:-not set}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD:+(set,hidden)}"

exec docker-entrypoint.sh "$@"
