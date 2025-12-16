# E2E Test Dockerfile
# Builds on top of the cached base image
# Installs app dependencies but source is mounted at runtime

ARG BASE_IMAGE=meetonline-e2e-base:latest
FROM ${BASE_IMAGE}

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Playwright browsers are already installed in the base image
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Default E2E port
ENV E2E_PORT=5180

# Expose the E2E test port
EXPOSE 5180

# Source code and certificates are mounted as volumes at runtime
# See compose.e2e.yml for volume configuration

# Run E2E tests
CMD ["npm", "run", "e2e:docker"]
