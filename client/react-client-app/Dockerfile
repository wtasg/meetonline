# Stage 1: Build React client
FROM node:25-bullseye AS clientbuilder

WORKDIR /client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --mode=production

# Stage 2: Serve built files using 'serve'
FROM node:25-bullseye
WORKDIR /client
RUN npm install --location=global serve

RUN mkdir -p /usr/src/app/certs

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173", "--ssl-cert", "/usr/src/app/certs/server.crt", "--ssl-key", "/usr/src/app/certs/server.key"]
