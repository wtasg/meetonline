import { CONF } from "./net-conf.js";
import { authenticatedFetch } from "./authenticatedFetch.js";

export interface AttendanceResponse {
    ok: boolean;
    message?: string;
    data?: {
        id?: number;
        eventId?: number;
        startToken?: string;
        midToken?: string;
        endToken?: string;
        startPresent?: string;
        midPresent?: string;
        endPresent?: string;
        createdAt?: string;
        modifiedAt?: string;
        score?: number;
        userScore?: number;
    };
}

/**
 * Initialize attendance tokens for an event (organizer only).
 * @param eventId - The event ID.
 * @returns Promise resolving to the attendance data with tokens.
 */
async function initAttendance(eventId: string): Promise<AttendanceResponse> {
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/events/${eventId}/attendance/init`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Mark attendance for an event phase.
 * @param eventId - The event ID.
 * @param phase - The phase: 'start', 'mid', 'end'.
 * @param token - The attendance token.
 * @returns Promise resolving to the response with score.
 */
async function markAttendance(
    eventId: string,
    phase: "start" | "mid" | "end",
    token: string
): Promise<AttendanceResponse> {
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/events/${eventId}/attendance/mark`,
            {
                credentials: "include",
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phase, token }),
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Get attendance status for an event.
 * @param eventId - The event ID.
 * @returns Promise resolving to the attendance data.
 */
async function getAttendance(eventId: string): Promise<AttendanceResponse> {
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/events/${eventId}/attendance`,
            {
                credentials: "include",
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

/**
 * Get attendance score for current user.
 * @param eventId - The event ID.
 * @returns Promise resolving to the score.
 */
async function getAttendanceScore(eventId: string): Promise<AttendanceResponse> {
    try {
        const response = await authenticatedFetch(
            `${CONF.HTTPS_SERVER}/api/events/${eventId}/attendance/score`,
            {
                credentials: "include",
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            }
        );
        return response.json();
    } catch (err: unknown) {
        console.error(err);
        return { ok: false, message: (err as Error).message };
    }
}

export {
    initAttendance,
    markAttendance,
    getAttendance,
    getAttendanceScore,
};
