import { pool } from "./db.js";
import { AttendanceModel } from "../models/attendanceModel.js";
import { randomUUID } from "crypto";

/**
 * Create attendance record for an event with generated tokens.
 * @param {number} eventId - The event ID.
 * @returns {Promise<AttendanceModel>}
 */
async function createAttendance(eventId) {
    const startToken = randomUUID();
    const midToken = randomUUID();
    const endToken = randomUUID();

    const query = `
        INSERT INTO event_attendance (event_id, start_token, mid_token, end_token)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (event_id) DO UPDATE
        SET start_token = $2, mid_token = $3, end_token = $4, modified_at = CURRENT_TIMESTAMP
        RETURNING *
    `;
    const result = await pool.query(query, [eventId, startToken, midToken, endToken]);
    return AttendanceModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Get attendance record for an event.
 * @param {number} eventId - The event ID.
 * @returns {Promise<AttendanceModel|null>}
 */
async function getAttendanceByEventId(eventId) {
    const query = "SELECT * FROM event_attendance WHERE event_id = $1";
    const result = await pool.query(query, [eventId]);
    if (result.rows.length === 0) {
        return null;
    }
    return AttendanceModel.fromDatabaseRow(result.rows[0]);
}

/**
 * Mark a user as present for a specific phase.
 * @param {number} eventId - The event ID.
 * @param {string} phase - The phase: 'start', 'mid', 'end'.
 * @param {number} userProfileId - The user profile ID.
 * @param {string} token - The token provided by the user.
 * @returns {Promise<{success: boolean, message: string, attendance?: AttendanceModel}>}
 */
async function markPresent(eventId, phase, userProfileId, token) {
    // Get current attendance record
    const attendance = await getAttendanceByEventId(eventId);
    if (!attendance) {
        return { success: false, message: "Attendance not initialized for this event" };
    }

    // Validate phase
    const validPhases = ["start", "mid", "end"];
    if (!validPhases.includes(phase)) {
        return { success: false, message: "Invalid phase" };
    }

    // Validate token
    const tokenField = `${phase}Token`;
    const presentField = `${phase}Present`;

    // Check if token matches
    if (attendance[tokenField] !== token) {
        return { success: false, message: "Invalid token" };
    }

    // Check if already marked
    if (AttendanceModel.isUserInPhase(attendance[presentField], userProfileId)) {
        return { success: false, message: "Already marked present for this phase" };
    }

    // Add user to present list
    const updatedPresent = AttendanceModel.addUserToPhase(attendance[presentField], userProfileId);

    // Update database
    const columnMap = {
        start: "start_present",
        mid: "mid_present",
        end: "end_present",
    };
    const column = columnMap[phase];

    const query = `
        UPDATE event_attendance
        SET ${column} = $2, modified_at = CURRENT_TIMESTAMP
        WHERE event_id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [eventId, updatedPresent]);
    return {
        success: true,
        message: "Marked present successfully",
        attendance: AttendanceModel.fromDatabaseRow(result.rows[0]),
    };
}

/**
 * Check if user is present in a phase.
 * @param {number} eventId - The event ID.
 * @param {string} phase - The phase: 'start', 'mid', 'end'.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<boolean>}
 */
async function isUserPresent(eventId, phase, userProfileId) {
    const attendance = await getAttendanceByEventId(eventId);
    if (!attendance) {
        return false;
    }
    const presentField = `${phase}Present`;
    return AttendanceModel.isUserInPhase(attendance[presentField], userProfileId);
}

/**
 * Get attendance score for a user (0-3).
 * @param {number} eventId - The event ID.
 * @param {number} userProfileId - The user profile ID.
 * @returns {Promise<number>}
 */
async function getUserAttendanceScore(eventId, userProfileId) {
    const attendance = await getAttendanceByEventId(eventId);
    if (!attendance) {
        return 0;
    }
    return attendance.getAttendanceScore(userProfileId);
}

/**
 * Get all user IDs who attended an event (any phase).
 * @param {number} eventId - The event ID.
 * @returns {Promise<number[]>}
 */
async function getAttendees(eventId) {
    const attendance = await getAttendanceByEventId(eventId);
    if (!attendance) {
        return [];
    }
    const start = AttendanceModel.parsePresent(attendance.startPresent);
    const mid = AttendanceModel.parsePresent(attendance.midPresent);
    const end = AttendanceModel.parsePresent(attendance.endPresent);
    return [...new Set([...start, ...mid, ...end])];
}

/**
 * Check if attendance exists for an event.
 * @param {number} eventId - The event ID.
 * @returns {Promise<boolean>}
 */
async function hasAttendance(eventId) {
    const query = "SELECT COUNT(*) as count FROM event_attendance WHERE event_id = $1";
    const result = await pool.query(query, [eventId]);
    return parseInt(result.rows[0].count, 10) > 0;
}

export {
    createAttendance,
    getAttendanceByEventId,
    markPresent,
    isUserPresent,
    getUserAttendanceScore,
    getAttendees,
    hasAttendance,
};
