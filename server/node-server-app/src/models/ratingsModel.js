import { pojo } from "@wtasnorg/node-lib";
import { toISOStringOrEmpty } from "../utils/dateUtils.js";

/**
 * Base rating model with common fields.
 */
class BaseRatingModel {
    constructor() {
        this.id = null;
        this.rating = 0;
        this.status = "unread";
        this.comment = null;
        this.createdAt = null;
        this.__isNull = true;
        this.__isDefault = false;
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

/**
 * Model representing an event rating.
 */
class EventRatingModel extends BaseRatingModel {
    constructor() {
        super();
        this.eventId = null;
        this.userProfileId = null;
    }

    /**
     * Creates an EventRatingModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {EventRatingModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new EventRatingModel();
        instance.id = row.id ?? 0;
        instance.eventId = row.event_id ?? 0;
        instance.userProfileId = row.user_profile_id ?? 0;
        instance.rating = row.rating ?? 0;
        instance.status = row.status ?? "unread";
        instance.comment = row.comment ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new EventRatingModel();
    }
}

/**
 * Model representing a group rating.
 */
class GroupRatingModel extends BaseRatingModel {
    constructor() {
        super();
        this.groupId = null;
        this.userProfileId = null;
    }

    /**
     * Creates a GroupRatingModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {GroupRatingModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new GroupRatingModel();
        instance.id = row.id ?? 0;
        instance.groupId = row.group_id ?? 0;
        instance.userProfileId = row.user_profile_id ?? 0;
        instance.rating = row.rating ?? 0;
        instance.status = row.status ?? "unread";
        instance.comment = row.comment ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new GroupRatingModel();
    }
}

/**
 * Model representing an organizer rating.
 */
class OrganizerRatingModel extends BaseRatingModel {
    constructor() {
        super();
        this.organizerId = null;
        this.raterId = null;
        this.contextType = null;
        this.contextId = null;
    }

    /**
     * Creates an OrganizerRatingModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {OrganizerRatingModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new OrganizerRatingModel();
        instance.id = row.id ?? 0;
        instance.organizerId = row.organizer_id ?? 0;
        instance.raterId = row.rater_id ?? 0;
        instance.contextType = row.context_type ?? "";
        instance.contextId = row.context_id ?? 0;
        instance.rating = row.rating ?? 0;
        instance.status = row.status ?? "unread";
        instance.comment = row.comment ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new OrganizerRatingModel();
    }
}

/**
 * Model representing a member rating.
 */
class MemberRatingModel extends BaseRatingModel {
    constructor() {
        super();
        this.memberId = null;
        this.raterId = null;
        this.contextType = null;
        this.contextId = null;
    }

    /**
     * Creates a MemberRatingModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {MemberRatingModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new MemberRatingModel();
        instance.id = row.id ?? 0;
        instance.memberId = row.member_id ?? 0;
        instance.raterId = row.rater_id ?? 0;
        instance.contextType = row.context_type ?? "";
        instance.contextId = row.context_id ?? 0;
        instance.rating = row.rating ?? 0;
        instance.status = row.status ?? "unread";
        instance.comment = row.comment ?? "";
        instance.createdAt = toISOStringOrEmpty(row.created_at);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new MemberRatingModel();
    }
}

// Rating status constants
const RATING_STATUS = {
    UNREAD: "unread",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    DISPUTED: "disputed",
    INVALID: "invalid",
};

// Valid rating statuses
const VALID_STATUSES = Object.values(RATING_STATUS);

// Rating range
const RATING_MIN = -5;
const RATING_MAX = 5;

/**
 * Validates a rating value.
 * @param {number} rating - The rating to validate.
 * @returns {boolean} True if valid.
 */
const isValidRating = (rating) => {
    const num = Number(rating);
    return !isNaN(num) && num >= RATING_MIN && num <= RATING_MAX && Number.isInteger(num);
};

/**
 * Validates a rating status.
 * @param {string} status - The status to validate.
 * @returns {boolean} True if valid.
 */
const isValidStatus = (status) => {
    return VALID_STATUSES.includes(status);
};

export {
    EventRatingModel,
    GroupRatingModel,
    OrganizerRatingModel,
    MemberRatingModel,
    RATING_STATUS,
    VALID_STATUSES,
    RATING_MIN,
    RATING_MAX,
    isValidRating,
    isValidStatus,
};
