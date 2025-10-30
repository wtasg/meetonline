# Setting up docker images, containers, compose

```bash
docker build --file database/Dockerfile --tag meetonline-database database
docker build --file server/node-server-app/Dockerfile --tag meetonline-server server/node-server-app
docker build --file client/react-client-app/Dockerfile --tag meetonline-client client/react-client-app

docker compose --file compose.yml up --detach
docker compose --file compose.yml down
```
