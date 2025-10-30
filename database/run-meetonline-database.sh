#!/bin/bash

set -euxo pipefail

cd "$(dirname "$0")"

# docker network create meetonline-network || true
# if docker network inspect meetonline-network >/dev/null 2>&1; then
#     echo "Network already exists"
# else
#     echo "Creating network..."
#     docker network create meetonline-network || true
# fi

# docker volume rm pgdata || true
# EXISTS_VOLUME=`docker volume ls --filter name=pgdata | sed '1d' | awk '{print $2}'`
if docker volume inspect pgdata >/dev/null 2>&1; then
    echo "Volume already exists"
else
    echo "Creating volume..."
    docker volume create pgdata
fi

dos2unix entrypoint.sh
chmod u+x entrypoint.sh

docker build --no-cache --tag meetonline-database .

if docker ps --filter name=meetonline-database --format "{{.Names}}" | grep -w meetonline-database >/dev/null 2>&1; then
    echo "Container is already running"
    docker stop meetonline-database
    docker rm meetonline-database
    docker run \
        --name meetonline-database \
        --env-file local.env \
        --publish 54321:5432 \
        --volume pgdata:/var/lib/postgresql \
        --detach localhost/meetonline-database:latest
fi

echo "MeetOnline database container is running on port 54321"
echo "To connect: docker exec --interactive --tty meetonline-database psql --host=localhost --port=5432 --dbname=meetonline --username myuser --password"
