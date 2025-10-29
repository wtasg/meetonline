#!/usr/bin/env bash

# Minimal entrypoint for the server image.
# Loads environment variable files if present, then execs the given command.

set -euxo pipefail

# Files we will check for environment variables (in order)
ENV_FILE_PATHS=".env local.env docker.env"

for f in $ENV_FILE_PATHS; do
  if [ -f "$f" ]; then
    echo "Found env file: $f"
    # export all variables defined in the file
    set -a
    # shellcheck disable=SC1090
    . "$f"
    set +a
    # break
  fi
done

echo "Starting server with NODE_ENV=${NODE_ENV:-not set} PORT=${SERVER_PORT:-9006}"

exec "$@"
