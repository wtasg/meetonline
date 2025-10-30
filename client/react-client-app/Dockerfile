# Stage 1: Build React App
FROM node:25-bullseye AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve built files using 'serve'
FROM node:25-bullseye
WORKDIR /usr/src/app
RUN npm install -g serve

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
