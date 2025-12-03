# meetonline

An app to let you build and find online communities.

## Reporting bugs

- Read up, copy-paste from [Bug Report template](./docs/bug-report-template.md)

## Discussions

Start with introducing yourself [here](https://github.com/wtasg/meetonline/discussions/84).

## Development/Run

### Checklists

- [Review Checklist](https://github.com/wtasg/meetonline/discussions/298)
- [Dev Checklist](https://github.com/wtasg/meetonline/discussions/211)

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

## Social

- [YouTube playlist](https://www.youtube.com/playlist?list=PLbUtscuRQ61xiGmjCL00Ime9z5sJEZu4M)
- [Discord invite](https://discord.gg/QFBPAseR)
- We might be slow to respond, don't hesitate to ping again.

## LICENSE

[Read associated file: LICENSE](./LICENSE)
