# database

+ PostgreSql via Docker/Podman
+ Create tables...


## Database setup

```bash
podman build -f Dockerfile -t meetonline-db .
```

Run the container while passing the `.env` with Podman:

```bash
podman run \
	--name meetonline-db \
	--env-file .env \
	--publish 54321:5432 \
	--volume meetonline-db-data:/var/lib/postgresql/data \
	--detach meetonline-db
```
