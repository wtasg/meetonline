# Setting up repo for Development

## git hooks: pre-commit

This hook is managed manually. You need to add this to your .git/hooks/pre-commit file

```bash
#!/usr/bin/env bash

./scripts/pre-commit.sh
```

`./scripts/pre-commit.sh` exists in git repo 
