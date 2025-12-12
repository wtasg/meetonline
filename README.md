# meetonline

An app to let you build and find online communities.

## Reporting bugs

- Read up, copy-paste from [Bug Report template](./docs/bug-report-template.md)

## Discussions

[Start with introducing yourself here](https://github.com/wtasg/meetonline/discussions/84).

## Development/Run

### AI / LLM

- Take help of AI/LLMs; then implement yourself.
- AI code/documentation PR by user will be closed.
- Create AI PRs via AI-bots.

### good first issues

- Feel free to work on them. You don't need our permission for working on GFIs.
- If you need help, ask, maybe once a day.
- [check GFIs here](https://github.com/wtasg/meetonline/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)

### Branch naming rules

- Repository enforces branch naming pattern: `^[A-Za-z][A-Za-z0-9_-]+$`.
- Allowed characters: ASCII letters, digits, hyphen (-), underscore (_).
- Not allowed: slashes (/), emoji, spaces, other non-ASCII characters.

If your PR fails the branch-name check, rename the branch locally:

```bash
git branch -m old-name new-name
git push origin new-name
git push origin --delete old-name
```

### Checklists

- [Review Checklist](https://github.com/wtasg/meetonline/discussions/298)
- [Dev Checklist](https://github.com/wtasg/meetonline/discussions/211)

### manual compose

```bash
## make certificates
./scripts/make.certs.sh 

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

- [YouTube Playlist: software-development](https://www.youtube.com/playlist?list=PLbUtscuRQ61xiGmjCL00Ime9z5sJEZu4M)
- [Discord Invite: discord.gg/Zfxr8pwKcq](https://discord.gg/Zfxr8pwKcq)
- Lead developer discord: @wtasd

## LICENSE

[Read associated file: LICENSE](./LICENSE)
