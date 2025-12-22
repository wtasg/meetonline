# GitHub Copilot Instructions for meetonline

This file provides context and guidelines for GitHub Copilot when working on the meetonline codebase.

## Project Context

meetonline is a full-stack web application designed for building and discovering online communities.

The project emphasizes:

- Clean, maintainable code
- Security best practices (HTTPS, secure authentication)
- Modern web technologies (React, Node.js, PostgreSQL)
- Containerized deployment with Docker

## Code Style & Formatting

### Branch naming conventions

- **IMPORTANT** Branch name must meet this regex criteria `^[A-Za-z][A-Za-z0-9_/-]+$`
  - For bots, use `BOTNAME__` as prefix for branch
  - Otherwise, try `b_ISSUE_NUMBER` if any issue is assigned.
  - For bots when assigned an issue, branch name becomes `BOTNAME__ISSUE_NUMBER` e.g. `copilot__333`.
  - But copilot uses `copilot/` prefix for branches.

### General Formatting

- **Indentation**: 4 spaces (general), 2 spaces (JSON/YAML)
- **Line endings**: LF (Unix-style)
- **Max line length**: 120 characters
- **Final newline**: Always include
- **Trailing whitespace**: Remove (except in markdown)
- **Character encoding**: UTF-8

### JavaScript/TypeScript Style

- Use **ES Modules** (`import`/`export`, not `require`)
- Prefer `const` over `let`, avoid `var`
- Use template literals for string interpolation
- Use arrow functions for callbacks and short functions
- Follow ESLint rules defined in project configs

### Naming Conventions

- **Files**: Use kebab-case for files (e.g., `user-account.js`)
- **Components**: PascalCase for React components
- **Functions**: camelCase for functions and variables
- **Constants**: UPPER_SNAKE_CASE for constants
- **Database**: snake_case for table and column names
- **Branches**: `^[A-Za-z][A-Za-z0-9_/-]+$`
  - For bots, use `BOTNAME__` as prefix for branch
  - Otherwise, try `b_ISSUE_NUMBER` if any issue is assigned.
  - For bots when assigned an issue, branch name becomes `BOTNAME__ISSUE_NUMBER` e.g. `copilot__333`.

## Architecture Patterns

### Frontend (React)

- **Component Structure**: Functional components with hooks
  - Components are broken logically in two parts: plain component in components/ and logic-based (business or programming) in features/
  - features/ also have larger components
  - feature/ Components are supposed to be standalone feature (except hooks, network)
  - components/ Components are supposed to do one thing only
- **State Management**: Use React hooks (useState, useEffect, useContext) and client/react-client-app/src/session.js
- **Routing**: Client-side routing (check existing patterns)
- **Forms**: Use controlled components
- **API Calls**: Use fetch API with async/await;
  - put fetch calls in client/react-client-app/src/net/ functions
  - call net/ from actions/ functions
  - call actions/ from feature/ components

### Backend (Express)

- **Route Handlers**: Use async/await for asynchronous operations
  - server/node-server-app/src/handlers/
- **Error Handling**: Use try-catch blocks and pass errors to Express error handlers
- **Middleware**: Chain middleware functions for reusable logic
  - server/node-server-app/src/middlewares/
- **Database**: Use parameterized queries to prevent SQL injection
  - server/node-server-app/src/database/
- **Models**: Database and client objects that handlers or other server code can use, understand, and work with
  - server/node-server-app/src/models/
  - Each model corresponds to a database table
  - Models provide `.fromDatabaseRow()` to parse DB results
  - Models provide `.toClient()` to format data for API responses
  - Models provide `.null()` to return a null object
  - Models provide `.default()` to return a default object
- **Authentication**: Token-based authentication with session cookies
  - server/node-server-app/src/utils/store.js for local store implementation
  - server/node-server-app/src/utils/session.js for session implementation

### Database (PostgreSQL)

- **Schema**: Defined in `database/init/schema.sql`
- **Queries**: Always use parameterized queries via `pg` library
- **Transactions**: Use transactions for multi-step operations
- **Naming**: Use snake_case for tables and columns
- **Indexes**: Use appropriate indexes.
- **IDs**: Table where ids can apply need to be bigserial; treat id in server code as strings.

## Security Guidelines

### Authentication & Authorization

- Use `bcrypt` for password hashing (already configured)
- Implement CSRF protection with tokens
- Use secure, httpOnly cookies for sessions
- Validate all user input on the server side

### Data Validation

- Validate and sanitize all user inputs
- Use prepared statements for database queries
- Implement rate limiting for authentication endpoints
- Escape output to prevent XSS attacks

### HTTPS/TLS

- Use HTTPS for all connections (configured in compose)
- Certificates are generated via `make.certs.sh` scripts
- Self-signed certificates for development only

## Common Patterns

### Error Handling (Server)

Note: This is a sample. You have to sanitize, validate, authenticate, authorize requests and then process response accordingly.

Note: Below is sample call to database from server.

```javascript
// sample for /user_account endpoint
 try {
        const query = "SELECT * FROM user_account WHERE username = $1";
        const values = [username];
        const res = await pool.query(query, values);
        // verify res has rows.
        return UserAccountModel.fromDatabaseRow(res.rows[0]);
    }
    catch (error) {
        console.error("Error fetching user account by username:", error);
        return UserAccountModel.default();
    }
```

### API Response Format

In api response, `end_point` is a placeholder for actual endpoint-specific name.

Note: Below is sample code. This shows types for success and failure cases.

```javascript
// Success - generic response pattern
res.json({ ok: true, end_point: {}, message: string });

// Error - generic response pattern
res.status(400).json({ ok: false, end_point: [{}|false], message: string });
```

#### sample: PATCH /user_profile

Note: This is a sample code.

```javascript
// Success
const profile = await getUserProfileByUsername(username);
return res.status(200)
    .json({
        ok: true,
        user_profile: profile.toClient(),
        message: "Success"
    });

// Error
console.error(err);
return res.status(500)
    .json({
        ok: false,
        user_profile: UserProfileModel.null().toClient(),
        message: "CAUGHT ERROR."
    });
```

### Database Queries

Note: This is a sample code.

```javascript
// Always use parameterized queries
const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
);
```

### React Component Pattern

Note: This is a sample code.

```javascript
import { useState, useEffect } from 'react';

function ComponentName() {
    const [state, setState] = useState(initialValue);
    
    useEffect(() => {
        // Side effects
    }, [dependencies]);
    
    return (
        <div>
            {/* JSX */}
        </div>
    );
}

export default ComponentName;
```

## Testing Guidelines

### Server Tests (Jest)

- Test files: `tests-jest/**/*.test.js`
- Use `describe` and `it` blocks
- Mock external dependencies
- Test both success and error cases
- Test edge cases with null, undefined, empty string, NaN
- Run with: `npm run test` in server/node-server-app directory

### Client Tests (Vitest)

- Test files: `*.test.jsx` or `tests/**/*.test.jsx`
- Use React Testing Library patterns
- Test user interactions, not implementation details
- Mock API calls
- Test edge cases with null, undefined, empty string, NaN
- Run with: `npm run test` in client/react-client-app directory

### E2E Tests (Playwright)

- Test files: `tests/**/*.spec.js`
- Test complete user workflows
- Use page object patterns
- Run with: `npm run e2e` in client/react-client-app directory

## Git Workflow

### Commits

- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Squash commits before merging if they're low quality

### Branches

- Use descriptive branch names with underscores/hyphens
- Pattern: `^[A-Za-z][A-Za-z0-9_/-]+$`
- Examples: `feature/user_profile`, `fix/login_bug`, `task/123`, `feature_user_profile`
- NO emoji, or non-ASCII characters

### Pull Requests

- Reference related issues
- Provide clear description of changes
- Ensure all tests pass
- Run linters before submitting
- Squash to one commit if appropriate

## Dependencies

### Adding New Dependencies

1. Evaluate necessity - prefer existing libraries
2. Check license compatibility (project is Unlicensed/Public Domain)
3. Check for security vulnerabilities
4. Install in appropriate directory:
   - Server: `cd server/node-server-app && npm install <package>`
   - Client: `cd client/react-client-app && npm install <package>`
5. Update documentation if significant dependency

### Existing Key Dependencies

- **Server**: express, pg, bcrypt, helmet, cors, multer, cookie-parser
- **Client**: react, react-dom, vite
- **Testing**: jest, vitest, playwright

## Environment Variables

- **Server**: `.env` files in `server/node-server-app/`
  - `local.env` - local development
  - `docker.env` - Docker environment
- **Client**: `.env` files in `client/react-client-app/`
  - `local.env` - local development
  - `docker.env` - Docker environment
- **Never commit** `.env` files (they're gitignored)

## File Organization

### Server Structure

```text
server/node-server-app/
├── src/
│   ├── server.js           # Main server entry point
│   ├── database/           # Database connection and queries
│   ├── handlers/           # Express route handlers
│   ├── middleware/         # Custom middleware
|   ├── models/             # 1:1 model for database/ .js 
|   └── utils/              # Utilities
├── tests-jest/             # Jest tests
└── package.json
```

### Client Structure

```text
client/react-client-app/
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main App component
│   ├── components/         # React components, no logic
│   ├── features/           # Components with logic
│   ├── hooks/              # Hooks
│   ├── net/                # network calls to server via fetch
│   ├── actions/            # Component network-layer, talks to net/ layer
│   ├── utils/              # Utility functions
│   ├── assets/             # Static assets
│   └── session.js          # Home grown store for data
├── tests/                  # Playwright e2e tests
└── package.json
```

### Database Structure

```text
database/
└── init/
    └── schema.sql          # SQL init file for docker container
```

### Scripts

```text
scripts
├── compose.sh
├── make.certs.sh
├── make.env.sh
├── manual-compose.sh
├── pre-commit.sh
└── watch-client.sh
```

## Documentation

When making significant changes:

- Update relevant README files
- Update architecture docs if patterns change
  - Use plantuml code for diagrams
  - Use valid markdown
- Add comments for complex logic only
- Keep documentation in sync with code

## Resources

- **Repository Documentation**: [docs/Home.md](../docs/Home.md)
- **Tech Index**: [docs/tech/tech-index.md](../docs/tech/tech-index.md)
- **Bug Report Template**: [docs/bug-report-template.md](../docs/bug-report-template.md)
- **Rules**: [docs/rules.md](../docs/rules.md)

## Community Guidelines

- Be nice and respectful
- Disagree factually and politely
- Credit contributors properly
- Don't hide or overtake others' work
- Ask for help when stuck
- Respond to feedback constructively

## Quick Commands

```bash
# Lint & Fix
cd server/node-server-app && npm run lint:fix
cd client/react-client-app && npm run lint:fix

# Test
cd server/node-server-app && npm test
cd client/react-client-app && npm test
cd client/react-client-app && npm run e2e

# Build
cd server/node-server-app && npm run build
cd client/react-client-app && npm run build

# Run Development
./scripts/manual-compose.sh --all --no-client
./scripts/watch-client.sh

# Docker Compose
docker compose --file compose.yml up --build
```

## Checklists

- [Dev Checklist](../docs/checklists/dev-checklist.md)
- [Review Checklist](../docs/checklists/review-checklist.md)
