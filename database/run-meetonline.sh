#!/bin/bash

set -euxo pipefail

cd "$(dirname "$0")"

podman rm -f meetonline || true

podman volume rm pgdata || true
podman volume create pgdata

dos2unix entrypoint.sh
chmod u+x entrypoint.sh

podman build --no-cache --tag meetonline .

podman run \
  --name meetonline \
  --env-file local.env \
  --publish 54321:5432 \
  --volume pgdata:/var/lib/postgresql/data \
  --detach localhost/meetonline:latest

echo "MeetOnline database container is running on port 54321"
echo "To connect: podman exec --interactive --tty meetonline psql --host=localhost --port=5432 --dbname=meetonline --username myuser --password"
