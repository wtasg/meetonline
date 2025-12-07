# meetonline

<p align="center">

<!-- ⭐ GitHub Stars -->
<a href="https://github.com/wtasg/meetonline/stargazers">
  <img src="https://img.shields.io/github/stars/wtasg/meetonline?style=for-the-badge&color=yellow" alt="GitHub stars" />
</a>

<!-- 🍴 Forks -->
<a href="https://github.com/wtasg/meetonline/network/members">
  <img src="https://img.shields.io/github/forks/wtasg/meetonline?style=for-the-badge&color=blue" alt="GitHub forks" />
</a>

<!-- 🐛 Open Issues -->
<a href="https://github.com/wtasg/meetonline/issues">
  <img src="https://img.shields.io/github/issues/wtasg/meetonline?style=for-the-badge&color=red" alt="Open issues" />
</a>

<!-- 🔒 License -->
<a href="https://github.com/wtasg/meetonline/blob/main/LICENSE">
  <img src="https://img.shields.io/github/license/wtasg/meetonline?style=for-the-badge&color=green" alt="License" />
</a>

</p>

An app to let you build and find online communities.

---

## Reporting bugs

-   Read up, copy-paste from [Bug Report template](./docs/bug-report-template.md)

## Discussions

Start with introducing yourself [here](https://github.com/wtasg/meetonline/discussions/84).

---

## Development / Run

### Good First Issues

-   Feel free to work on them. You don't need our permission for working on GFIs.
-   If you need help, ask, maybe once a day.
-   [Check GFIs here](https://github.com/wtasg/meetonline/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)

---

### Checklists

-   [Review Checklist](https://github.com/wtasg/meetonline/discussions/298)
-   [Dev Checklist](https://github.com/wtasg/meetonline/discussions/211)

---

### Manual Compose

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
