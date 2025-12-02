import { pool } from "./db.js";

/**
 * Convert DB row → clean JS object
 * @param {object} row
 */
function mapEvent(row) {
    if (!row) return null;
    return {
        event_id: row.event_id,
        organiser_id: row.organiser_id,
        title: row.title,
        description: row.description,
        online_location: row.online_location,
        start_at: row.start_at,
        end_at: row.end_at,
        is_paid: row.is_paid,
        price_amount: row.price_amount,
        currency: row.currency,
        is_broadcast: row.is_broadcast,
        broadcast_type: row.broadcast_type,
        is_interactive: row.is_interactive,
        is_anonymous: row.is_anonymous,
        category_id: row.category_id,
        theme: row.theme,
        attached_document_id: row.attached_document_id,
        group_id: row.group_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_deleted: row.is_deleted,
        tags: row.tags,
        organiser: row.organiser,
        interested: row.interested,
        is_hidden: row.is_hidden,
        is_archived: row.is_archived
    };
}

/**
 * Create a new event
 * Required fields: chief_organiser_profile_id, title, start_at
 */
async function createEvent(data) {
    try {
        if (!data.organiser_id) throw new Error("organiser_id is required");
        if (!data.title) throw new Error("title is required");
        if (!data.start_at) throw new Error("start_at is required");
        const q = `
            INSERT INTO event (
                organiser_id,
                organiser,
                title,
                description,
                online_location,
                start_at,
                end_at,
                is_paid,
                price_amount,
                currency,
                is_broadcast,
                broadcast_type,
                is_interactive,
                is_anonymous,
                category_id,
                theme,
                interested,
                attached_document_id,
                group_id,
                tags
            )
            VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11,
                $12, $13, $14, $15, $16, $17
                $18, $19, $20
            )
            RETURNING *;
        `;

        const v = [
            data.organiser_id,
            data.organiser || null,
            data.title,
            data.description || null,
            data.online_location || null,
            data.start_at,
            data.end_at || null,
            data.is_paid ?? false,
            data.price_amount || null,
            data.currency || null,
            data.is_broadcast ?? false,
            data.broadcast_type || null,
            data.is_interactive ?? true,
            data.is_anonymous ?? false,
            data.category_id || null,
            data.theme || null,
            data.interested || null,
            data.attached_document_id || null,
            data.group_id || null,
            data.tags || null
        ];

        const r = await pool.query(q, v);
        return mapEvent(r.rows[0]);

    } catch (err) {
        console.error("ERROR: Creating event");
        console.error(err);
        return null;
    }
}

/**
 * Fetch a single event by ID
 */
async function getEventById(event_id) {
    try {
        const q = `
            SELECT * FROM event
            WHERE event_id = $1 AND is_deleted = false
        `;
        const v = [event_id];

        const r = await pool.query(q, v);
        if (r.rowCount === 0) return null;

        return mapEvent(r.rows[0]);

    } catch (err) {
        console.error("ERROR: Fetching event by id");
        console.error(err);
        return null;
    }
}

/**
 * Get all events created by a specific profile
 */
async function listEventsByProfile(profile_id) {
    try {
        const q = `
            SELECT * FROM event
            WHERE organiser_id = $1
              AND is_deleted = false
            ORDER BY start_at ASC
        `;
        const v = [profile_id];

        const r = await pool.query(q, v);
        return r.rows.map(mapEvent);

    } catch (err) {
        console.error("ERROR: Listing events for profile");
        console.error(err);
        return [];
    }
}

/**
 * Update an event
 * Only updates fields passed in `data`
 */
async function updateEvent(event_id, data) {
    try {
        // dynamically build SET clause
        const keys = Object.keys(data);
        if (keys.length === 0) return false;

        const setSql = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");

        const q = `
            UPDATE events
            SET ${setSql}, updated_at = NOW()
            WHERE event_id = $${keys.length + 1}
              AND is_deleted = false
            RETURNING *;
        `;
        const values = [...keys.map(k => data[k]), event_id];

        const r = await pool.query(q, values);

        if (r.rowCount === 0) return false;
        return mapEvent(r.rows[0]);

    } catch (err) {
        console.error("ERROR: Updating event");
        console.error(err);
        return false;
    }
}

/**
 * delete event
 */
async function deleteEvent(event_id) {
    try {
        const q = `
            UPDATE events
            SET is_deleted = true, updated_at = NOW()
            WHERE event_id = $1
        `;
        const v = [event_id];

        await pool.query(q, v);
        return true;

    } catch (err) {
        console.error("ERROR: Deleting event");
        console.error(err);
        return false;
    }
}

export {
    createEvent,
    getEventById,
    listEventsByProfile,
    updateEvent,
    deleteEvent
};
