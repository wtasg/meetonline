# build stage
FROM node:25-bullseye AS builder

WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 build-essential make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# use builder

FROM node:25-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .


ENV NODE_ENV=production

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9006

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

USER node

CMD ["node", "src/server.js"]
