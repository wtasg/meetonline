
const defaultUserAccount = () => ({
    id: 'default-user-id',
    username: 'defaultuser',
    password: 'default-hashed-password',
    salt: 'default-salt',
    isActive: true,
    isDeleted: false,
    isBlocked: false,
    isForgotten: false,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
});

const updateUserAccount = (userAccount, updates) => {
    return {
        ...userAccount,
        ...updates,
        modifiedAt: new Date().toISOString(),
    };
};

const toDatabaseFormat = (userAccount) => ({
    username: userAccount.username,
    password: userAccount.password,
    salt: userAccount.salt,
    is_active: userAccount.isActive,
    is_deleted: userAccount.isDeleted,
    is_blocked: userAccount.isBlocked,
    is_forgotten: userAccount.isForgotten
});

const fromDatabaseFormat = (row) => ({
    id: row.id,
    username: row.username,
    password: row.password,
    salt: row.salt,
    isActive: row.is_active,
    isDeleted: row.is_deleted,
    isBlocked: row.is_blocked,
    isForgotten: row.is_forgotten,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
});

export { defaultUserAccount, updateUserAccount, toDatabaseFormat, fromDatabaseFormat };

