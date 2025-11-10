# Stage 1: Build React client
FROM node:25-bullseye AS clientbuilder

WORKDIR /client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve built files using 'serve'
FROM node:25-bullseye
WORKDIR /client
RUN npm install --location=global serve

COPY --from=clientbuilder /client/dist ./dist
COPY --from=clientbuilder /client/.cert ./.cert

RUN chown -R node:node /client

RUN chown -R node:node .cert && \
    chmod 600 .cert/key.pem && \
    chmod 644 .cert/cert.pem

EXPOSE 5173

USER node

CMD ["serve", "-s", "dist", "--listen", "5173"]
# Following doesn't work: it cannot find the files.
# CMD ["npx", "serve", "-s", "dist", "--ssl-key","/client/.cert/key.pem", "--ssl-cert", "/client/.cert/cert.pem",  "--listen", "5443"]
