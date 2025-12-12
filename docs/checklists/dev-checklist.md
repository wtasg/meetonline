# Dev Checklist

## Checklist

- [ ] lint code
- [ ] format code
- [ ] check for offensive and/or meaningless words
- [ ] update docs/ if needed
- [ ] run all tests(server + client + e2e)
  - before working on a feature
  - before pull request
- [ ] ensure tests cover new/changed logic
  - update tests
  - document in PR if tests changed
- [ ] self review
  - [ ] `console.log` and `debug` statements are removed before pull request
  - [ ] Read diff
  - [ ] Read documentation
  - [ ] Read tests

---

## How do you check if there are new `console.log`s in your code?

`git diff | grep "+.*console.log"`

Example:
![example checking for console.log in code](https://github.com/user-attachments/assets/6f8df126-4837-479f-94ce-dfd08309344a)

---

## How do you self review?

Follow [Review Checklist Discussion](https://github.com/wtasg/meetonline/discussions/298) or [Review Checklist Document](docs/checklists/review-checklist.md)

---

## How do you check offensive and/or meaningless words?

- Have you tried not writing as such?
- Just don't write offensive and/or meaningless words.
- Reread changed lines for tone and clarity.
  - People cannot hear you over the text.
  - Be mindful of how your words could/would sound to others.
  - Avoid slang
  - Prefer neutral phrasing

---

## References

- [Review Checklist Discussion](https://github.com/wtasg/meetonline/discussions/298)
  - [Review Checklist Document](./review-checklist.md)
- [Dev Checklist Discussion](https://github.com/wtasg/meetonline/discussions/211)
  - [Dev Checklist Document](./dev-checklist.md)
