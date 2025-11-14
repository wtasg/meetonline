# meetonline server

## Docker (manually)

```bash

docker build \
    --tag localhost/meetonline-server:manual \
    --file Dockerfile .

docker run \
    --name manual-meetonline-server \
    --publish 9006:9006 \
    --env-file local.env \
    --env-file .env \
    --env-file docker.env \
    --detach localhost/meetonline-server:manual
```
