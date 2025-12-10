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

** Below needs update **
## before running docker compose

Make sure that the certificates are built and 
that the .env files are present by executing the scripts

```bash
./scripts/make.certs.sh
./scripts/make.env.sh
docker compose --file compose.yml up --build
```
