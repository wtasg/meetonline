export { today, tomorrow, yesterday, zero, someday, UTC };

/**
 * Create a Date representing the current date and time.
 * @returns {Date} A Date object for the current instant.
 */
function today() {
    return (new Date());
}

function tomorrow() {
    const today = new Date();
    const morrow = new Date(today);
    morrow.setDate(today.getDate() + 1);
    return morrow;
}

function yesterday() {
    const today = new Date();
    const last = new Date(today);
    last.setDate(today.getDate() - 1);
    return last;
}

function zero() {
    return (new Date(0));
}

/**
 * Calculate a future or past date in UTC string format (e.g. for cookie expiration)
 * @param {number} days Number of days from now (default: 7)
 * @returns {string} UTC string for the calculated date
 */
function someday(days = 7) {
    if (typeof days !== "number" || isNaN(days)) {
        days = 7;
    }

    const now = new Date();
    const day = new Date(now);
    day.setDate(now.getDate() + days);
    return day;
}

const UTC = {
    today: () => today().toUTCString(),
    tomorrow: () => tomorrow().toUTCString(),
    someday: (n) => someday(n).toUTCString(),
    zero: () => zero().toUTCString(),
    yesterday: () => yesterday().toUTCString()
};

