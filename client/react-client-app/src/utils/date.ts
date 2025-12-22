/**
 * Get the current date and time
 * @returns {Date} Current date as a Date object
 */
function today(): Date {
    return (new Date());
}

/**
 * Get tomorrow's date (current date + 1 day)
 * @returns {Date} Tomorrow's date as a Date object
 */
function tomorrow(): Date {
    const today = new Date();
    const morrow = new Date(today);
    morrow.setDate(today.getDate() + 1);
    return morrow;
}

/**
 * Get yesterday's date (current date - 1 day)
 * @returns {Date} Yesterday's date as a Date object
 */
function yesterday(): Date {
    const today = new Date();
    const last = new Date(today);
    last.setDate(today.getDate() - 1);
    return last;
}

/**
 * Get the Unix epoch date (January 1, 1970)
 * @returns {Date} Unix epoch as a Date object
 */
function zero(): Date {
    return (new Date(0));
}

/**
 * Calculate a future or past date (e.g. for cookie expiration)
 * @param {number} [days=7] - Number of days from now (default: 7)
 * @returns {Date} Date object for the calculated date
 */
function someday(days: number = 7): Date {
    if (typeof days !== "number" || isNaN(days)) {
        days = 7;
    }

    const now = new Date();
    const day = new Date(now);
    day.setDate(now.getDate() + days);
    return day;
}

interface UTCHelpers {
    today: () => string;
    tomorrow: () => string;
    someday: (n?: number) => string;
    zero: () => string;
    yesterday: () => string;
}

const UTC: UTCHelpers = {
    today: () => today().toUTCString(),
    tomorrow: () => tomorrow().toUTCString(),
    someday: (n?: number) => someday(n).toUTCString(),
    zero: () => zero().toUTCString(),
    yesterday: () => yesterday().toUTCString()
};

export { today, tomorrow, yesterday, zero, someday, UTC };
export type { UTCHelpers };
