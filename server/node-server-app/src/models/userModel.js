const updateUserAccount = (userAccount, updates) => {
    return {
        ...userAccount,
        ...updates,
        modifiedAt: new Date().toISOString(),
    };
};

/**
 *
 * @param {UserAccountModel} userAccount The user account model object
 * @returns {Object} The user account in database format
 */
const toDatabaseFormat = (userAccount) => ({
    username: userAccount.username,
    password: userAccount.password,
    salt: userAccount.salt,
    is_active: userAccount.isActive,
    is_deleted: userAccount.isDeleted,
    is_blocked: userAccount.isBlocked,
    is_forgotten: userAccount.isForgotten
});

class UserAccountModel {
    constructor() {
        this.id = null;
        this.username = null;
        this.password = null;
        this.salt = null;
        this.isActive = null;
        this.isDeleted = null;
        this.isBlocked = null;
        this.isForgotten = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.__isNull = true;
        this.__isDefault = false;
    }

    static fromDatabaseRow(row) {
        if(!row) {
            throw new Error("Invalid database row");
        }
        const instance = new UserAccountModel();
        instance.id = row.id;
        instance.username = row.username;
        instance.password = row.password;
        instance.salt = row.salt;
        instance.isActive = row.is_active;
        instance.isDeleted = row.is_deleted;
        instance.isBlocked = row.is_blocked;
        instance.isForgotten = row.is_forgotten;
        instance.createdAt = row.created_at;
        instance.modifiedAt = row.modified_at;
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static default() {
        const instance = new UserAccountModel();
        instance.id = 'default-user-id';
        instance.username = 'defaultuser';
        instance.password = 'default-hashed-password';
        instance.salt = 'default-salt';
        instance.isActive = true;
        instance.isDeleted = false;
        instance.isBlocked = false;
        instance.isForgotten = false;
        instance.createdAt = new Date().toISOString();
        instance.modifiedAt = new Date().toISOString();
        instance.__isNull = false;
        instance.__isDefault = true;
        return instance;
    }
}

export { updateUserAccount, toDatabaseFormat, UserAccountModel };

