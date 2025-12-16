# Agent Documentation

This document provides guidance for AI agents working on the meetonline codebase.

## Project Overview

**meetonline** is an application to help users build and find online communities. It's built as a full-stack web application with authentication, user accounts, and community features.

## Architecture

The project follows a multi-service architecture:

- **Client**: React application built with Vite
- **Server**: Node.js/Express backend with HTTPS/HTTP2 support
- **Database**: PostgreSQL
- **Proxy**: Nginx reverse proxy
- **Deployment**: Docker Compose orchestration

### Directory Structure

```text
meetonline/
├── client/react-client-app/    # Frontend React application
├── server/node-server-app/     # Backend Node.js/Express server
├── database/                   # PostgreSQL database setup
├── proxy/                      # Nginx reverse proxy configuration
├── scripts/                    # Build and development scripts
└── docs/                       # Documentation
```

## Technology Stack

### Frontend

- **Framework**: React 19.x
- **Build Tool**: Vite
- **Testing**: Vitest (unit), Playwright (e2e)
- **Linting**: ESLint with stylistic plugin

### Backend

- **Runtime**: Node.js (ES modules)
- **Framework**: Express 5.x
- **Testing**: Jest
- **Linting**: ESLint with stylistic plugin
- **Key Libraries**:
  - `bcrypt` - password hashing
  - `pg` - PostgreSQL client
  - `multer` - file uploads
  - `helmet` - security headers
  - `cors` - CORS handling
  - `cookie-parser` - cookie parsing
  - `compression` - response compression
  - `morgan` - HTTP logging

### Database

- **Database**: PostgreSQL
- **Schema**: Located in `database/init/schema.sql`

### DevOps

- **Containerization**: Docker & Docker Compose
- **HTTPS**: Self-signed certificates (development)
- **Pre-commit**: Custom git hooks via `scripts/pre-commit.sh`

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Git with proper configuration

### Initial Setup

First of all, Step 1. Make scripts executable:

```bash
chmod u+x ./scripts/pre-commit.sh
chmod u+x ./scripts/make.certs.sh
chmod u+x ./scripts/make.env.sh
```

Then, Step 2. Set up git hooks:

```bash
# Add to .git/hooks/pre-commit

#!/usr/bin/env bash
bash ./scripts/pre-commit.sh
```

Then, Step 3. Generate certificates and environment files:

```bash
./scripts/make.certs.sh
./scripts/make.env.sh
```

### Running the Application

**Docker Compose (recommended):**

```bash
docker compose --file compose.yml build
docker compose --file compose.yml up

# Watch client changes
cd client/react-client-app && npm run build -- --watch
```

**Manual Compose:**

```bash
# Run all services
./scripts/manual-compose.sh --all

# Run without client (for development)
./scripts/manual-compose.sh --all --no-client
# Then watch client changes
./scripts/watch-client.sh
```

## Code Conventions

### General Rules

- **Be nice and disagree politely** - from [rules.md](docs/rules.md)
- **Code formatting**: Follow `.editorconfig` settings
  - Indent: 4 spaces (default)
  - Indent: 2 spaces (JSON, YAML)
  - End of line: LF
  - Charset: UTF-8
  - Max line length: 120 characters
  - Insert final newline: true
  - Trim trailing whitespace: true (except markdown)

### Git Workflow

#### Branch Naming

- Pattern: `^[A-Za-z][A-Za-z0-9_/-]+$`
- Allowed: ASCII letters, digits, hyphen (-), underscore (_), slash (/)
- **NOT allowed**: emoji, spaces, non-ASCII characters

#### Branch Types

- Bot branches: if you are a bot
  - `BOTNAME__ISSUENUMBER`:
    - example `copilot__333` when bot is copilot and issue fixed is 333

#### Branch Strategy

- **Do NOT** push directly to `main`
- **Do NOT** merge locally - use `rebase` instead
- Use `main` branch only to `pull --rebase` code

#### Merging PRs

- Merge with **only one commit** (squash locally or in PRs)
- Merge with Squash if commits are low quality
- Merge with commits if commits are good quality
- **Keep track of due credit** - ensure each contributor gets at least one commit
- Do not hide or overtake someone else's work

### JavaScript/TypeScript Conventions

- **Type**: ES Modules (`"type": "module"` in package.json)
- **Linting**: Use ESLint with the project configuration
- **Fix linting**: `npm run lint:fix`

### Testing

#### Server Tests (Jest)

```bash
cd server/node-server-app
npm run test                # Run tests
npm run test:jest:watch     # Watch mode
npm run cover               # Coverage report
```

#### Client Tests

```bash
cd client/react-client-app
npm run test                # Run Vitest tests
npm run test:ui             # Vitest UI
npm run test:coverage       # Coverage report
npm run e2e                 # Playwright e2e tests
```

### Authentication Architecture

The application uses token-based authentication with sessions:

1. **Signup Flow**:
   - GET /signup → returns token
   - POST /signup {token, username, password} → creates user account

2. **Login Flow**:
   - GET /login → returns token
   - POST /login {token, username, password} → returns session cookie

See [Authentication Architecture](docs/architecture/Authentication%20Architecture.md) for detailed flow diagrams.

## Common Tasks

### Adding Dependencies

- Server: `cd server/node-server-app && npm install <package>`
- Client: `cd client/react-client-app && npm install <package>`

### Running Linters

```bash
# Server
cd server/node-server-app && npm run lint

# Client
cd client/react-client-app && npm run lint
```

### Building

```bash
# Server
cd server/node-server-app && npm run build

# Client
cd client/react-client-app && npm run build
```

### Certificate Generation

`./scripts/make.certs.sh` OR

```bash
# Server certificates
cd server/node-server-app && npm run build:certs

# Client certificates
cd client/react-client-app && npm run build:certs
```

## Bug Reports

Use the template at [docs/bug-report-template.md](docs/bug-report-template.md):

- Describe the problem with checkboxes
- Explain expected behavior
- Provide step-by-step reproduction
- Include logs, environment, and additional information

## Documentation

- **Home**: [docs/Home.md](docs/Home.md)
- **Rules**: [docs/rules.md](docs/rules.md)
- **Setup**: [docs/Setup/setup-repo.md](docs/Setup/setup-repo.md)
- **Tech Index**: [docs/tech/tech-index.md](docs/tech/tech-index.md)
- **Daily Sync**: [docs/daily-sync.md](docs/daily-sync.md)

## Community

- **GitHub Discussions**: Start by introducing yourself at [Discussion #84](https://github.com/wtasg/meetonline/discussions/84)
- **Discord**: [discord.gg/Zfxr8pwKcq](https://discord.gg/Zfxr8pwKcq)
- **YouTube**: [software-development playlist](https://www.youtube.com/playlist?list=PLbUtscuRQ61xiGmjCL00Ime9z5sJEZu4M)
- **Good First Issues**: [Check here](https://github.com/wtasg/meetonline/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22)

## Checklists

- [Review Checklist Discussion](https://github.com/wtasg/meetonline/discussions/298)
  - [Review Checklist Document](./docs/checklists/review-checklist.md)
- [Dev Checklist Discussion](https://github.com/wtasg/meetonline/discussions/211)
  - [Dev Checklist Document](./docs/checklists/dev-checklist.md)

## License

This project is released into the public domain under the Unlicense. See [LICENSE](LICENSE) file for details.
