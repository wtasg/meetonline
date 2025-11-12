FROM node:25-bullseye AS clientbuilder

WORKDIR /client

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --mode=production

FROM busybox AS export
COPY --from=clientbuilder /client/dist /dist
COPY --from=clientbuilder /client/.cert /.cert
