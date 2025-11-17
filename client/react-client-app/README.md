# Client application in react

+ Vanilla JavaScript
+ JsDocs
+ Fast iteration + tests + small, non-destructive commits +... 

## Docker (manually)

```bash
docker build \
    --tag localhost/meetonline-client:manual \
    --file manual.Dockerfile .

docker run \
    --name manual-meetonline-client \
    --publish 5173:5173 \
    --env-file .env \
    --detach localhost/meetonline-client:manual
    
```
