#!/usr/bin/env bash

apt-get update
apt-get install --yes gosu

set -euxo pipefail

ENV_FILE_PATHS="$@"

for f in $ENV_FILE_PATHS; do
    if [ -f "$f" ]; then
        echo "Found env file: $f"
        set -a
        . "$f"
        set +a
        # break
    fi
done

echo "Loaded environment:"
echo "POSTGRES_USER=${POSTGRES_USER:-not set}"
echo "POSTGRES_DB=${POSTGRES_DB:-not set}"
echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD:+(set,hidden)}"

# Drop privilege and run the server as postgres user
exec gosu postgres postgres
