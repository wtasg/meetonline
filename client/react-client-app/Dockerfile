FROM node:25-bullseye

WORKDIR /app

COPY . .

RUN <<EOF
rm -rf node_modules .cert
chown -R node:node /app
EOF
