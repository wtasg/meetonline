# database

+ PostgreSql via Docker
+ Create tables...


## Database setup

```bash
# create volume if not created
# docker volume create pgdata

docker build \
    --no-cache \
    --tag localhost/meetonline-database:manual \
    --file Dockerfile .

docker run \
    --name manual-meetonline-database \
    --env-file local.env \
    --env-file docker.env \
    --publish 5432:5432 \
    --volume pgdata:/var/lib/postgresql/data \
    --detach localhost/meetonline-database:manual

docker logs --follow meetonline-database
```

Run psql locally in the container

```bash
docker exec --interactive --tty manual-meetonline-database \
    psql \
    --host=localhost \
    --port=5432 \
    --dbname=meetonline \
    --username myuser \
    --password
```
