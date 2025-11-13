# npm

#tech #npm

> [!Danger]
> Do not use `sudo`


> [!Info]
> Install via `nvm`

## install | clean-install

```bash
npm install [--save-dev | --save | --no-fund | --location=global]
# npm i

npm clean-install
# npm ci
```

- Provide same flags to `clean-install` as were provided to `install`.
- `clean-install` OR `ci` deletes node_modules dir, and installs everything afresh.
- `clean-install`
  - needs a lock or shrinkwrap file
    - cannot install individual package
    - fails if lock differs from package
