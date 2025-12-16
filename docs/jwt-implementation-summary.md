# JWT Authentication Implementation Summary

## Overview

This document summarizes the implementation of JWT (JSON Web Token) authentication in the meetonline application. The implementation provides a modern, stateless authentication system while maintaining backward compatibility with the existing cookie-based session authentication.

## What Changed

### Database

- **New Table**: `jwt_tokens`
  - Stores JWT access and refresh tokens
  - Tracks token expiration times
  - Supports token revocation
  - Indexed for performance

### Server (`server/node-server-app`)

#### New Dependencies
- `jsonwebtoken` (v9.0.3) - JWT token generation and verification

#### New Files
- `src/models/jwtTokenModel.js` - JWT token data model
- `src/database/jwt_tokens.js` - Database operations for JWT tokens
- `src/utils/jwt.js` - JWT utility functions (generate, verify, decode)
- `src/middlewares/jwtMiddleware.js` - JWT authentication middleware
- `src/middlewares/hybridAuthMiddleware.js` - Supports both JWT and cookie auth

#### Modified Files
- `src/handlers/authHandler.js` - Added `/auth_token` and `/auth_refresh` endpoints
- `src/handlers/userAccountHandler.js` - Updated to use hybrid authentication
- `src/handlers/userProfileHandler.js` - Updated to use hybrid authentication

#### New API Endpoints
- `POST /auth_token` - Authenticate and receive JWT tokens
- `POST /auth_refresh` - Refresh access token using refresh token
- `POST /logout` - Now supports JWT-based logout (also keeps cookie support)

### Client (`client/react-client-app`)

#### New Files
- `src/utils/jwt.js` - Client-side JWT utilities (store, retrieve, check expiry)
- `src/net/authenticatedFetch.js` - Fetch wrapper with automatic token refresh

#### Modified Files
- `src/utils/session.js` - Updated to check for JWT tokens
- `src/net/auth.js` - Added JWT authentication functions
- `src/net/userAccount.js` - Updated to use authenticatedFetch
- `src/net/userProfile.js` - Updated to use authenticatedFetch
- `src/net/userSettings.js` - Updated to use authenticatedFetch
- `src/net/group.js` - Updated to use authenticatedFetch
- `src/actions/authActions.js` - Added JWT authentication actions
- `src/features/Login.jsx` - Updated to support JWT login

## How It Works

### Authentication Flow

1. **Login**:
   - User enters credentials
   - Client calls `POST /auth_token`
   - Server validates credentials
   - Server generates access token (15min) and refresh token (7 days)
   - Server stores tokens in database
   - Client stores tokens in sessionStorage

2. **Making Authenticated Requests**:
   - Client uses `authenticatedFetch()` wrapper
   - Wrapper checks if access token is expired
   - If expired, automatically refreshes using refresh token
   - Adds Authorization header: `Bearer <access_token>`
   - Server validates token using hybrid middleware

3. **Token Refresh**:
   - Client calls `POST /auth_refresh` with refresh token
   - Server validates refresh token
   - Server generates new token pair
   - Server revokes old tokens
   - Client stores new tokens

4. **Logout**:
   - Client calls `POST /logout` with access token
   - Server revokes all user's JWT tokens
   - Client clears tokens from storage

### Backward Compatibility

- The hybrid authentication middleware checks for JWT tokens first
- If no JWT token is found, it falls back to cookie-based session
- Existing cookie-based auth continues to work unchanged
- Gradual migration path for users

## Configuration

### Environment Variables

Add to `.env` files:

```bash
JWT_SECRET=your-secure-random-string-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
```

**Important**: Use a strong, unique JWT_SECRET in production!

## Benefits

1. **Stateless**: No server-side session storage needed for JWT
2. **Scalable**: Easy to scale across multiple servers
3. **Mobile-friendly**: Works well with mobile apps
4. **Modern**: Industry-standard authentication method
5. **Secure**: Tokens are signed and can be verified
6. **Automatic Refresh**: Client automatically refreshes expired tokens
7. **Revocable**: Tokens can be revoked on logout

## Security Features

1. **Short-lived Access Tokens**: Minimizes risk if token is compromised
2. **Long-lived Refresh Tokens**: Better user experience
3. **Token Revocation**: All tokens revoked on logout
4. **Database Validation**: Tokens checked against database on each request
5. **HTTPS Required**: Prevents token interception
6. **Session Storage**: Tokens cleared when browser tab closes

## Usage Examples

### Client-Side Login

```javascript
import { authTokenAction } from "./actions/authActions.js";

const success = await authTokenAction({
    username: "user@example.com",
    password: "password123"
});

if (success) {
    // User is logged in, tokens are stored
    // Redirect to home page
}
```

### Client-Side Authenticated Request

```javascript
import { authenticatedFetch } from "./net/authenticatedFetch.js";

const response = await authenticatedFetch("/user_profile", {
    method: "GET"
});
const data = await response.json();
```

### Server-Side Protected Endpoint

```javascript
import { hybridAuthMiddleware } from "../middlewares/hybridAuthMiddleware.js";

app.get("/protected", hybridAuthMiddleware, async (req, res) => {
    // req.user contains authenticated user info
    const username = req.user.username;
    res.json({ message: `Hello ${username}!` });
});
```

## Migration Path

### For New Users
- Automatically use JWT authentication
- No changes needed

### For Existing Users
- Continue using cookie-based auth until next login
- Next login will use JWT authentication
- Seamless transition

### For Developers
1. **Phase 1** (Current): Both auth methods supported
2. **Phase 2** (Future): Deprecate cookie-based auth
3. **Phase 3** (Future): Remove cookie-based auth code

## Testing

### Test Login
```bash
curl -X POST https://localhost:8443/auth_token \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'
```

### Test Protected Endpoint
```bash
curl -X GET https://localhost:8443/user_profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Token Refresh
```bash
curl -X POST https://localhost:8443/auth_refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Known Limitations

1. Tokens stored in sessionStorage (cleared on tab close)
2. JWT_SECRET must be consistent across server restarts
3. Token expiry times are fixed (not user-configurable)
4. No built-in rate limiting (should be added separately)

## Future Improvements

1. Implement token rotation on refresh
2. Add rate limiting to prevent brute force attacks
3. Implement "Remember Me" with localStorage
4. Add multi-device session management
5. Implement token blacklist for immediate revocation
6. Add token usage analytics

## Documentation

For detailed documentation, see:
- [JWT Authentication Guide](./jwt-authentication.md)
- [API Documentation](./api-documentation.md)

## Questions or Issues?

- Check the troubleshooting section in [jwt-authentication.md](./jwt-authentication.md)
- Review server logs for error messages
- Verify environment variables are set correctly
- Ensure HTTPS is enabled
