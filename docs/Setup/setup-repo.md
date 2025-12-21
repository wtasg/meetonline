# Setting up repo for Development

#git  #setup

## make scripts executable

```bash
chmod u+x ./scripts/pre-commit.sh
chmod u+x ./scripts/make.certs.sh
chmod u+x ./scripts/make.env.sh
```

## git hooks: pre-commit

This hook is managed manually.
You need to add this to your .git/hooks/pre-commit file

```bash
#!/usr/bin/env bash

bash ./scripts/pre-commit.sh
```

`./scripts/pre-commit.sh` exists in git repo

> [!NOTE] filename
> The filename is `pre-commit.sample` in the git repo
> rename it to `pre-commit` to enable it
> No .sh extension required

> [!NOTE] permissions
> make sure the file is executable
> `chmod u+x ./scripts/pre-commit.sh`

## Local Domain Setup

The application is configured to run on `meet.online` locally. You need to map this domain to your local machine in your `/etc/hosts` file:

```text
127.0.0.1 meet.online
```

## Certificate Generation

The `./scripts/make.certs.sh` script generates SSL certificates specifically for `meet.online`. This is required for the application to serve traffic over HTTPS locally.

## before running docker compose

Make sure that the certificates are built and
that the .env files are present by executing the scripts

```bash
./scripts/make.certs.sh
./scripts/make.env.sh
docker compose --file compose.yml up --build
```
