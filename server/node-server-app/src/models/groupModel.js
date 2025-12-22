import { pojo } from "@wtasnorg/node-lib";
import { toISOStringOrEmpty } from "../utils/dateUtils.js";

/**
 * Updates a group object with new values.
 * @param {Object} group - The existing group object.
 * @param {Object} updates - The updates to apply.
 * @returns {Object} The updated group object.
 * @throws {Error} If group is invalid.
 */
const updateGroup = (group, updates) => {
    if (!group || typeof group !== "object" || Array.isArray(group)) {
        throw new Error("Invalid group object passed to updateGroup.");
    }
    return {
        ...group,
        ...updates,
        modifiedAt: new Date().toISOString(),
    };
};

const groupKeyMap = {
    id: "id",
    userProfileId: "user_profile_id",
    user_profile_id: "userProfileId",
    groupName: "group_name",
    group_name: "groupName",
    description: "description",
    isPublic: "is_public",
    is_public: "isPublic",
    members: "members",
    tags: "tags",
    categories: "categories",
    createdAt: "created_at",
    created_at: "createdAt",
    modifiedAt: "modified_at",
    modified_at: "modifiedAt",
    isDeleted: "is_deleted",
    is_deleted: "isDeleted",
    deletedAt: "deleted_at",
    deleted_at: "deletedAt",
    isHidden: "is_hidden",
    is_hidden: "isHidden",
    isArchived: "is_archived",
    is_archived: "isArchived",
};

/**
 * Model representing a group.
 */
class GroupModel {
    constructor() {
        this.id = null;
        this.userProfileId = null;
        this.groupName = null;
        this.description = null;
        this.isPublic = true;
        this.members = null;
        this.tags = null;
        this.categories = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.isDeleted = false;
        this.deletedAt = null;
        this.isHidden = false;
        this.isArchived = false;
        this.__isNull = true;
        this.__isDefault = false;
    }

    /**
     * Creates a GroupModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {GroupModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new GroupModel();

        instance.id = row.id ?? 0;
        instance.userProfileId = row.user_profile_id ?? 0;
        instance.groupName = row.group_name ?? "";
        instance.description = row.description ?? "";
        instance.isPublic = Boolean(row.is_public);
        instance.members = row.members ?? "";
        instance.tags = row.tags ?? "";
        instance.categories = row.categories ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.modifiedAt = toISOStringOrEmpty(row.modified_at);
        instance.isDeleted = Boolean(row.is_deleted);
        instance.deletedAt = toISOStringOrEmpty(row.deleted_at);
        instance.isHidden = Boolean(row.is_hidden);
        instance.isArchived = Boolean(row.is_archived);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    /**
     * Creates a null (empty) GroupModel.
     * @returns {GroupModel} A null model instance.
     */
    static null() {
        return new GroupModel();
    }

    /**
     * Creates a default GroupModel with sample data.
     * @returns {GroupModel} A default model instance.
     */
    static default() {
        const instance = new GroupModel();
        instance.id = 0;
        instance.userProfileId = 0;
        instance.groupName = "default group";
        instance.description = "";
        instance.isPublic = true;
        instance.members = "";
        instance.tags = "";
        instance.categories = "";
        instance.createdAt = new Date().toISOString();
        instance.modifiedAt = new Date().toISOString();
        instance.isDeleted = false;
        instance.deletedAt = null;
        instance.isHidden = false;
        instance.isArchived = false;
        instance.__isNull = false;
        instance.__isDefault = true;
        return instance;
    }

    /**
     * Converts the model to a client-safe plain object.
     * @returns {Object} Plain object without internal properties.
     */
    toClient() {
        const obj = pojo(this);
        delete obj.__isDefault;
        delete obj.__isNull;
        return obj;
    }
}

export { updateGroup, GroupModel, groupKeyMap };
