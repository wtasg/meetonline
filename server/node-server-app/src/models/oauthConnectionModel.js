/**
 * Model representing an OAuth connection for a user.
 */
class OAuthConnectionModel {
    constructor() {
        this.id = null;
        this.userId = null;
        this.provider = null;
        this.providerId = null;
        this.email = null;
        this.profileData = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.__isNull = true;
    }

    /**
     * Creates an OAuthConnectionModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {OAuthConnectionModel} The model instance, or null model if row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) return OAuthConnectionModel.null();
        const instance = new OAuthConnectionModel();
        instance.id = row.id;
        instance.userId = row.user_id;
        instance.provider = row.provider;
        instance.providerId = row.provider_id;
        instance.email = row.email;
        instance.profileData = row.profile_data ? JSON.parse(row.profile_data) : null;
        instance.createdAt = row.created_at;
        instance.modifiedAt = row.modified_at;
        instance.__isNull = false;
        return instance;
    }

    /**
     * Creates a null (empty) OAuthConnectionModel.
     * @returns {OAuthConnectionModel} A null model instance.
     */
    static null() {
        return new OAuthConnectionModel();
    }
}

export { OAuthConnectionModel };
