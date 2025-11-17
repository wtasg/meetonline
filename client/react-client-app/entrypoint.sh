#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

for f in "$@"; do
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

# npm run dev

serve -s dist --listen 5173
