# meetonline server


## podman

```bash
# podman network create meetonline-network

podman build \
    --tag meetonline-server \
    --file Dockerfile .

podman run \
    --name meetonline-server \
    --publish 9006:9006 \
    --env-file local.env \
    --env-file .env \
    --env-file docker.env \
    --detach meetonline-server
```
