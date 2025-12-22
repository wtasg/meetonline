import {
    initAttendance as netInitAttendance,
    markAttendance as netMarkAttendance,
    getAttendance as netGetAttendance,
    getAttendanceScore as netGetAttendanceScore,
    AttendanceResponse,
} from "../net/attendance.js";

/**
 * Initialize attendance tokens for an event (organizer only).
 * @param eventId - The event ID.
 * @returns Promise resolving to the attendance data with tokens.
 */
async function initEventAttendance(eventId: string): Promise<AttendanceResponse> {
    return netInitAttendance(eventId);
}

/**
 * Mark attendance for an event phase.
 * @param eventId - The event ID.
 * @param phase - The phase: 'start', 'mid', 'end'.
 * @param token - The attendance token.
 * @returns Promise resolving to the response with score.
 */
async function markEventAttendance(
    eventId: string,
    phase: "start" | "mid" | "end",
    token: string
): Promise<AttendanceResponse> {
    return netMarkAttendance(eventId, phase, token);
}

/**
 * Get attendance status for an event.
 * @param eventId - The event ID.
 * @returns Promise resolving to the attendance data.
 */
async function getEventAttendance(eventId: string): Promise<AttendanceResponse> {
    return netGetAttendance(eventId);
}

/**
 * Get attendance score for current user.
 * @param eventId - The event ID.
 * @returns Promise resolving to the score.
 */
async function getUserAttendanceScore(eventId: string): Promise<AttendanceResponse> {
    return netGetAttendanceScore(eventId);
}

export {
    initEventAttendance,
    markEventAttendance,
    getEventAttendance,
    getUserAttendanceScore,
};
