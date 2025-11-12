FROM node:25-bullseye

WORKDIR /grahak

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --mode=production
