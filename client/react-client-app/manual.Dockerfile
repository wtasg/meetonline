FROM node:25-bullseye AS clientbuilder

WORKDIR /grahak

COPY package.json package-lock.json ./

RUN npm ci --no-fund

COPY . .

RUN npm run build -- --mode=production

FROM node AS clientrunner

WORKDIR /app
RUN ["npm", "install", "--location=global", "serve"]

COPY --from=clientbuilder /grahak/dist /app/dist
COPY --from=clientbuilder /grahak/.cert /app/.cert

RUN chown -R node:node /app/dist

RUN chown -R node:node /app/.cert && \
    chmod 600 /app/.cert/key.pem && \
    chmod 644 /app/.cert/cert.pem

EXPOSE 5173

USER node

CMD ["serve", "-s", "dist", "--listen", "5173"]
