# Review Checklist

## Issues and prior work

- [ ] Does the PR have an attached issue?
- [ ] Does the PR title match the issue, description, and changes?
- [ ] Do you, as a reviewer, understand the issue that PR is trying to solve?
- [ ] Do the files changed agree with the scope of the PR/issue?

## Code quality

- [ ] Are there any typos?
- [ ] Have you read the code? (as a reviewer)
- [ ] After reading the code and understanding the implementation, ask yourself,
  - can it be done differently?
  - can we remove redundant code?
  - how would I solve it?
  - would I like to maintain it?
- [ ] Security: Are there any probable security issues?
- [ ] Documentation: Is documentation updated?
- [ ] Testing: Are tests updated?

## Branches and Commits

- [ ] Does the branch have latest code from main? (optional if merging)
- [ ] Commit message is clean and adheres to repo rules
- [ ] Does branch name match pattern `^[A-Za-z][A-Za-z0-9_-]+$`?
- [ ] For bots: Does branch use `BOTNAME__` prefix (or `BOTNAME__ISSUE_NUMBER`)?

## Code Standards & Formatting

- [ ] Does code follow project formatting standards (4 spaces, LF endings)?
- [ ] Are naming conventions followed (camelCase, PascalCase, snake_case per guidelines)?
- [ ] Are console.log statements removed?

## API & Error Handling

- [ ] Is error handling implemented with try-catch blocks?
- [ ] Are errors properly logged?
- [ ] Do API responses follow exact format: `{ ok: boolean, end_point: {}/[]/false, message: string }`?
- [ ] Are HTTP status codes appropriate (200 for success, 400/500 for errors)?

## Database & Security

- [ ] Are database queries using parameterized statements (SQL injection prevention)?
- [ ] Are user inputs validated and sanitized?
- [ ] Are `bcrypt` used for password hashing (if applicable)?
- [ ] Are CSRF tokens implemented for state-changing operations?
- [ ] Are cookies marked as `secure` and `httpOnly`?
- [ ] Is rate limiting implemented for authentication endpoints?
- [ ] Is output escaped to prevent XSS attacks?

## CI/CD & Tests

- [ ] Do all CI checks pass?
- [ ] Do tests cover edge cases (null, undefined, empty string, NaN)?

## Architecture & Organisation

- [ ] Frontend: Are fetch calls in `net/` and called from `actions/`?
- [ ] Frontend: Are business logic components in `features/` and simple components in `components/`?
- [ ] Backend: Are route handlers in `handlers/`?
- [ ] Backend: Are middleware functions in `middlewares/`?
- [ ] Backend: Are database queries in `database/`?
- [ ] Backend: Are models properly defined in `models/`?
- [ ] Database: Are IDs using `bigserial` and treated as strings in code?

---

## References

- [Review Checklist Discussion](https://github.com/wtasg/meetonline/discussions/298)
  - [Review Checklist Document](./review-checklist.md)
- [Dev Checklist Discussion](https://github.com/wtasg/meetonline/discussions/211)
  - [Dev Checklist Document](./dev-checklist.md)
