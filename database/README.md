# MeetOnline PostgreSQL Database

PostgreSQL 18 database for the MeetOnline platform. Contains schema definitions for user accounts, profiles, groups, events, settings, and JWT token management.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Entity Relationships](#entity-relationships)
- [Docker](#docker)
- [SQL Linting](#sql-linting)
- [Database Access](#database-access)

---

## Quick Start

```bash
# Run PostgreSQL with Docker
docker-compose up meetonline-database

# Or manually with Docker
docker build -t meetonline-database .
docker run -d \
  --name meetonline-database \
  --env-file local.env \
  -p 5432:5432 \
  meetonline-database
```

---

## Environment Configuration

### Environment Files

| File | Purpose |
|------|---------|
| `local.env` | Local development configuration |
| `docker.env` | Docker deployment configuration |

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `myuser` |
| `POSTGRES_PASSWORD` | Database password | `mypassword` |
| `POSTGRES_DB` | Database name | `meetonline` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_HOST` | Database host | `localhost` |
| `PGDATA` | PostgreSQL data directory | `/var/lib/postgresql/18/docker` |

---

## Project Structure

```
database/
├── Dockerfile           # Production PostgreSQL image
├── Dockerfile.lint      # SQL linting image (sqlfluff)
├── manual.Dockerfile    # Development PostgreSQL image
├── init/
│   └── schema.sql       # Database schema (auto-executed on first run)
├── package.json         # NPM scripts for linting
├── local.env            # Local environment config
└── docker.env           # Docker environment config
```

---

## Database Schema

### Tables Overview

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `user_account` | User credentials and status | Primary user identity |
| `user_profile` | User public profile info | FK → `user_account` |
| `user_settings` | User preferences (theme, etc.) | FK → `user_profile` |
| `group` | User groups | FK → `user_profile` (owner) |
| `event` | Events and meetings | FK → `user_profile` (organizer) |
| `jwt_tokens` | JWT token storage | FK → `user_account` |
| `kv_store` | Key-value storage | Standalone |

---

### `user_account`

User credentials and account status management.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Primary key |
| `username` | `varchar(1024)` | Unique username |
| `salt` | `varchar(1024)` | Password salt |
| `password` | `varchar(1024)` | Hashed password |
| `is_active` | `boolean` | Account is active (default: `true`) |
| `is_deleted` | `boolean` | Soft delete flag |
| `is_blocked` | `boolean` | Account is blocked |
| `is_forgotten` | `boolean` | GDPR forgotten flag |
| `created_at` | `timestamp` | Creation timestamp |
| `modified_at` | `timestamp` | Last modification |

**Indexes:** `username` (unique)

---

### `user_profile`

Public user profile information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Primary key |
| `user_id` | `bigint` | FK → `user_account.id` |
| `profile_name` | `varchar(128)` | Profile name |
| `display_name` | `varchar(128)` | Public display name |
| `phone_number` | `varchar(128)` | Phone number |
| `email` | `varchar(128)` | Email address |
| `address` | `varchar(512)` | Physical address |
| `website_url` | `varchar(128)` | Website URL |
| `created_at` | `timestamp` | Creation timestamp |
| `modified_at` | `timestamp` | Last modification |

---

### `user_settings`

User preferences and UI settings.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `bigserial` | - | Primary key |
| `user_profile_id` | `bigint` | - | FK → `user_profile.id` (unique) |
| `theme` | `varchar(64)` | `system` | UI theme |
| `font_size` | `varchar(32)` | `medium` | Font size |
| `font_family` | `varchar(128)` | `system-ui` | Font family |
| `font_contrast` | `varchar(32)` | `normal` | Font contrast |
| `notifications` | `boolean` | `true` | Enable notifications |
| `online_presence` | `boolean` | `true` | Show online status |
| `sounds` | `boolean` | `true` | Enable sounds |

**Check Constraints:**
- `theme`: `system`, `light`, `dark`, `high-contrast-light`, `high-contrast-dark`, `teal`, `pink`, `red`, `sepia`, `gray`
- `font_size`: `small`, `medium`, `large`, `x-large`
- `font_contrast`: `low`, `normal`, `high`

---

### `group`

User-created groups for organizing events and members.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Primary key |
| `user_profile_id` | `bigint` | FK → `user_profile.id` (owner) |
| `group_name` | `varchar(256)` | Group name |
| `description` | `text` | Group description |
| `is_public` | `boolean` | Publicly searchable (default: `true`) |
| `members` | `text` | JSON array of member profile IDs |
| `tags` | `text` | Group tags |
| `categories` | `text` | Group categories |
| `is_deleted` | `boolean` | Soft delete flag |
| `is_hidden` | `boolean` | Hidden from listings |
| `is_archived` | `boolean` | Archived flag |
| `created_at` | `timestamp` | Creation timestamp |
| `modified_at` | `timestamp` | Last modification |

**Indexes:** `user_profile_id`, `group_name`, `is_public`, `is_hidden`, `is_archived`, `is_deleted`, `created_at DESC`

---

### `event`

Events and meetings organized by users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Primary key |
| `organiser_id` | `bigint` | FK → `user_profile.id` (creator) |
| `organisers` | `text` | Additional organizers (JSON) |
| `title` | `varchar(1024)` | Event title |
| `description` | `text` | Event description |
| `online_location` | `varchar(1024)` | Meeting URL/ID |
| `start_at` | `timestamp` | Start time |
| `end_at` | `timestamp` | End time |
| `is_paid` | `boolean` | Requires payment |
| `is_broadcast` | `boolean` | Is a broadcast event |
| `broadcast_type` | `varchar(64)` | `youtube`, `twitch`, `prerecorded` |
| `tags` | `text` | Event tags |
| `categories` | `text` | Event categories |
| `is_interactive` | `boolean` | Organizer interacts with attendees |
| `is_anonymous` | `boolean` | Anonymous attendance allowed |
| `interested` | `text` | Interested users (JSON) |
| `attached_documents` | `text` | Document links |
| `group_id` | `bigint` | FK → `group.id` (optional) |
| `is_deleted` | `boolean` | Soft delete flag |
| `is_hidden` | `boolean` | Hidden from listings |
| `is_archived` | `boolean` | Archived flag |

**Check Constraints:**
- `end_at > start_at`
- `broadcast_type IN ('youtube', 'twitch', 'prerecorded')`

**Indexes:** `start_at`, `organiser_id`, `is_hidden`, `is_archived`, `created_at DESC`

---

### `jwt_tokens`

JWT token pairs for authentication with revocation support.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Primary key |
| `user_id` | `bigint` | FK → `user_account.id` |
| `access_token` | `varchar(1024)` | JWT access token |
| `refresh_token` | `varchar(1024)` | JWT refresh token |
| `access_token_expires_at` | `timestamp` | Access token expiration |
| `refresh_token_expires_at` | `timestamp` | Refresh token expiration |
| `is_revoked` | `boolean` | Token pair revoked (default: `false`) |
| `created_at` | `timestamp` | Creation timestamp |
| `modified_at` | `timestamp` | Last modification |

**Indexes:** `user_id`, `access_token`, `refresh_token`, `is_revoked`

---

### `kv_store`

Generic key-value store for tokens and session data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `bigserial` | Auto-increment ID |
| `k` | `varchar(1024)` | Key (primary key, unique) |
| `v` | `varchar(1024)` | Value |
| `created_at` | `timestamp` | Creation timestamp |

---

## Entity Relationships

```mermaid
erDiagram
    user_account ||--o{ user_profile : "has"
    user_account ||--o{ jwt_tokens : "has"
    user_profile ||--o| user_settings : "has"
    user_profile ||--o{ group : "owns"
    user_profile ||--o{ event : "organizes"
    group ||--o{ event : "contains"

    user_account {
        bigserial id PK
        varchar username UK
        varchar password
        varchar salt
        boolean is_active
        boolean is_deleted
        boolean is_blocked
    }

    user_profile {
        bigserial id PK
        bigint user_id FK
        varchar display_name
        varchar email
        varchar phone_number
    }

    user_settings {
        bigserial id PK
        bigint user_profile_id FK_UK
        varchar theme
        varchar font_size
        boolean notifications
    }

    group {
        bigserial id PK
        bigint user_profile_id FK
        varchar group_name
        boolean is_public
        text members
    }

    event {
        bigserial id PK
        bigint organiser_id FK
        bigint group_id FK
        varchar title
        timestamp start_at
        timestamp end_at
    }

    jwt_tokens {
        bigserial id PK
        bigint user_id FK
        varchar access_token
        varchar refresh_token
        boolean is_revoked
    }

    kv_store {
        varchar k PK
        varchar v
    }
```

---

## Docker

### Dockerfiles

| File | Purpose |
|------|---------|
| `Dockerfile` | Production PostgreSQL 18 image |
| `manual.Dockerfile` | Development image |
| `Dockerfile.lint` | SQL linting with sqlfluff |

### Schema Initialization

The schema (`init/schema.sql`) is automatically executed on first container start via PostgreSQL's `docker-entrypoint-initdb.d` mechanism.

```bash
# Build and run
docker build -t meetonline-database .
docker run -d \
  --name meetonline-database \
  --env-file local.env \
  -p 5432:5432 \
  -v meetonline-db-data:/var/lib/postgresql/18/docker \
  meetonline-database
```

---

## SQL Linting

Uses [sqlfluff](https://www.sqlfluff.com/) for SQL code style enforcement.

### Requirements

- Docker

### Usage

```bash
# Lint SQL files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Configuration

SQL linting is configured in `.sqlfluff` (repository root):
- PostgreSQL dialect
- 4-space indentation
- Aligned column definitions in CREATE TABLE

### Integration

SQL linting runs automatically as part of `scripts/pre-commit.sh`.

### Docker Image

```bash
# Build lint image manually
docker build -t meetonline-sql-lint:latest -f Dockerfile.lint .
```

---

## Database Access

### Connect via psql

```bash
docker exec -it manual-meetonline-database \
  psql \
  --host=localhost \
  --port=5432 \
  --dbname=meetonline \
  --username=myuser \
  --password
```

### Connection Parameters

| Parameter | Value |
|-----------|-------|
| Host | `localhost` (local) / `meetonline-database` (Docker network) |
| Port | `5432` |
| Database | `meetonline` |
| Username | `myuser` |
| Password | `mypassword` |

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `lint` | Run sqlfluff lint |
| `lint:fix` | Auto-fix SQL issues |
