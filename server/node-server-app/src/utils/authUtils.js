import {
    generateAccessToken,
    generateRefreshToken,
    getTokenExpirationDate,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY
} from "./jwt.js";
import {
    createJwtTokenPair,
    revokeAllJwtTokensForUser
} from "../database/jwt_tokens.js";

async function issueTokenPair(user) {
    const payload = {
        userId: user.id.toString(),
        username: user.username
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const accessTokenExpiresAt = getTokenExpirationDate(JWT_ACCESS_TOKEN_EXPIRY);
    const refreshTokenExpiresAt = getTokenExpirationDate(JWT_REFRESH_TOKEN_EXPIRY);

    // Security: Revoke all previous tokens to enforce single session (optional, but keep for consistency)
    await revokeAllJwtTokensForUser(user.id);

    await createJwtTokenPair(
        user.id,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
    );

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
        username: user.username
    };
}

export { issueTokenPair };
