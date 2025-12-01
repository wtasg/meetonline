jest.mock("../src/database/db.js", () => ({
    pool: { query: jest.fn() }
}));

const { pool } = require("../src/database/db.js");
const {
    createEvent,
    getEventById,
    listEventsByProfile,
    updateEvent,
    deleteEvent
} = require("../src/database/event.js");

describe("event model", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createEvent", () => {
        it("inserts values and returns mapped event", async () => {
            const fakeRow = {
                event_id: 123,
                chief_organiser_profile_id: 11,
                title: "My Event",
                description: "desc",
                online_location: "https://zoom",
                start_at: "2025-12-01T10:00:00Z",
                end_at: null,
                is_paid: false,
                price_amount: null,
                currency: null,
                is_broadcast: false,
                broadcast_type: null,
                is_interactive: true,
                is_anonymous: false,
                category_id: null,
                theme: null,
                attached_document_id: null,
                group_id: null,
                created_at: "2025-11-30T00:00:00Z",
                updated_at: "2025-11-30T00:00:00Z",
                is_deleted: false
            };

            pool.query.mockResolvedValueOnce({ rows: [fakeRow], rowCount: 1 });

            const data = {
                chief_organiser_profile_id: 11,
                title: "My Event",
                description: "desc",
                online_location: "https://zoom",
                start_at: "2025-12-01T10:00:00Z"
            };

            const created = await createEvent(data);

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query.mock.calls[0][0].toUpperCase()).toContain("INSERT INTO EVENTS");
            expect(created).toEqual(expect.objectContaining({
                event_id: 123,
                title: "My Event",
                chief_organiser_profile_id: 11,
                online_location: "https://zoom",
                start_at: "2025-12-01T10:00:00Z"
            }));
        });

        it("returns null when query throws", async () => {
            pool.query.mockRejectedValueOnce(new Error("db error"));

            const result = await createEvent({
                chief_organiser_profile_id: 1,
                title: "test event",
                start_at: "2025-12-01T10:00:00Z"
            });

            expect(result).toBeNull();
            expect(pool.query).toHaveBeenCalled();
        });
    });

    describe("getEventById", () => {
        it("returns mapped event when found", async () => {
            const row = { event_id: 10, title: "Found", is_deleted: false };
            pool.query.mockResolvedValueOnce({ rows: [row], rowCount: 1 });

            const res = await getEventById(10);

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [10]);
            expect(res).toEqual(expect.objectContaining({ event_id: 10, title: "Found" }));
        });

        it("returns null when not found", async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const res = await getEventById(999);
            expect(res).toBeNull();
        });

        it("returns null on DB error", async () => {
            pool.query.mockRejectedValueOnce(new Error("boom"));
            const res = await getEventById(1);
            expect(res).toBeNull();
        });
    });

    describe("listEventsByProfile", () => {
        it("returns array of mapped events", async () => {
            const rows = [
                { event_id: 1, chief_organiser_profile_id: 5, title: "A", start_at: "2025-12-01", is_deleted: false },
                { event_id: 2, chief_organiser_profile_id: 5, title: "B", start_at: "2025-12-02", is_deleted: false }
            ];
            pool.query.mockResolvedValueOnce({ rows, rowCount: 2 });

            const res = await listEventsByProfile(5);

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [5]);
            expect(Array.isArray(res)).toBe(true);
            expect(res).toHaveLength(2);
            expect(res[0]).toEqual(expect.objectContaining({ event_id: 1, title: "A" }));
        });

        it("returns empty list on DB error", async () => {
            pool.query.mockRejectedValueOnce(new Error("err"));
            const res = await listEventsByProfile(1);
            expect(res).toEqual([]);
        });
    });

    describe("updateEvent", () => {
        it("updates only provided keys and returns mapped event", async () => {
            const updatedRow = { event_id: 55, title: "new-title", is_deleted: false };
            pool.query.mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 });

            const data = { title: "new-title", is_broadcast: true };
            const res = await updateEvent(55, data);

            expect(pool.query).toHaveBeenCalledTimes(1);
            const [query, values] = pool.query.mock.calls[0];

            expect(query.toUpperCase()).toContain("UPDATE EVENTS");
            expect(values[values.length - 1]).toBe(55);
            expect(res).toEqual(expect.objectContaining({ event_id: 55, title: "new-title" }));
        });

        it("returns false if no rows updated", async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
            const res = await updateEvent(9999, { title: "x" });
            expect(res).toBe(false);
        });

        it("returns false on DB error", async () => {
            pool.query.mockRejectedValueOnce(new Error("update fail"));
            const res = await updateEvent(1, { title: "x" });
            expect(res).toBe(false);
        });

        it("returns false when data is empty", async () => {
            const res = await updateEvent(1, {});
            expect(res).toBe(false);
        });
    });

    describe("deleteEvent", () => {
        it("sets is_deleted and returns true", async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 });
            const res = await deleteEvent(77);
            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [77]);
            expect(res).toBe(true);
        });

        it("returns false on DB error", async () => {
            pool.query.mockRejectedValueOnce(new Error("delete failed"));
            const res = await deleteEvent(77);
            expect(res).toBe(false);
        });
    });
});
