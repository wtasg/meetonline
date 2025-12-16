# JWT Authentication Documentation

## Overview

The application now supports JWT (JSON Web Token) based authentication as the primary authentication method, while maintaining backward compatibility with cookie-based session authentication.

## Architecture

### Token Types

1. **Access Token**
   - Short-lived token (default: 15 minutes)
   - Used to authenticate API requests
   - Sent in Authorization header as Bearer token
   - Stored in sessionStorage on the client

2. **Refresh Token**
   - Long-lived token (default: 7 days)
   - Used to obtain new access tokens when they expire
   - Stored in sessionStorage on the client
   - Can be revoked for security

### Database Schema

The `jwt_tokens` table stores token information:

```sql
CREATE TABLE jwt_tokens (
    id                          BIGSERIAL PRIMARY KEY,
    user_id                     BIGINT NOT NULL REFERENCES user_account(id),
    access_token                VARCHAR(1024) NOT NULL,
    refresh_token               VARCHAR(1024) NOT NULL,
    access_token_expires_at     TIMESTAMP NOT NULL,
    refresh_token_expires_at    TIMESTAMP NOT NULL,
    is_revoked                  BOOLEAN DEFAULT FALSE NOT NULL,
    created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_at                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## API Endpoints

### 1. POST /auth_token

Authenticate user and receive JWT tokens.

**Request:**
```json
{
    "username": "string",
    "password": "string"
}
```

**Response (Success - 200):**
```json
{
    "ok": true,
    "auth_token": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "accessTokenExpiresAt": "2024-01-01T12:15:00.000Z",
        "refreshTokenExpiresAt": "2024-01-08T12:00:00.000Z",
        "username": "string"
    },
    "message": "Authentication successful!"
}
```

**Response (Error - 401):**
```json
{
    "ok": false,
    "auth_token": false,
    "message": "Invalid credentials." | "Account not found or inactive."
}
```

### 2. POST /auth_refresh

Refresh access token using refresh token.

**Request:**
```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
    "ok": true,
    "auth_refresh": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "accessTokenExpiresAt": "2024-01-01T12:15:00.000Z",
        "refreshTokenExpiresAt": "2024-01-08T12:00:00.000Z"
    },
    "message": "Token refresh successful!"
}
```

**Response (Error - 401):**
```json
{
    "ok": false,
    "auth_refresh": false,
    "message": "Invalid or expired refresh token" | "Refresh token has been revoked"
}
```

### 3. POST /logout

Logout user and revoke all tokens.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**
```json
{
    "ok": true,
    "logout": true,
    "message": "Logout successful!"
}
```

## Client Implementation

### Token Storage

Tokens are stored in sessionStorage:

```javascript
// Store tokens
storeTokens({
    accessToken: "...",
    refreshToken: "...",
    accessTokenExpiresAt: "...",
    refreshTokenExpiresAt: "...",
    username: "..."
});

// Retrieve tokens
const accessToken = getAccessToken();
const refreshToken = getRefreshToken();

// Clear tokens
clearTokens();
```

### Making Authenticated Requests

Use the `authenticatedFetch` utility for automatic token management:

```javascript
import { authenticatedFetch } from "./net/authenticatedFetch.js";

// The utility automatically:
// 1. Adds Authorization header with access token
// 2. Checks if token is expired
// 3. Refreshes token if needed
// 4. Retries request with new token

const response = await authenticatedFetch("/api/user_profile", {
    method: "GET",
    headers: {
        "Accept": "application/json"
    }
});
```

### Authentication Flow

#### Login Flow

```javascript
import { authTokenAction } from "./actions/authActions.js";

// 1. User enters credentials
const success = await authTokenAction({
    username: "user@example.com",
    password: "password123"
});

// 2. If successful, tokens are automatically stored
// 3. User is redirected to home page
```

#### Token Refresh Flow

The token refresh happens automatically when:
- Access token is expired or about to expire (within 60 seconds)
- A request is made using `authenticatedFetch`

```javascript
// Automatic refresh flow (handled by authenticatedFetch):
// 1. Check if access token is expired
// 2. If expired, call /auth_refresh with refresh token
// 3. Store new tokens
// 4. Retry original request with new access token
```

#### Logout Flow

```javascript
import { logoutAction } from "./actions/authActions.js";

// 1. Call logout action
await logoutAction();

// 2. Tokens are cleared from storage
// 3. Server revokes all user tokens
// 4. User is redirected to login page
```

## Server Implementation

### Middleware

The application uses a **hybrid authentication middleware** that supports both JWT and cookie-based auth:

```javascript
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";

// Apply to protected routes
app.get("/user_profile", hybridAuthMiddleware, userProfileGET);
```

The middleware:
1. First checks for JWT token in Authorization header
2. If not found, falls back to cookie-based session
3. Attaches user info to `req.user` for both methods
4. Returns 401 if neither authentication method succeeds

### Handler Example

```javascript
async function userProfileGET(req, res) {
    // User info is available from hybrid middleware
    const username = req.user.username;
    
    // Process request...
    const profile = await getUserProfileByUsername(username);
    
    return res.json({
        ok: true,
        user_profile: profile.toClient()
    });
}
```

## Configuration

### Environment Variables

Set these in your `.env` file:

```bash
# JWT Secret (use a strong random string in production)
JWT_SECRET=your-secret-key-here

# Token expiry times
JWT_ACCESS_TOKEN_EXPIRY=15m   # 15 minutes
JWT_REFRESH_TOKEN_EXPIRY=7d   # 7 days
```

**Note:** If `JWT_SECRET` is not set, a random secret will be generated at startup. This is **NOT** recommended for production as it will invalidate all tokens on server restart.

### Token Expiry Format

Supported formats:
- `s` - seconds (e.g., `30s`)
- `m` - minutes (e.g., `15m`)
- `h` - hours (e.g., `2h`)
- `d` - days (e.g., `7d`)

## Security Considerations

1. **HTTPS Required**: Always use HTTPS in production to prevent token interception
2. **Token Storage**: Tokens are stored in sessionStorage (cleared on tab close)
3. **Token Revocation**: Logout revokes all user tokens in the database
4. **Expired Token Cleanup**: Implement periodic cleanup of expired tokens
5. **Secret Management**: Use strong, unique JWT_SECRET in production
6. **CORS**: Configure CORS properly to prevent unauthorized origins

## Migration from Cookie-based Auth

The application maintains backward compatibility. Existing features using cookies will continue to work while new implementations can use JWT.

### Gradual Migration

1. New user logins automatically use JWT
2. Existing cookie sessions continue to work
3. Both authentication methods are supported simultaneously
4. Users will migrate to JWT naturally as they re-login

### Complete Migration

To fully migrate to JWT:

1. Update all client components to use JWT authentication
2. Remove cookie-based session handling code
3. Update login/signup flows to use `/auth_token` endpoint
4. Remove cookie parser middleware if no longer needed

## Troubleshooting

### Common Issues

1. **401 Unauthorized on all requests**
   - Check if tokens are being stored correctly
   - Verify Authorization header is being sent
   - Check if tokens haven't expired

2. **Token refresh not working**
   - Verify refresh token hasn't expired
   - Check if refresh token exists in sessionStorage
   - Ensure `/auth_refresh` endpoint is accessible

3. **Tokens cleared on page refresh**
   - This is normal behavior with sessionStorage
   - Consider using localStorage for persistent sessions
   - Re-authenticate user if needed

4. **Invalid token signature**
   - JWT_SECRET changed on server
   - Token was tampered with
   - Clear tokens and re-authenticate

## Best Practices

1. **Short-lived Access Tokens**: Keep access token expiry short (15 minutes recommended)
2. **Long-lived Refresh Tokens**: Refresh tokens can be longer (7 days recommended)
3. **Automatic Refresh**: Implement automatic token refresh before expiry
4. **Secure Storage**: Never store tokens in localStorage in production (XSS risk)
5. **Token Rotation**: Rotate refresh tokens on each refresh for security
6. **Error Handling**: Handle token expiry gracefully with user-friendly messages
7. **Cleanup**: Periodically clean up expired tokens from database

## Testing

### Manual Testing

1. **Login with JWT**:
   ```bash
   curl -X POST https://localhost:8443/auth_token \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpass"}'
   ```

2. **Access Protected Endpoint**:
   ```bash
   curl -X GET https://localhost:8443/user_profile \
     -H "Authorization: Bearer <access_token>"
   ```

3. **Refresh Token**:
   ```bash
   curl -X POST https://localhost:8443/auth_refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"<refresh_token>"}'
   ```

4. **Logout**:
   ```bash
   curl -X POST https://localhost:8443/logout \
     -H "Authorization: Bearer <access_token>"
   ```

### Automated Testing

Run existing tests to verify JWT functionality:

```bash
# Server tests
cd server/node-server-app
npm test

# Client tests
cd client/react-client-app
npm test
```

## Future Enhancements

1. Implement token blacklist for immediate revocation
2. Add rate limiting to prevent brute force attacks
3. Implement refresh token rotation
4. Add support for multiple devices/sessions
5. Implement "Remember Me" functionality with longer-lived tokens
6. Add token usage analytics
7. Implement anomaly detection for suspicious token usage
