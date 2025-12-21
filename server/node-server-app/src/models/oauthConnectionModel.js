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

    static null() {
        return new OAuthConnectionModel();
    }
}

export { OAuthConnectionModel };
