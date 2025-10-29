# Git Commands for Developers

## pulling changes

```bash
git pull --rebase origin main
```

## pushing changes

```bash
## pull changes before pushing changes
git pull --rebase origin main

## solve conflicts

## then push
git push origin <BRANCH>
```

## branches

```bash
## always go to main before creating a new branch for development of a new feature
git checkout main
# pull rebase
git switch --create feature_be_new_branch
# work
# commit
# push
git push origin feature_be_new_branch
```

## Config

```bash
## for global settings
git config --global core.autocrlf false
git config --global core.pager cat
git config --global core.editor vim
git config --global init.defaultbranch main

# for this repo
git config core.autocrlf false
git config core.pager cat
git config core.editor vim
git config init.defaultbranch main
```
