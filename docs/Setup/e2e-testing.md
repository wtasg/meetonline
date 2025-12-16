# E2E Testing with Docker

Run Playwright E2E tests in a Docker container with all browser dependencies pre-installed.

## Quick Start

```bash
./scripts/run-e2e.sh
```

## Manual Commands

```bash
# Build the E2E image
docker compose -f compose.yml -f compose.e2e.yml build e2e

# Start backend services
docker compose -f compose.yml -f compose.e2e.yml up -d server database

# Run E2E tests
docker compose -f compose.yml -f compose.e2e.yml run --rm e2e
```

## Configuration

| File | Description |
|------|-------------|
| `client/react-client-app/e2e.Dockerfile` | Playwright Docker image |
| `client/react-client-app/e2e.env` | E2E environment config |
| `compose.e2e.yml` | Docker Compose extension |

## Key Details

- **Port**: E2E tests run on port `5180` (separate from dev port `5173`)
- **Base Image**: `mcr.microsoft.com/playwright:latest`
- **Reports**: `client/react-client-app/playwright-report/`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `https://localhost:5180` | Base URL for tests |
| `E2E_PORT` | `5180` | Vite dev server port |
| `VITE_API_URL` | `https://host.docker.internal:9443` | API server URL |

## See Also

- [Docker Setup](./docker.md)
- [Setup Repo](./setup-repo.md)
