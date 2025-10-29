#!/bin/bash

set -euxo pipefail

cd "$(dirname "$0")"

# podman network create meetonline-network || true
# if podman network inspect meetonline-network >/dev/null 2>&1; then
#     echo "Network already exists"
# else
#     echo "Creating network..."
#     podman network create meetonline-network || true
# fi

# podman volume rm pgdata || true
# EXISTS_VOLUME=`podman volume ls --filter name=pgdata | sed '1d' | awk '{print $2}'`
if podman volume inspect pgdata >/dev/null 2>&1; then
    echo "Volume already exists"
else
    echo "Creating volume..."
    podman volume create pgdata
fi

dos2unix entrypoint.sh
chmod u+x entrypoint.sh

podman build --no-cache --tag meetonline-database .

if podman ps --filter name=meetonline-database --format "{{.Names}}" | grep -w meetonline-database >/dev/null 2>&1; then
    echo "Container is already running"
    podman stop meetonline-database
    podman rm meetonline-database
    podman run \
        --name meetonline-database \
        --env-file local.env \
        --publish 54321:5432 \
        --volume pgdata:/var/lib/postgresql/data \
        --detach localhost/meetonline-database:latest
fi

echo "MeetOnline database container is running on port 54321"
echo "To connect: podman exec --interactive --tty meetonline-database psql --host=localhost --port=5432 --dbname=meetonline --username myuser --password"
