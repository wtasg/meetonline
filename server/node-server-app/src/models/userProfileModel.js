import { pojo } from "@wtasnorg/node-lib";

const updateUserProfile = (userProfile, updates) => {
    return {
        ...userProfile,
        ...updates,
        modifiedAt: new Date().toISOString(),
    };
};

const userProfileKeyMap = {
    "id": "id",
    // "id": "id",
    "userId": "user_id",
    "user_id": "userId",
    "profileName": "profile_name",
    "profile_name": "profileName",
    "displayName": "display_name",
    "display_name": "displayName",
    "phoneNumber": "phone_number",
    "phone_number": "phoneNumber",
    "email": "email",
    // "email": "email",
    "address": "address",
    // "address": "address",
    "websiteUrl": "website_url",
    "website_url": "websiteUrl",
    "createdAt": "created_at",
    "created_at": "createdAt",
    "modifiedAt": "modified_at",
    "modified_at": "modifiedAt",
};

class UserProfileModel {
    constructor() {
        this.id = null;
        this.userId = null;
        this.profileName = null;
        this.displayName = null;
        this.phoneNumber = null;
        this.email = null;
        this.address = null;
        this.websiteUrl = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.__isNull = true;
        this.__isDefault = false;
    }

    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new UserProfileModel();
        instance.id = row.id;
        instance.userId = row.user_id;
        instance.profileName = row.profile_name;
        instance.displayName = row.display_name;
        instance.phoneNumber = row.phone_number;
        instance.email = row.email;
        instance.address = row.address;
        instance.websiteUrl = row.website_url;
        instance.createdAt = row.created_at;
        instance.modifiedAt = row.modified_at;
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new UserProfileModel();
    }

    static default() {
        const instance = new UserProfileModel();
        instance.id = 0;
        instance.userId = 0;
        instance.profileName = "";
        instance.displayName = "default profile displayName";
        instance.phoneNumber = "";
        instance.email = "";
        instance.address = "";
        instance.websiteUrl = "";
        instance.createdAt = new Date().toISOString();
        instance.modifiedAt = new Date().toISOString();
        instance.__isNull = false;
        instance.__isDefault = true;
        return instance;
    }

    toClient() {
        const obj = pojo(this);
        delete obj.__isDefault;
        delete obj.__isNull;
        delete obj.userId;
        return obj;
    }
}

export { updateUserProfile, UserProfileModel, userProfileKeyMap };
