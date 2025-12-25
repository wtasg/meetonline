# 👋 meetonline

![License](https://img.shields.io/github/license/wtasg/meetonline) ![Issues](https://img.shields.io/github/issues/wtasg/meetonline) ![Pull Requests](https://img.shields.io/github/issues-pr/wtasg/meetonline)

`meetonline` is a full-stack web application designed for building and discovering online communities.

## 🐛 Reporting bugs

- Read up, copy-paste from [Bug Report template](./docs/bug-report-template.md)

## 💬 Discussions

[Start with introducing yourself here](https://github.com/wtasg/meetonline/discussions/84).

## 🛠️ Development/Run

### 🤖 AI / LLM

- Take help of AI/LLMs; learn what they did and implement yourself.
- Create AI PRs via AI-bots.

### 🌱 Good First Issues

- Feel free to work on them. You don't need our permission for working on GFIs.
- If you need help, ask, maybe once a day.
- [check GFIs here](https://github.com/wtasg/meetonline/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)

### 🌿 Branch naming rules

- Repository enforces branch naming pattern: `^[A-Za-z][A-Za-z0-9_/-]+$`.
- Allowed characters: ASCII letters, digits, hyphen (-), underscore (_), slash (/).
- Not allowed: emoji, spaces, other non-ASCII characters.

If your PR fails the branch-name check, rename the branch locally:

```bash
git branch -m old-name new-name
git push origin new-name
git push origin --delete old-name
```

### 📋 Checklists

- [Review Checklist](https://github.com/wtasg/meetonline/discussions/298)
- [Dev Checklist](https://github.com/wtasg/meetonline/discussions/211)

### 🔧 DevTools (Development)

For enhanced developer experience, we provide an internal DevTools system with CRUD operations for features:

```bash
# Install DevTools (one-time setup)
cd devtool
./install.sh

# Start development with DevTools
cd server/node-server-app
NODE_ENV=development npm run dev

# In another terminal
cd client/react-client-app
npm run dev
```

DevTools provides a floating UI panel for managing users, events, groups, and profiles. See [DevTools Usage Guide](./devtool/USAGE.md) for details.

### ⌨️ Manual Compose

```bash
## make certificates
./scripts/make.certs.sh

## make environment
./scripts/make.env.sh

## install pacakges
./scripts/package.install.sh

## update pacakges
./scripts/package.update.sh

## run tests
## e2e takes time; be patient
./scripts/test.sh

# docker compose --file compose.yml down
# docker volume list | sed '1d' | awk '{print $2}' | xargs -n1 docker volume rm

# run database and server
./scripts/manual-compose.sh --all --no-client
## +watch client changes
./scripts/watch-client.sh

## accept certs
## add meet.online in /etc/hosts
echo "127.0.0.1 meet.online" | sudo tee -a /etc/hosts
# visit https://meet.online:9443/ and accept certs
# visit https://meet.online:5173/ and accept certs

# cleanup
/scripts/manual-compose.sh --clean --no-client
```

## 📚 Documentation

Documentation is available in `docs/`. Visit **[Documentation Home](./docs/Home.md)**

### Component Documentation

- [React Client](./client/react-client-app/README.md) - Frontend application
- [Node.js Server](./server/node-server-app/README.md) - Backend API
- [PostgreSQL Database](./database/README.md) - Database schema

### Features

- [System Architecture](./docs/architecture.md)
- [JWT Authentication](./docs/jwt-authentication.md)
- [Search Feature](./docs/search-feature.md)
- [Notifications](./docs/notifications.md)
- [Theme System](./docs/theme-system.md)
- [CSS Architecture](./docs/css-architecture.md)

## 🌐 Social

- [YouTube Playlist: software-development](https://www.youtube.com/playlist?list=PLbUtscuRQ61xiGmjCL00Ime9z5sJEZu4M)
- [Discord Invite: discord.gg/Zfxr8pwKcq](https://discord.gg/Zfxr8pwKcq)
- Lead developer discord: @wtasd

## 📜 LICENSE

[Read associated file: LICENSE](./LICENSE)
