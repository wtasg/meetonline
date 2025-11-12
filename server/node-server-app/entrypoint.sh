#!/usr/bin/env bash

# Minimal entrypoint for the server image.
# Loads environment variable files if present, then execs the given command.

set -euxo pipefail

# Files we will check for environment variables (in order)
ENV_FILE_PATHS="docker.env"

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

node src/server.js
