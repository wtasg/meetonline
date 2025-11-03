function today() {
    return (new Date()).toUTCString();
}

function tomorrow() {
    const today = new Date();
    const morrow = new Date(today);
    morrow.setDate(today.getDate() + 1);
    return morrow.toUTCString();
}

function yesterday() {
    const today = new Date();
    const last = new Date(today);
    last.setDate(today.getDate() - 1);
    return last.toUTCString();
}

function zero() {
    return (new Date(0)).toUTCString();
}

export { today, tomorrow, yesterday, zero };
