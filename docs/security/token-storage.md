# Token Storage Security

## Overview

This document explains the security decisions made regarding token storage in the meetonline application.

## Security Requirements

**Critical**: Authentication tokens must ONLY be stored in `sessionStorage`, never in `localStorage`.

### Why?

- **sessionStorage** is cleared when the browser tab/window is closed, limiting the exposure window
- **localStorage** persists across browser sessions, leaving tokens accessible even after the browser closes
- This is a security vulnerability that could allow token theft if an attacker gains physical access to the machine

## Implementation

### User Session Storage (`client/react-client-app/src/session.js`)

The `user_session` storage is initialized with `["session"]` only:

```javascript
const user_session = new Storage(["session"]);
```

This ensures that:
- Username and session tokens are stored only in sessionStorage
- Data is cleared when the browser session ends
- Tokens cannot be accessed after the browser is closed

### JWT Token Storage (`client/react-client-app/src/utils/jwt.js`)

JWT tokens are stored directly in sessionStorage:

```javascript
sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
```

This stores:
- Access tokens
- Refresh tokens
- Token expiration times
- Username

All stored only in sessionStorage, which is cleared when the session ends.

### Non-Sensitive Data

The `location` storage uses localStorage for navigation paths:

```javascript
const location = new Storage(["local"]);
```

This is acceptable because:
- Navigation paths are not sensitive data
- User experience benefits from persisting the last visited page across sessions
- No security risk from this data persisting

## Testing

Two test suites validate this security requirement:

1. **`session.test.js`** - Validates that `user_session` uses only sessionStorage
2. **`jwt.test.js`** - Validates that JWT tokens are stored only in sessionStorage

These tests ensure:
- ✅ `user_session` has only one storage backend (SessionStorage)
- ✅ `user_session` does NOT include localStorage
- ✅ JWT tokens are stored in and retrieved from sessionStorage only
- ✅ Token clearing removes data from sessionStorage

## Compliance

This implementation follows security best practices:
- OWASP recommendations for token storage
- Principle of least privilege
- Defense in depth (session-only storage + HTTPS)

## Related Files

- `client/react-client-app/src/session.js` - Session storage initialization
- `client/react-client-app/src/utils/jwt.js` - JWT token management
- `client/react-client-app/src/utils/storage.js` - Storage abstraction layer
- `client/react-client-app/src/session.test.js` - Session security tests
- `client/react-client-app/src/utils/jwt.test.js` - JWT security tests
