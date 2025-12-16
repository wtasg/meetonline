# 📋 Rules

## 🤝 Around People

- Be nice.
- Disagree factually and politely.

## 🌿 Git Branching

- **Feature branches**: for large tasks or complete features
  - `feature/fe` or `fe` - frontend features
  - `feature/be` or `be` - backend features
  - `feature/db` or `db` - database features
- **Task/Chore branches**: for smaller tasks or targeting single issue
  - `b_issuenumber`
- **Bot branches**: if you are a bot
  - `BOTNAME__ISSUENUMBER`:
    - example `copilot__333` when bot is copilot and issue fixed is 333
- **Other branches**:
  - `maintenance_tag`: when maintaining repo, non code changes.
  - `fix_issuenumber`: when fixing an issue
  - `fix_tag`: when fixing a non-issue `tag` work.
- **Main branch**
  - 🚫 Do not use `main` to push code.
  - Use `main` branch only to `pull --rebase` code.
- `rebase` instead of `merge` locally.

## 🔀 Merging and Commit Credit

- **Merge PRs with only one commit** (squash locally or in PRs)
  - Merge with Squash if commits are low quality.
  - Merge with commits if commits are good quality.
  - **Keep track of due credit.**
    - Do not hide or overtake someone else's work.
    - Make sure that each contributor get at least one commit.
