# build stage
FROM node:25-bullseye AS serverbuilder

WORKDIR /server

RUN apt-get update && \
    apt-get install --yes --no-install-recommends python3 build-essential make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci --no-fund

COPY . .

# use serverbuilder
FROM node:25-slim

WORKDIR /server

COPY --from=serverbuilder /server/node_modules ./node_modules
COPY --from=serverbuilder /server .

RUN mkdir -p /server/uploads && \
    chown -R node:node /server/uploads && \
    chmod -R 755 /server/uploads

RUN mkdir -p /server/certs && \
    chown -R node:node /server/certs && \
    chmod -R 755 /server/certs

RUN mkdir -p /server/tmp && \
    chown -R node:node /server/tmp && \
    chmod -R 755 /server/tmp

ENV NODE_ENV=production

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9006 9443
USER node

ENTRYPOINT ["/usr/local/bin/entrypoint.sh", "local.env"]
