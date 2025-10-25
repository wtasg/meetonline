#!/bin/bash

set -euxo pipefail

cd "$(dirname "$0")"

podman rm -f meetonline || true

podman volume rm pgdata || true
podman volume create pgdata

dos2unix entrypoint.sh
chmod u+x entrypoint.sh

podman build --no-cache -t meetonline .

podman run \
  --name meetonline \
  --env-file local.env \
  -p 54321:5432 \
  -v pgdata:/var/lib/postgresql/data \
  --detach localhost/meetonline:latest

echo "MeetOnline database container is running on port 54321"
podman ps --filter "name=meetonline"
echo "To connect: psql -h localhost -p 54321 -U <username> -d <database>"
