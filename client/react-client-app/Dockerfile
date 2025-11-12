# Stage 1: Build React client
FROM node:25-bullseye AS clientbuilder

WORKDIR /client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --mode=production

# Stage 2: Export build output to volume
FROM busybox AS export
COPY --from=clientbuilder /client/dist /dist
CMD ["sh", "-c", "cp -r /dist/* /out && echo 'Build copied to volume' && sleep infinity"]



