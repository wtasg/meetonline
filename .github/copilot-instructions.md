# GitHub Copilot Instructions for meetonline

This file provides context and guidelines for GitHub Copilot when working on the meetonline codebase.

## Project Context

meetonline is a full-stack web application for building and finding online communities. The project emphasizes:
- Clean, maintainable code
- Security best practices (HTTPS, secure authentication)
- Modern web technologies (React, Node.js, PostgreSQL)
- Containerized deployment with Docker

## Code Style & Formatting

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

## Architecture Patterns

### Frontend (React)
- **Component Structure**: Functional components with hooks
- **State Management**: Use React hooks (useState, useEffect, useContext)
- **Routing**: Client-side routing (check existing patterns)
- **Forms**: Use controlled components
- **API Calls**: Use fetch API with async/await

### Backend (Express)
- **Route Handlers**: Use async/await for asynchronous operations
- **Error Handling**: Use try-catch blocks and pass errors to Express error handlers
- **Middleware**: Chain middleware functions for reusable logic
- **Database**: Use parameterized queries to prevent SQL injection
- **Authentication**: Token-based authentication with session cookies

### Database (PostgreSQL)
- **Schema**: Defined in `database/init/schema.sql`
- **Queries**: Always use parameterized queries via `pg` library
- **Transactions**: Use transactions for multi-step operations
- **Naming**: Use snake_case for tables and columns

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
```javascript
try {
    // Database or async operation
    const result = await db.query('SELECT * FROM table WHERE id = $1', [id]);
    res.json(result.rows);
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
}
```

### API Response Format
```javascript
// Success
res.json({ success: true, data: result });

// Error
res.status(400).json({ success: false, error: 'Error message' });
```

### Database Queries
```javascript
// Always use parameterized queries
const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
);
```

### React Component Pattern
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
- Run with: `npm run test` in server directory

### Client Tests (Vitest)
- Test files: `*.test.jsx` or `tests/**/*.test.jsx`
- Use React Testing Library patterns
- Test user interactions, not implementation details
- Mock API calls
- Run with: `npm run test` in client directory

### E2E Tests (Playwright)
- Test files: `tests/**/*.spec.js`
- Test complete user workflows
- Use page object patterns
- Run with: `npm run e2e` in client directory

## Git Workflow

### Commits
- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Squash commits before merging if they're low quality

### Branches
- Use descriptive branch names with underscores/hyphens
- Pattern: `^[A-Za-z][A-Za-z0-9_-]+$`
- Examples: `feature_user_profile`, `fix_login_bug`, `task_123`
- NO slashes, emoji, or non-ASCII characters

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
```
server/node-server-app/
├── src/
│   ├── server.js          # Main server entry point
│   ├── database/          # Database connection and queries
│   ├── routes/            # Express route handlers
│   └── middleware/        # Custom middleware
├── tests-jest/            # Jest tests
└── package.json
```

### Client Structure
```
client/react-client-app/
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Main App component
│   ├── components/        # React components
│   └── assets/            # Static assets
├── tests/                 # Playwright e2e tests
└── package.json
```

## Documentation

When making significant changes:
- Update relevant README files
- Update architecture docs if patterns change
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
