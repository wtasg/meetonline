/**
 * Model representing a JWT token pair for authentication.
 */
class JwtTokenModel {
    constructor() {
        this.id = null;
        this.userId = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.accessTokenExpiresAt = null;
        this.refreshTokenExpiresAt = null;
        this.isRevoked = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.__isNull = true;
        this.__isDefault = false;
    }

    /**
     * Creates a JwtTokenModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {JwtTokenModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row");
        }
        const instance = new JwtTokenModel();
        instance.id = row.id;
        instance.userId = row.user_id;
        instance.accessToken = row.access_token;
        instance.refreshToken = row.refresh_token;
        instance.accessTokenExpiresAt = row.access_token_expires_at;
        instance.refreshTokenExpiresAt = row.refresh_token_expires_at;
        instance.isRevoked = row.is_revoked;
        instance.createdAt = row.created_at;
        instance.modifiedAt = row.modified_at;
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    /**
     * Creates a null (empty) JwtTokenModel.
     * @returns {JwtTokenModel} A null model instance.
     */
    static null() {
        return new JwtTokenModel();
    }

    /**
     * Creates a default JwtTokenModel with sample data.
     * @returns {JwtTokenModel} A default model instance.
     */
    static default() {
        const instance = new JwtTokenModel();
        instance.id = "default-jwt-token-id";
        instance.userId = "default-user-id";
        instance.accessToken = "default-access-token";
        instance.refreshToken = "default-refresh-token";
        instance.accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        instance.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        instance.isRevoked = false;
        instance.createdAt = new Date().toISOString();
        instance.modifiedAt = new Date().toISOString();
        instance.__isNull = false;
        instance.__isDefault = true;
        return instance;
    }

    /**
     * Converts the model to a client-safe plain object.
     * @returns {Object} Object with tokens and expiration dates.
     */
    toClient() {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            accessTokenExpiresAt: this.accessTokenExpiresAt,
            refreshTokenExpiresAt: this.refreshTokenExpiresAt
        };
    }
}

export { JwtTokenModel };
