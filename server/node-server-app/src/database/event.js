import { pool } from "./db.js";

import { getUserProfileByUsername } from "./user_profile.js";

/**
 * Map db row - clean JS object
 * @param { object } row
 */

function mapEventRow(row) {
    if (!row) {
        return null;
    }
    return {
        id: Number(row.id),
        organiserId: row.organiser_id ? Number(row.organiser_id) : null,
        organisers: row.organisers,
        title: row.title,
        description: row.description,
        onlineLocation: row.online_location,
        startAt: row.start_at ? row.start_at.toISOString() : null,
        endAt: row.end_at ? row.end_at.toISOString() : null,
        isPaid: Boolean(row.is_paid),
        isBroadcast: Boolean(row.is_broadcast),
        broadcastType: row.broadcast_type,
        tags: row.tags,
        categories: row.categories,
        isInteractive: Boolean(row.is_interactive),
        isAnonymous: Boolean(row.is_anonymous),
        interested: Boolean(row.interested),
        attachedDocuments: row.attached_documents,
        groupId: row.group_id ? Number(row.group_id) : null,
        createdAt: row.created_at ? row.created_at.toISOString() : null,
        modifiedAt: row.modified_at ? row.modified_at.toISOString() : null,
        isDeleted: Boolean(row.is_deleted),
        isHidden: Boolean(row.is_hidden),
        isArchived: Boolean(row.is_archived),
    };
}

/**
 *  Get event by ID
 *  @param { number|string } id
 *  @returns { Promise<object|null> }
 */
async function getEventById(id) {
    try {
        const query = "SELECT * FROM public.event WHERE id = $1 AND is_deleted = false";
        const value = [id];
        const res = await pool.query(query, value);
        if (res.rowCount === 0) {
            return null;
        } else {
            return mapEventRow(res.rows[0]);
        }
    } catch (err) {
        console.error("ERROR : getEventById");
        console.error(err);
        return null;
    }
}

/**
 * List event by orgniser id
 * @param {number} organiserId
 * @param {{limit?: number, offset?: number}} options
 * @returns {Promise<Array>}
 */
async function listEventsByOrganiserId(organiserId, options = {}) {
    try {
        const limit = Number(options.limit || 20);
        const offset = Number(options.offset || 0);
        const query = `
            SELECT * FROM public.event
            WHERE organiser_id = $1 AND is_deleted = false AND is_hidden = false
            ORDER BY start_at DESC
            LIMIT $2 OFFSET $3
        `;
        const values = [organiserId, limit, offset];
        const res = await pool.query(query, values);
        return res.rows.map(mapEventRow);
    } catch (err) {
        console.error("ERROR : listEventsByOrganiserId");
        console.error(err);
        return [];
    }
}

/**
 * Create event given an organiser id
 * @param {number} organiserId
 * @param {object} payload - fields matching table (title, descr ...)
 * @return {Promise<object|null>}
 */
async function createEvent(organiserId, payload) {
    try {
        if (!organiserId || !payload || !payload.title || !payload.start_at || !payload.end_at) {
            console.error("createEvent: missing required fields");
            return null;
        }

        const startTs = new Date(payload.start_at);
        const endTs = new Date(payload.end_at);
        if (!isFinite(startTs.getTime()) || !isFinite(endTs.getTime()) || endTs <= startTs) {
            console.error("createEvent: invalid start_at/end_at (end_at must be after start_at)");
            return null;
        }

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

        const values = [
            organiserId,
            payload.organisers || null,
            payload.title,
            payload.description || null,
            payload.online_location || null,
            payload.start_at,
            payload.end_at,
            payload.is_paid ?? false,
            payload.is_broadcast ?? false,
            payload.broadcast_type || null,
            payload.tags || null,
            payload.categories || null,
            payload.is_interactive ?? true,
            payload.is_anonymous ?? false,
            payload.interested || null,
            payload.attached_documents || null,
            payload.group_id || null,
        ];

        const res = await pool.query(query, values);
        if (res.rowCount === 0) {
            return null;
        } else {
            return mapEventRow(res.rows[0]);
        }

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
        const organiserId = profile.profile_id || profile.id || profile.user_id;
        return await createEvent(organiserId, payload);
    } catch (err) {
        console.error("ERROR : createEventByUsername");
        console.error(err);
        return null;
    }
}

/**
 * update event
 * @param {number|string} id
 * @param {object} updates - allowed fields : organisers, title, description, online_location, start_at, end_at, is_paid, is_broadcast, broadcast_type, tags, categories, is_intractive, is_anonymous, intrested, attached_documents, group_id, is_hidden, is_archived
 * @returns {Promise<Object|null>}
 */
async function updateEvent(id, updates = {}) {
    try {
        const allowed = [
            "organisers", "title", "description", "online_location",
            "start_at", "end_at", "is_paid", "is_broadcast", "broadcast_type",
            "tags", "categories", "is_interactive", "is_anonymous",
            "interested", "attached_documents", "group_id",
            "is_hidden", "is_archived"
        ];

        const set = [];
        const vals = [];
        let idx = 1;

        for (const k of allowed) {
            if (Object.prototype.hasOwnProperty.call(updates, k)) {
                set.push(`${k} = $${idx}`);
                vals.push(updates[k]);
                idx++;
            }
        }

        if (set.length === 0) {
            return await getEventById(id);
        }

        set.push("modified_at = CURRENT_TIMESTAMP");

        const query = `
            UPDATE public.event
            SET ${set.join(", ")}
            WHERE id = $${idx}
            RETURNING *
        `;

        vals.push(id);

        const res = await pool.query(query, vals);

        if (res.rowCount === 0) {
            return null;
        } else {
            return mapEventRow(res.rows[0]);
        }
    } catch (err) {
        console.error("[updateEvent] Error");
        console.error(err);
        return null;
    }
}

/**
 * Soft-delete event (set is_deleted = true)
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
async function softDeleteEvent(id) {
    try {
        const query = "UPDATE public.event SET is_deleted = true, modified_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id";
        const values = [id];
        const res = await pool.query(query, values);
        return res.rowCount > 0;
    } catch (err) {
        console.error("ERROR: softDeleteEvent");
        console.error(err);
        return false;
    }
}

/**
 * Hard delete - physically removes the row
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
    mapEventRow,
    getEventById,
    listEventsByOrganiserId,
    createEvent,
    createEventByUsername,
    updateEvent,
    softDeleteEvent,
    hardDeleteEvent,
};
