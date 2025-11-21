# meetonline

An app to let you build and find online communities.

## Run

### manual compose
```bash
# docker compose --file compose.yml down
# docker volume list | sed '1d' | awk '{print $2}' | xargs -n1 docker volume rm

# run db, server, and client
./scripts/manual-compose.sh --all
# OR
# run database and server
./scripts/manual-compose.sh --all --no-client
## +watch client changes
./scripts/watch-client.sh

# cleanup
/scripts/manual-compose.sh --clean --no-client
```

### docker compose

```bash
# run services
docker compose --file compose.yml build
docker compose --file compose.yml up
## +watch client changes
cd client/react-client-app && npm run build -- --watch

# cleanup
docker compose --file compose.yml down
# docker volume list | grep meetonline | awk '{print $2}' | xargs -n1 docker volume rm
```

## Documentation

Documentation is available in `docs/`. Visit [Documentation Home](./docs/Home.md) 

### YouTube series on development journey

- [yt/@life-goes-mild software-development](https://youtube.com/playlist?list=PLo7CWSMIloMyBvHG9RwJjEdUyNJhc-bAN&si=QCooekGGXO6LEfR3)


## LICENSE

[Read associated file: LICENSE](./LICENSE)
