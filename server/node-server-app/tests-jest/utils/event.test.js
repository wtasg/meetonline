import { afterEach, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../../src/database/db.js", () => {
    return {
        pool: {
            query: jest.fn(),
        },
    };
});

jest.unstable_mockModule("../../src/database/user_profile.js", () => {
    return {
        getUserProfileByUsername: jest.fn(),
    };
});

const { pool } = await import("../../src/database/db.js");
const { getUserProfileByUsername } = await import("../../src/database/user_profile.js");
const eventModule = await import("../../src/database/event.js");

const {
    mapEventRow,
    getEventById,
    listEventsByOrganiserId,
    createEvent,
    createEventByUsername,
    updateEvent,
    softDeleteEvent,
    hardDeleteEvent,
} = eventModule;

let consoleErrorSpy;
beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
});
afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe("database/event.js", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("mapEventRow", () => {
        test("maps a full DB row to camelCase object with types", () => {
            const now = new Date();
            const later = new Date(now.getTime() + 60 * 60 * 1000);
            const row = {
                id: "42",
                organiser_id: "7",
                organisers: "7,8",
                title: "My Event",
                description: "desc",
                online_location: "https://meet",
                start_at: now,
                end_at: later,
                is_paid: true,
                is_broadcast: false,
                broadcast_type: "youtube",
                tags: "#a,#b",
                categories: "cat1",
                is_interactive: true,
                is_anonymous: false,
                interested: true,
                attached_documents: "doc.pdf",
                group_id: "3",
                created_at: now,
                modified_at: later,
                is_deleted: false,
                is_hidden: false,
                is_archived: false,
            };

            const mapped = mapEventRow(row);
            expect(mapped).toMatchObject({
                id: 42,
                organiserId: 7,
                organisers: "7,8",
                title: "My Event",
                description: "desc",
                onlineLocation: "https://meet",
                startAt: now.toISOString(),
                endAt: later.toISOString(),
                isPaid: true,
                isBroadcast: false,
                broadcastType: "youtube",
                tags: "#a,#b",
                categories: "cat1",
                isInteractive: true,
                isAnonymous: false,
                interested: true,
                attachedDocuments: "doc.pdf",
                groupId: 3,
                createdAt: now.toISOString(),
                modifiedAt: later.toISOString(),
                isDeleted: false,
                isHidden: false,
                isArchived: false,
            });
        });

        test("returns null when passed falsy row", () => {
            expect(mapEventRow(null)).toBeNull();
            expect(mapEventRow(undefined)).toBeNull();
        });
    });

    describe("getEventById", () => {
        test("returns null when not found", async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const res = await getEventById(999);
            expect(pool.query).toHaveBeenCalled();
            expect(res).toBeNull();
        });

        test("returns mapped row when found", async () => {
            const row = { id: 1, organiser_id: 2, title: "t", start_at: new Date(), end_at: new Date(Date.now() + 3600000), is_paid: false };
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [row] });

            const res = await getEventById(1);
            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
            expect(res).toMatchObject({ id: 1, organiserId: 2, title: "t" });
        });
    });

    describe("listEventsByOrganiserId", () => {
        test("returns mapped rows", async () => {
            const row1 = { id: 1, organiser_id: 5, title: "a", start_at: new Date(), end_at: new Date() };
            const row2 = { id: 2, organiser_id: 5, title: "b", start_at: new Date(), end_at: new Date() };
            pool.query.mockResolvedValueOnce({ rows: [row1, row2] });

            const res = await listEventsByOrganiserId(5, { limit: 10, offset: 0 });
            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [5, 10, 0]);
            expect(Array.isArray(res)).toBe(true);
            expect(res.length).toBe(2);
            expect(res[0]).toMatchObject({ id: 1 });
        });

        test("returns empty array on error", async () => {
            pool.query.mockRejectedValueOnce(new Error("db fail"));
            const res = await listEventsByOrganiserId(1);
            expect(res).toEqual([]);
        });
    });

    describe("createEvent", () => {
        test("returns null for missing required fields", async () => {
            const r1 = await createEvent(null, {});
            expect(r1).toBeNull();

            const r2 = await createEvent(1, { title: "t" }); // missing times
            expect(r2).toBeNull();
        });

        test("returns null for invalid timestamps", async () => {
            const r = await createEvent(1, { title: "t", start_at: "invalid", end_at: "invalid" });
            expect(r).toBeNull();
        });

        test("inserts and returns mapped row on success", async () => {
            const now = new Date();
            const later = new Date(now.getTime() + 1000 * 60 * 60);
            const dbRow = {
                id: 10,
                organiser_id: 1,
                title: "ok",
                start_at: now,
                end_at: later,
                is_paid: false,
            };
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [dbRow] });

            const payload = { title: "ok", start_at: now.toISOString(), end_at: later.toISOString() };
            const result = await createEvent(1, payload);

            expect(pool.query).toHaveBeenCalled();
            expect(result).toMatchObject({ id: 10, title: "ok", organiserId: 1 });
        });

        test("returns null on DB error", async () => {
            pool.query.mockRejectedValueOnce(new Error("db bad"));
            const now = new Date();
            const later = new Date(now.getTime() + 3600000);
            const r = await createEvent(1, { title: "t", start_at: now.toISOString(), end_at: later.toISOString() });
            expect(r).toBeNull();
        });
    });

    describe("createEventByUsername", () => {
        test("returns null when username missing", async () => {
            const r = await createEventByUsername("", {});
            expect(r).toBeNull();
        });

        test("returns null when profile not found", async () => {
            getUserProfileByUsername.mockResolvedValueOnce(null);
            const r = await createEventByUsername("u", {});
            expect(r).toBeNull();
            expect(getUserProfileByUsername).toHaveBeenCalledWith("u");
        });

        test("creates event when profile found", async () => {
            getUserProfileByUsername.mockResolvedValueOnce({ profile_id: 99 });

            const now = new Date();
            const later = new Date(now.getTime() + 3600000);
            const dbRow = { id: 11, organiser_id: 99, title: "from-user", start_at: now, end_at: later };
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [dbRow] });

            const r = await createEventByUsername("bob", { title: "from-user", start_at: now.toISOString(), end_at: later.toISOString() });
            expect(getUserProfileByUsername).toHaveBeenCalledWith("bob");
            expect(pool.query).toHaveBeenCalled();
            expect(r).toMatchObject({ id: 11, organiserId: 99 });
        });
    });

    describe("updateEvent", () => {
        test("returns null when update fails", async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 });
            const r = await updateEvent(1, { title: "new" });
            expect(r).toBeNull();
        });

        test("updates and returns mapped object", async () => {
            const now = new Date();
            const dbRow = { id: 2, organiser_id: 3, title: "updated", start_at: now, end_at: new Date(now.getTime() + 3600000) };
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [dbRow] });

            const r = await updateEvent(2, { title: "updated" });
            expect(pool.query).toHaveBeenCalled();
            expect(r).toMatchObject({ id: 2, title: "updated" });
        });

        test("when no allowed updates provided, returns existing event (getEventById path)", async () => {
            const existingRow = { id: 55, organiser_id: 10, title: "orig", start_at: new Date(), end_at: new Date(Date.now() + 3600000) };
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [existingRow] });

            const r = await updateEvent(55, {});
            expect(pool.query).toHaveBeenCalled();
            expect(r).toMatchObject({ id: 55, title: "orig" });
        });
    });

    describe("softDeleteEvent & hardDeleteEvent", () => {
        test("softDeleteEvent returns true when rowCount > 0", async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });
            const ok = await softDeleteEvent(1);
            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
            expect(ok).toBe(true);
        });

        test("softDeleteEvent returns false on error", async () => {
            pool.query.mockRejectedValueOnce(new Error("fail"));
            const ok = await softDeleteEvent(5);
            expect(ok).toBe(false);
        });

        test("hardDeleteEvent returns true when rowCount > 0", async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2 }] });
            const ok = await hardDeleteEvent(2);
            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [2]);
            expect(ok).toBe(true);
        });

        test("hardDeleteEvent returns false on error", async () => {
            pool.query.mockRejectedValueOnce(new Error("fail"));
            const ok = await hardDeleteEvent(2);
            expect(ok).toBe(false);
        });
    });
});
