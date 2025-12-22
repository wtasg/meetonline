import { pojo } from "@wtasnorg/node-lib";
import { toISOStringOrEmpty } from "../utils/dateUtils.js";

/**
 * Model representing event attendance with tokens.
 */
class AttendanceModel {
    constructor() {
        this.id = null;
        this.eventId = null;
        this.startToken = null;
        this.midToken = null;
        this.endToken = null;
        this.startPresent = null;
        this.midPresent = null;
        this.endPresent = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.__isNull = true;
        this.__isDefault = false;
    }

    /**
     * Creates an AttendanceModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {AttendanceModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new AttendanceModel();
        instance.id = row.id ?? 0;
        instance.eventId = row.event_id ?? 0;
        instance.startToken = row.start_token ?? null;
        instance.midToken = row.mid_token ?? null;
        instance.endToken = row.end_token ?? null;
        instance.startPresent = row.start_present ?? "";
        instance.midPresent = row.mid_present ?? "";
        instance.endPresent = row.end_present ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.modifiedAt = toISOStringOrEmpty(row.modified_at);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    /**
     * Creates a null (empty) AttendanceModel.
     * @returns {AttendanceModel} A null model instance.
     */
    static null() {
        return new AttendanceModel();
    }

    /**
     * Parses a comma-separated string of IDs into an array.
     * @param {string} presentStr - Comma-separated user profile IDs.
     * @returns {number[]} Array of user profile IDs.
     */
    static parsePresent(presentStr) {
        if (!presentStr || presentStr.trim() === "") {
            return [];
        }
        return presentStr.split(",").map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));
    }

    /**
     * Checks if a user is present in a phase.
     * @param {string} presentStr - Comma-separated user profile IDs.
     * @param {number} userProfileId - The user profile ID to check.
     * @returns {boolean} True if user is present.
     */
    static isUserInPhase(presentStr, userProfileId) {
        const ids = AttendanceModel.parsePresent(presentStr);
        return ids.includes(Number(userProfileId));
    }

    /**
     * Adds a user to a phase string.
     * @param {string} presentStr - Existing comma-separated user profile IDs.
     * @param {number} userProfileId - The user profile ID to add.
     * @returns {string} Updated comma-separated string.
     */
    static addUserToPhase(presentStr, userProfileId) {
        const ids = AttendanceModel.parsePresent(presentStr);
        if (!ids.includes(Number(userProfileId))) {
            ids.push(Number(userProfileId));
        }
        return ids.join(",");
    }

    /**
     * Gets the attendance score for a user (0-3).
     * @param {number} userProfileId - The user profile ID.
     * @returns {number} Score from 0 to 3.
     */
    getAttendanceScore(userProfileId) {
        let score = 0;
        if (AttendanceModel.isUserInPhase(this.startPresent, userProfileId)) score++;
        if (AttendanceModel.isUserInPhase(this.midPresent, userProfileId)) score++;
        if (AttendanceModel.isUserInPhase(this.endPresent, userProfileId)) score++;
        return score;
    }

    /**
     * Converts the model to a client-safe plain object.
     * Hides tokens from non-organizers.
     * @param {boolean} includeTokens - Whether to include tokens.
     * @returns {Object} Plain object without internal properties.
     */
    toClient(includeTokens = false) {
        const obj = pojo(this);
        delete obj.__isDefault;
        delete obj.__isNull;
        if (!includeTokens) {
            delete obj.startToken;
            delete obj.midToken;
            delete obj.endToken;
        }
        return obj;
    }
}

const attendanceKeyMap = {
    id: "id",
    eventId: "event_id",
    event_id: "eventId",
    startToken: "start_token",
    start_token: "startToken",
    midToken: "mid_token",
    mid_token: "midToken",
    endToken: "end_token",
    end_token: "endToken",
    startPresent: "start_present",
    start_present: "startPresent",
    midPresent: "mid_present",
    mid_present: "midPresent",
    endPresent: "end_present",
    end_present: "endPresent",
    createdAt: "created_at",
    created_at: "createdAt",
    modifiedAt: "modified_at",
    modified_at: "modifiedAt",
};

export { AttendanceModel, attendanceKeyMap };
