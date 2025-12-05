import { jest, describe, it, beforeEach, afterEach, expect } from "@jest/globals";

const handlerUrl = new URL("../../src/handlers/eventHandler.js", import.meta.url).href;
const eventDbUrl = new URL("../../src/database/event.js", import.meta.url).href;
const userProfileUrl = new URL("../../src/database/user_profile.js", import.meta.url).href;
const sessionUtilUrl = new URL("../../src/utils/session.js", import.meta.url).href;

const fakeCreateEvent = jest.fn();
const fakeGetEventById = jest.fn();
const fakeListByOrganiser = jest.fn();
const fakeUpdateEvent = jest.fn();
const fakeSoftDelete = jest.fn();
const fakeHardDelete = jest.fn();

const fakeGetUserProfileByUsername = jest.fn();
const fakeUserSession = jest.fn();

jest.unstable_mockModule(eventDbUrl, () => ({
    createEventByUsername: fakeCreateEvent,
    getEventById: fakeGetEventById,
    listEventsByOrganiserId: fakeListByOrganiser,
    updateEvent: fakeUpdateEvent,
    softDeleteEvent: fakeSoftDelete,
    hardDeleteEvent: fakeHardDelete,
}));

jest.unstable_mockModule(userProfileUrl, () => ({
    getUserProfileByUsername: fakeGetUserProfileByUsername,
}));

jest.unstable_mockModule(sessionUtilUrl, () => ({
    userSession: fakeUserSession,
}));

let handlerModule;

let consoleErrorSpy;

function makeMockRes() {
    const res = {};
    res.statusCode = null;
    res.jsonData = null;
    res.cleared = [];
    res.status = (s) => { res.statusCode = s; return res; };
    res.json = (j) => { res.jsonData = j; return res; };
    res.clearCookie = (n) => { res.cleared.push(n); return res; };
    return res;
}

beforeEach(async () => {
    jest.clearAllMocks();

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

    handlerModule = await import(handlerUrl);
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe("eventPOST (ESM mocks)", () => {

    it("returns 400 when cookies missing", async () => {
        const req = { cookies: null, body: {} };
        const res = makeMockRes();

        await handlerModule.eventPOST(req, res);

        expect(res.statusCode).toBe(400);
    });

    it("creates event when session valid", async () => {
        fakeUserSession.mockResolvedValue({ session: "valid" });

        const created = { id: 1, title: "Test event" };
        fakeCreateEvent.mockResolvedValue(created);

        const req = {
            cookies: { username: "alice", "session-1": "valid" },
            body: {
                title: "Test event",
                start_at: "2025-12-10T10:00:00Z",
                end_at: "2025-12-10T11:00:00Z"
            }
        };
        const res = makeMockRes();

        await handlerModule.eventPOST(req, res);

        expect(res.statusCode).toBe(201);
        expect(res.jsonData.event).toEqual(created);
    });

    it("returns 500 when createEventByUsername returns null", async () => {
        fakeUserSession.mockResolvedValue({ session: "valid" });
        fakeCreateEvent.mockResolvedValue(null);

        const req = {
            cookies: { username: "alice", "session-1": "valid" },
            body: {
                title: "Test event",
                start_at: "2025-12-10T10:00:00Z",
                end_at: "2025-12-10T11:00:00Z"
            }
        };
        const res = makeMockRes();

        await handlerModule.eventPOST(req, res);

        expect(res.statusCode).toBe(500);
    });

    it("returns 500 on unexpected error", async () => {
        fakeUserSession.mockImplementation(() => {
            throw new Error("boom");
        });

        const req = {
            cookies: { username: "alice", "session-1": "valid" },
            body: {
                title: "Test event",
                start_at: "2025-12-10T10:00:00Z",
                end_at: "2025-12-10T11:00:00Z"
            }
        };
        const res = makeMockRes();

        await handlerModule.eventPOST(req, res);

        expect(res.statusCode).toBe(500);
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    describe("eventGetById", () => {
        it("returns 400 when id missing", async () => {
            const req = { params: {} };
            const res = makeMockRes();

            await handlerModule.eventGetById(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: expect.any(String),
            }));
            expect(fakeGetEventById).not.toHaveBeenCalled();
        });

        it("returns 404 when event not found", async () => {
            fakeGetEventById.mockResolvedValue(null);

            const req = { params: { id: "999" } };
            const res = makeMockRes();

            await handlerModule.eventGetById(req, res);

            expect(fakeGetEventById).toHaveBeenCalledWith("999");
            expect(res.statusCode).toBe(404);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Event not found.",
            }));
        });

        it("returns 200 with event when found", async () => {
            const fakeEvent = {
                id: 42,
                title: "Found event",
                startAt: "2025-12-10T10:00:00Z",
                endAt: "2025-12-10T11:00:00Z"
            };
            fakeGetEventById.mockResolvedValue(fakeEvent);

            const req = { params: { id: "42" } };
            const res = makeMockRes();

            await handlerModule.eventGetById(req, res);

            expect(fakeGetEventById).toHaveBeenCalledWith("42");
            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: true,
                event: fakeEvent,
                message: "Success",
            }));
        });

        it("returns 500 and logs on unexpected error", async () => {
            fakeGetEventById.mockImplementation(() => { throw new Error("db boom"); });

            const req = { params: { id: "1" } };
            const res = makeMockRes();

            await handlerModule.eventGetById(req, res);

            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Caught error.",
            }));
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    // === eventsByOrganiserGET tests ===

    describe("eventsByOrganiserGET", () => {
        it("returns 400 when organiserId is missing", async () => {
            const req = { params: {}, query: {} };
            const res = makeMockRes();

            await handlerModule.eventsByOrganiserGET(req, res);

            expect(res.statusCode).toBe(400);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                events: [],
                message: "Missing organiser ID.",
            }));
            expect(fakeListByOrganiser).not.toHaveBeenCalled();
        });

        it("returns 200 with events (default limit/offset)", async () => {
            const fakeEvents = [
                { id: 1, title: "A" },
                { id: 2, title: "B" }
            ];
            fakeListByOrganiser.mockResolvedValue(fakeEvents);

            const req = {
                params: { id: "10" },
                query: {}
            };
            const res = makeMockRes();

            await handlerModule.eventsByOrganiserGET(req, res);

            expect(fakeListByOrganiser).toHaveBeenCalledWith(
                "10",
                { limit: 20, offset: 0 }
            );

            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: true,
                events: fakeEvents,
                message: "Success",
            }));
        });

        it("respects limit and offset query params", async () => {
            fakeListByOrganiser.mockResolvedValue([]);

            const req = {
                params: { id: "20" },
                query: { limit: "5", offset: "10" }
            };
            const res = makeMockRes();

            await handlerModule.eventsByOrganiserGET(req, res);

            expect(fakeListByOrganiser).toHaveBeenCalledWith(
                "20",
                { limit: 5, offset: 10 }
            );

            expect(res.statusCode).toBe(200);
            expect(res.jsonData.ok).toBe(true);
        });

        it("returns 500 and logs on unexpected error", async () => {
            fakeListByOrganiser.mockImplementation(() => {
                throw new Error("db failure");
            });

            const req = {
                params: { id: "30" },
                query: {}
            };
            const res = makeMockRes();

            await handlerModule.eventsByOrganiserGET(req, res);

            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                events: [],
                message: "Caught error.",
            }));

            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    // === eventPATCH tests ===
    describe("eventPATCH", () => {
        it("clears cookies and returns 403 when session invalid (cookie mismatch)", async () => {
            fakeUserSession.mockResolvedValue({ session: "valid" });

            const req = {
                cookies: { username: "alice", "session-1": "bad" }, // mismatch
                body: { id: 1, username: "alice", updates: { title: "X" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(fakeUserSession).toHaveBeenCalledWith({ username: "alice" });
            expect(res.cleared).toEqual(expect.arrayContaining(["session-1", "username", "loggedin"]));
            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Invalid session."
            }));
        });

        it("clears cookies and returns 400 when cookie username and body username mismatch", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 1, username: "bob", updates: { title: "X" } } // body username mismatch
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(res.cleared).toEqual(expect.arrayContaining(["session-1", "username", "loggedin"]));
            expect(res.statusCode).toBe(400);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: expect.any(String)
            }));
        });

        it("returns 403 when profile not found", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 1, username: "alice", updates: { title: "X" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(fakeGetUserProfileByUsername).toHaveBeenCalledWith("alice");
            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Profile not found."
            }));
        });

        it("returns 404 when event not found", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 999, username: "alice", updates: { title: "X" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(fakeGetEventById).toHaveBeenCalledWith(999);
            expect(res.statusCode).toBe(404);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Event not found."
            }));
        });

        it("returns 403 when user is not the owner", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 5, organiserId: 20 });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 5, username: "alice", updates: { title: "X" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Not the owner."
            }));
        });

        it("returns 500 when updateEvent fails", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 7, organiserId: 10 });
            fakeUpdateEvent.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 7, username: "alice", updates: { title: "New" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(fakeUpdateEvent).toHaveBeenCalledWith(7, { title: "New" });
            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Cannot update event."
            }));
        });

        it("updates and returns 200 on success", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 8, organiserId: 10 });

            const updatedEvent = { id: 8, title: "Updated" };
            fakeUpdateEvent.mockResolvedValue(updatedEvent);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 8, username: "alice", updates: { title: "Updated" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(fakeUpdateEvent).toHaveBeenCalledWith(8, { title: "Updated" });
            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: true,
                event: updatedEvent,
                message: "Success"
            }));
        });

        it("returns 500 and logs on unexpected error", async () => {
            fakeUserSession.mockImplementation(() => { throw new Error("boom"); });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 8, username: "alice", updates: { title: "Updated" } }
            };
            const res = makeMockRes();

            await handlerModule.eventPATCH(req, res);

            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Caught error."
            }));
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    // === eventSoftDELETE tests ===
    describe("eventSoftDELETE", () => {
        it("returns 400 and clears cookies when session invalid", async () => {
            fakeUserSession.mockResolvedValue({ session: "valid" });

            const req = {
                cookies: { username: "alice", "session-1": "bad" },
                body: { id: 1, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(fakeUserSession).toHaveBeenCalledWith({ username: "alice" });
            expect(res.cleared).toEqual(expect.arrayContaining(["session-1", "username", "loggedin"]));
            expect(res.statusCode).toBe(400);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Invalid session."
            }));
        });

        it("returns 403 when profile not found", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 2, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(fakeGetUserProfileByUsername).toHaveBeenCalledWith("alice");
            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Profile not found."
            }));
        });

        it("returns 404 when event not found", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 999, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(fakeGetEventById).toHaveBeenCalledWith(999);
            expect(res.statusCode).toBe(404);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Event not found."
            }));
        });

        it("returns 403 when user is not the owner", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            // event owned by organiserId 20
            fakeGetEventById.mockResolvedValue({ id: 5, organiserId: 20 });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 5, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Not the owner."
            }));
        });

        it("returns 500 when softDeleteEvent fails", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 7, organiserId: 10 });
            fakeSoftDelete.mockResolvedValue(false); // failure

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 7, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(fakeSoftDelete).toHaveBeenCalledWith(7);
            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Cannot delete event."
            }));
        });

        it("returns 200 when soft delete succeeds", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 8, organiserId: 10 });
            fakeSoftDelete.mockResolvedValue(true);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 8, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(fakeSoftDelete).toHaveBeenCalledWith(8);
            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: true,
                event: true,
                message: "Deleted (soft)."
            }));
        });

        it("returns 500 and logs on unexpected error", async () => {
            fakeUserSession.mockImplementation(() => { throw new Error("boom"); });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 8, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventSoftDELETE(req, res);

            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Caught error."
            }));
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    // === eventHardDELETE tests ===
    describe("eventHardDELETE", () => {
        it("returns 400 and clears cookies when session invalid", async () => {
            fakeUserSession.mockResolvedValue({ session: "valid" });

            const req = {
                cookies: { username: "alice", "session-1": "bad" }, // mismatch
                body: { id: 1, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(fakeUserSession).toHaveBeenCalledWith({ username: "alice" });
            expect(res.cleared).toEqual(expect.arrayContaining(["session-1", "username", "loggedin"]));
            expect(res.statusCode).toBe(400);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Invalid session."
            }));
        });

        it("returns 403 when profile not found", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 2, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(fakeGetUserProfileByUsername).toHaveBeenCalledWith("alice");
            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Profile not found."
            }));
        });

        it("returns 404 when event not found", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue(null);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 999, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(fakeGetEventById).toHaveBeenCalledWith(999);
            expect(res.statusCode).toBe(404);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Event not found."
            }));
        });

        it("returns 403 when user is not the owner", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 5, organiserId: 20 });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 5, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(res.statusCode).toBe(403);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Not the owner."
            }));
        });

        it("returns 500 when hardDeleteEvent fails", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 7, organiserId: 10 });
            fakeHardDelete.mockResolvedValue(false); // failure

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 7, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(fakeHardDelete).toHaveBeenCalledWith(7);
            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Cannot hard delete event."
            }));
        });

        it("returns 200 when hard delete succeeds", async () => {
            fakeUserSession.mockResolvedValue({ session: "s" });
            fakeGetUserProfileByUsername.mockResolvedValue({ profile_id: 10 });
            fakeGetEventById.mockResolvedValue({ id: 8, organiserId: 10 });
            fakeHardDelete.mockResolvedValue(true);

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 8, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(fakeHardDelete).toHaveBeenCalledWith(8);
            expect(res.statusCode).toBe(200);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: true,
                event: true,
                message: "Deleted (hard)."
            }));
        });

        it("returns 500 and logs on unexpected error", async () => {
            fakeUserSession.mockImplementation(() => { throw new Error("boom"); });

            const req = {
                cookies: { username: "alice", "session-1": "s" },
                body: { id: 8, username: "alice" }
            };
            const res = makeMockRes();

            await handlerModule.eventHardDELETE(req, res);

            expect(res.statusCode).toBe(500);
            expect(res.jsonData).toEqual(expect.objectContaining({
                ok: false,
                event: false,
                message: "Caught error."
            }));
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });
});
