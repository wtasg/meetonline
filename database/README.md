# database

+ PostgreSql via Docker/Podman
+ Create tables...


## Database setup

```bash
# create volume if not created
# podman volume create pgdata

podman build --no-cache --tag meetonline .

podman run \
  --name meetonline \
  --env-file local.env \
  --publish 54321:5432 \
  --volume pgdata:/var/lib/postgresql/data \
  --detach localhost/meetonline:latest

podman logs --follow meetonline
```

Run psql locally in the container

```bash
podman exec --interactive --tty meetonline \
    psql \
    --host=localhost \
    --port=5432 \
    --dbname=meetonline \
    --username myuser \
    --password
```
