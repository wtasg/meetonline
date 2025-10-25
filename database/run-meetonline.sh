#!/bin/bash

set -euxo pipefail

cd "$(dirname "$0")"

podman rm -f meetonline || true

podman volume rm pgdata || true

dos2unix entrypoint.sh
chmod +x entrypoint.sh

podman build --no-cache -t meetonline .

podman run \
  --name meetonline \
  --env-file local.env \
  -p 54321:5432 \
  -v pgdata:/var/lib/postgresql/data \
  --detach localhost/meetonline:latest

podman ps
podman logs meetonline
