import { pojo } from "@wtasnorg/node-lib";

const VALID_THEMES = [
    "system", "light", "dark", "high-contrast-light", "high-contrast-dark",
    "teal", "pink", "red", "sepia", "gray"
];

const VALID_FONT_SIZES = ["small", "medium", "large", "x-large"];

const VALID_FONT_CONTRASTS = ["low", "normal", "high"];

const userSettingsKeyMap = {
    "id": "id",
    "userProfileId": "user_profile_id",
    "user_profile_id": "userProfileId",
    "theme": "theme",
    "fontSize": "font_size",
    "font_size": "fontSize",
    "fontFamily": "font_family",
    "font_family": "fontFamily",
    "fontContrast": "font_contrast",
    "font_contrast": "fontContrast",
    "notifications": "notifications",
    "onlinePresence": "online_presence",
    "online_presence": "onlinePresence",
    "sounds": "sounds",
    "createdAt": "created_at",
    "created_at": "createdAt",
    "modifiedAt": "modified_at",
    "modified_at": "modifiedAt",
};

class UserSettingsModel {
    constructor() {
        this.id = null;
        this.userProfileId = null;
        this.theme = "system";
        this.fontSize = "medium";
        this.fontFamily = "system-ui";
        this.fontContrast = "normal";
        this.notifications = true;
        this.onlinePresence = true;
        this.sounds = true;
        this.createdAt = null;
        this.modifiedAt = null;
        this.__isNull = true;
        this.__isDefault = false;
    }

    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new UserSettingsModel();
        instance.id = row.id;
        instance.userProfileId = row.user_profile_id;
        instance.theme = row.theme;
        instance.fontSize = row.font_size;
        instance.fontFamily = row.font_family;
        instance.fontContrast = row.font_contrast;
        instance.notifications = row.notifications;
        instance.onlinePresence = row.online_presence;
        instance.sounds = row.sounds;
        instance.createdAt = row.created_at;
        instance.modifiedAt = row.modified_at;
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new UserSettingsModel();
    }

    static default() {
        const instance = new UserSettingsModel();
        instance.id = 0;
        instance.userProfileId = 0;
        instance.theme = "system";
        instance.fontSize = "medium";
        instance.fontFamily = "system-ui";
        instance.fontContrast = "normal";
        instance.notifications = true;
        instance.onlinePresence = true;
        instance.sounds = true;
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
        delete obj.userProfileId;
        return obj;
    }
}

export {
    UserSettingsModel,
    userSettingsKeyMap,
    VALID_THEMES,
    VALID_FONT_SIZES,
    VALID_FONT_CONTRASTS
};
