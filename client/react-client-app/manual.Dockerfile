FROM node:25-bullseye AS clientbuilder

WORKDIR /grahak

COPY package.json package-lock.json ./

RUN npm ci --no-fund

COPY . .

ARG ENV_FILE=local.env
ENV VITE_ENV_FILE=${ENV_FILE}

RUN npm run build:certs
RUN npm run build -- --mode=development

FROM node:25-bullseye AS clientrunner

WORKDIR /app
RUN ["npm", "install", "--location=global", "serve"]

COPY --from=clientbuilder /grahak/dist /app/dist
COPY --from=clientbuilder /grahak/.cert /app/.cert
COPY --from=clientbuilder /grahak/.env /app/.env
COPY --from=clientbuilder /grahak/entrypoint.sh /app/entrypoint.sh

RUN chown -R node:node /app/dist
COPY entrypoint.sh /app/entrypoint.sh

RUN chown -R node:node /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ARG ENV_FILE=local.env
ENV VITE_ENV_FILE=${ENV_FILE}
ENV NODE_ENV=development

RUN chown -R node:node /app/.cert && \
    chmod 600 /app/.cert/key.pem && \
    chmod 644 /app/.cert/cert.pem

EXPOSE 5173

USER node

# CMD ["serve", "-s", "dist", "--listen", "5173"]

ENTRYPOINT ["/app/entrypoint.sh", "${ENV_FILE}"]

