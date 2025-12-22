import { pojo } from "@wtasnorg/node-lib";
import { toISOStringOrEmpty } from "../utils/dateUtils.js";

/**
 * Model representing a group member.
 */
class GroupMemberModel {
    constructor() {
        this.id = null;
        this.groupId = null;
        this.userProfileId = null;
        this.role = "member";
        this.consecutiveAttendance = 0;
        this.regularityToken = null;
        this.joinedAt = null;
        this.isActive = true;
        this.__isNull = true;
        this.__isDefault = false;
    }

    /**
     * Creates a GroupMemberModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {GroupMemberModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new GroupMemberModel();
        instance.id = row.id ?? 0;
        instance.groupId = row.group_id ?? 0;
        instance.userProfileId = row.user_profile_id ?? 0;
        instance.role = row.role ?? "member";
        instance.consecutiveAttendance = row.consecutive_attendance ?? 0;
        instance.regularityToken = row.regularity_token ?? null;
        instance.joinedAt = toISOStringOrEmpty(row.joined_at);
        instance.isActive = Boolean(row.is_active);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    /**
     * Creates a null (empty) GroupMemberModel.
     * @returns {GroupMemberModel} A null model instance.
     */
    static null() {
        return new GroupMemberModel();
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

const groupMemberKeyMap = {
    id: "id",
    groupId: "group_id",
    group_id: "groupId",
    userProfileId: "user_profile_id",
    user_profile_id: "userProfileId",
    role: "role",
    consecutiveAttendance: "consecutive_attendance",
    consecutive_attendance: "consecutiveAttendance",
    regularityToken: "regularity_token",
    regularity_token: "regularityToken",
    joinedAt: "joined_at",
    joined_at: "joinedAt",
    isActive: "is_active",
    is_active: "isActive",
};

export { GroupMemberModel, groupMemberKeyMap };
