FROM node:25-bullseye

WORKDIR /grahak

COPY package.json package-lock.json ./

RUN npm ci --only-production --no-fund

COPY . .

RUN npm run build -- --mode=production
