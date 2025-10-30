# database

+ PostgreSql via Docker
+ Create tables...


## Database setup

```bash
# create volume if not created
# docker volume create pgdata

docker build --no-cache --tag meetonline-database .

docker run \
    --name meetonline-database \
    --env-file local.env \
    --publish 54321:5432 \
    --volume pgdata:/var/lib/postgresql/data \
    --detach localhost/meetonline-database:latest

docker logs --follow meetonline-database
```

Run psql locally in the container

```bash
docker exec --interactive --tty meetonline-database \
    psql \
    --host=localhost \
    --port=5432 \
    --dbname=meetonline \
    --username myuser \
    --password
```

