# E2E Base Dockerfile
# Contains ONLY heavy dependencies: Playwright browsers, ffmpeg, openssl
# This image is cached for 30 days to avoid costly rebuilds
# App dependencies and source code are mounted at runtime

FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Install system tools (ffmpeg for video, openssl for certs if needed)
RUN apt-get update && \
    apt-get install --yes --no-install-recommends ffmpeg openssl && \
    rm -rf /var/lib/apt/lists/*

# Pre-install Playwright browsers in the base image
# The official Playwright image already has browsers, but we ensure consistency
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install-deps && npx playwright install

# This base image intentionally does NOT include:
# - package.json (app deps change frequently)
# - Source code (will be mounted as volume)
# - Certificates (will be mounted from host)
