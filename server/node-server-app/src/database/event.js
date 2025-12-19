import { pool } from "./db.js";
import { getUserProfileByUsername } from "./user_profile.js";
import { EventModel, eventKeyMap } from "../models/eventModel.js";

/**
 *  Get event by ID
 *  @param { string } id
 *  @returns { Promise<object|null> }
 */
async function getEventById(id) {
    try {
        const query = "SELECT * FROM public.event WHERE id = $1 AND is_deleted = false";
        const value = [id];
        const res = await pool.query(query, value);
        if (res.rowCount === 0) {
            return null;
        }
        return EventModel.fromDatabaseRow(res.rows[0]);

    } catch (err) {
        console.error("ERROR : getEventById");
        console.error(err);
        return null;
    }
}

/**
 * List events by organiser id
 * @param {string} organiserId
 * @param {{limit?: number, offset?: number, orderKey?: string, orderBy?: string}} options
 * @returns {Promise<Array<EventModel>}
 */
async function listEventsByOrganiserId(organiserId, options = {}) {
    try {
        const {
            limit: rawLimit = 20,
            offset: rawOffset = 0,
            orderKey: rawOrderKey = "start_at",
            orderBy: rawOrderBy = "DESC"
        } = options;

        if (!organiserId) {
            console.warn("listEventsByOrganiserId called without organiserId");
            return [];
        }

        const limit = Math.max(1, Math.min(100, Number(rawLimit) || 20));
        const offset = Math.max(0, Number(rawOffset) || 0);

        const allowedOrderKeys = ["start_at", "end_at", "created_at"];
        const safeOrderKey = allowedOrderKeys.includes(rawOrderKey)
            ? rawOrderKey
            : "start_at";

        const allowedDirections = ["ASC", "DESC"];
        const safeDirection = allowedDirections.includes(rawOrderBy.toUpperCase())
            ? rawOrderBy.toUpperCase()
            : "DESC";

        const orderClause = `${safeOrderKey} ${safeDirection}`;

        const columns = [
            "id",
            "organiser_id",
            "organisers",
            "title",
            "description",
            "online_location",
            "start_at",
            "end_at",
            "is_paid",
            "is_broadcast",
            "broadcast_type",
            "tags",
            "categories",
            "is_interactive",
            "is_anonymous",
            "interested",
            "attached_documents",
            "group_id",
            "created_at",
            "modified_at",
            "is_deleted",
            "is_hidden",
            "is_archived"
        ].join(", ");

        const query = `
            SELECT ${columns}
            FROM public.event
            WHERE organiser_id = $1
              AND is_deleted = false
              AND is_hidden = false
            ORDER BY ${orderClause}
            LIMIT $2 OFFSET $3
        `;

        const values = [organiserId, limit, offset];

        const res = await pool.query(query, values);

        return res.rows.map(EventModel.fromDatabaseRow);
    } catch (err) {
        console.error("ERROR : listEventsByOrganiserId", { options, err });
        console.error(err);
        return [];
    }
}

/**
 * Create event given an organiser id
 * @param {number} organiserId
 * @param {object} payload - fields can be camelCase or snake_case
 * @return {Promise<object|null>}
 */
async function createEvent(organiserId, payload) {
    try {
        if (!organiserId || !payload) {
            console.error("createEvent: missing required fields");
            return null;
        }

        const get = (camel, snake) => {
            if (typeof payload[camel] !== "undefined") return payload[camel];
            if (typeof payload[snake] !== "undefined") return payload[snake];
            return undefined;
        };

        const title = get("title", "title");
        const rawStart = get("startAt", "start_at");
        const rawEnd = get("endAt", "end_at");
        if (!(title || title === "") || !rawStart || !rawEnd) {
            console.error("createEvent: missing required fields (title/start/end)");
            return null;
        }

        const startTs = new Date(rawStart);
        const endTs = new Date(rawEnd);

        if (!isFinite(startTs.getTime()) || !isFinite(endTs.getTime()) || endTs <= startTs) {
            console.error("createEvent: invalid start_at/end_at (end_at must be after start_at)");
            return null;
        }

        const castBool = (v, defaultVal) => {
            if (typeof v === "undefined") return defaultVal;
            return v === true || v === "true" || v === 1;
        };

        const values = [
            organiserId,
            get("organisers", "organisers") ?? "",
            title,
            get("description", "description") ?? "",
            get("onlineLocation", "online_location") ?? "",
            startTs.toISOString(),
            endTs.toISOString(),
            castBool(get("isPaid", "is_paid"), false),
            castBool(get("isBroadcast", "is_broadcast"), false),
            get("broadcastType", "broadcast_type") ?? "",
            (() => { const t = get("tags", "tags"); return Array.isArray(t) ? t.join(",") : (t ?? ""); })(),
            (() => { const c = get("categories", "categories"); return Array.isArray(c) ? c.join(",") : (c ?? ""); })(),
            castBool(get("isInteractive", "is_interactive"), true),
            castBool(get("isAnonymous", "is_anonymous"), false),
            get("interested", "interested") ?? "",
            get("attachedDocuments", "attached_documents") ?? "",
            (() => { const g = get("groupId", "group_id"); return (typeof g === "undefined" || g === null || g === "") ? 0 : Number(g); })()
        ];

        const query = `
            INSERT INTO public.event
              (organiser_id, organisers, title, description, online_location,
               start_at, end_at, is_paid, is_broadcast, broadcast_type,
               tags, categories, is_interactive, is_anonymous,
               interested, attached_documents, group_id)
            VALUES
              ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
               $11, $12, $13, $14, $15, $16, $17)
            RETURNING *;
        `;

        const res = await pool.query(query, values);
        if (!res || res.rowCount === 0) return null;
        return EventModel.fromDatabaseRow(res.rows[0]);

    } catch (err) {
        console.error("ERROR : createEvent");
        console.error(err);
        return null;
    }
}

/**
 * create event by username (profile - organiser_id)
 * @param {string} username
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
async function createEventByUsername(username, payload) {
    try {
        if (!username) {
            console.error("createEventByUsername: missing username");
            return null;
        }
        const profile = await getUserProfileByUsername(username);
        if (!profile || profile.__isNull) {
            console.error("createEventByUsername: profile not found for username", username);
            return null;
        }
        const organiserId = profile.userId;
        return await createEvent(organiserId, payload);
    } catch (err) {
        console.error("ERROR : createEventByUsername");
        console.error(err);
        return null;
    }
}

/**
 * update event
 * @param {string} id
 * @param {object} updates - allowed fields (camelCase or snake_case accepted)
 * @returns {Promise<Object|null>}
 */
async function updateEvent(id, updates = {}) {
    try {
        if (!id) return null;

        const ALLOWED = new Set([
            "organisers", "title", "description", "online_location",
            "start_at", "end_at", "is_paid", "is_broadcast", "broadcast_type",
            "tags", "categories", "is_interactive", "is_anonymous",
            "interested", "attached_documents", "group_id",
            "is_hidden", "is_archived"
        ]);

        const toSnake = (key) => {
            if (eventKeyMap[key] && eventKeyMap[key].includes("_")) return eventKeyMap[key];
            if (key.includes("_") && ALLOWED.has(key)) return key;
            if (eventKeyMap[key] && typeof eventKeyMap[key] === "string" && eventKeyMap[key].includes("_")) return eventKeyMap[key];
            for (const [k, v] of Object.entries(eventKeyMap)) {
                if (k === key && typeof v === "string" && v.includes("_")) return v;
            }
            return null;
        };

        const setParts = [];
        const vals = [];
        let idx = 1;

        for (const incomingKey of Object.keys(updates)) {
            const snake = toSnake(incomingKey);
            if (!snake) continue;
            if (!ALLOWED.has(snake)) continue;

            let val = updates[incomingKey];
            if (snake === "start_at" || snake === "end_at") {
                val = val ? new Date(val).toISOString() : null;
            } else if (["is_paid", "is_broadcast", "is_interactive", "is_anonymous", "is_hidden", "is_archived"].includes(snake)) {
                val = (val === true || val === "true" || val === 1);
            } else if (snake === "group_id") {
                val = (val === undefined || val === null || val === "") ? 0 : Number(val);
            } else if (snake === "tags" || snake === "categories") {
                if (Array.isArray(val)) val = val.join(",");
                val = val ?? "";
            } else {
                val = val ?? "";
            }

            setParts.push(`${snake} = $${idx}`);
            vals.push(val);
            idx++;
        }

        if (setParts.length === 0) {
            return await getEventById(id);
        }

        setParts.push("modified_at = CURRENT_TIMESTAMP");

        vals.push(id);

        const query = `
            UPDATE public.event
            SET ${setParts.join(", ")}
            WHERE id = $${vals.length}
            RETURNING *
        `;

        const res = await pool.query(query, vals);

        if (!res || res.rowCount === 0) return null;
        return EventModel.fromDatabaseRow(res.rows[0]);

    } catch (err) {
        console.error("[updateEvent] Error");
        console.error(err);
        return null;
    }
}

/**
 * delete event (set is_deleted = true)
 * @param {number|string} id
 * @param {number|string} userProfileId - User profile ID who initiated the deletion
 * @returns {Promise<boolean>}
 */
async function deleteEvent(id, userProfileId = null) {
    try {
        const query = `
            UPDATE public.event 
            SET is_deleted = true, 
                deleted_at = CURRENT_TIMESTAMP, 
                modified_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING id
        `;
        const values = [id];
        const res = await pool.query(query, values);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: deleteEvent");
        console.error(err);
        return false;
    }
}

/**
 * Hard delete event (permanent deletion)
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
async function hardDeleteEvent(id) {
    try {
        const query = "DELETE FROM public.event WHERE id = $1 RETURNING id";
        const values = [id];
        const res = await pool.query(query, values);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: hardDeleteEvent");
        console.error(err);
        return false;
    }
}

export {
    getEventById,
    listEventsByOrganiserId,
    createEvent,
    createEventByUsername,
    updateEvent,
    deleteEvent,
    hardDeleteEvent,
};
