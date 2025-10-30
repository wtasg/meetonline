# meetonline server


## docker

```bash
# docker network create meetonline-network

docker build \
    --tag meetonline-server \
    --file Dockerfile .

docker run \
    --name meetonline-server \
    --publish 9006:9006 \
    --env-file local.env \
    --env-file .env \
    --env-file docker.env \
    --detach meetonline-server
```
