import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the database pool
const mockQuery = jest.fn();
jest.unstable_mockModule("../../src/database/db.js", () => ({
    pool: {
        query: mockQuery
    }
}));

// Import after mocking
const { listEventsByOrganiserId } = await import("../../src/database/event.js");

describe("listEventsByOrganiserId", () => {
    beforeEach(() => {
        mockQuery.mockClear();
        // Default response
        mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });
    });

    it("uses default sort order when no options provided", async () => {
        await listEventsByOrganiserId("org123");

        expect(mockQuery).toHaveBeenCalledTimes(1);
        const [query, values] = mockQuery.mock.calls[0];

        // Check default order clause
        expect(query).toContain("ORDER BY start_at DESC");
        expect(values).toEqual(["org123", 20, 0]);
    });

    it("uses specified valid sort key and direction", async () => {
        await listEventsByOrganiserId("org123", {
            orderKey: "created_at",
            orderBy: "ASC"
        });

        const [query] = mockQuery.mock.calls[0];
        expect(query).toContain("ORDER BY created_at ASC");
    });

    it("sanitizes invalid sort key to default", async () => {
        await listEventsByOrganiserId("org123", {
            orderKey: "DROP TABLE events;",
            orderBy: "ASC"
        });

        const [query] = mockQuery.mock.calls[0];
        expect(query).toContain("ORDER BY start_at ASC");
    });

    it("sanitizes invalid direction to default", async () => {
        await listEventsByOrganiserId("org123", {
            orderKey: "end_at",
            orderBy: "SIDEWAYS"
        });

        const [query] = mockQuery.mock.calls[0];
        expect(query).toContain("ORDER BY end_at DESC");
    });

    it("handles null/undefined options safely", async () => {
        await listEventsByOrganiserId("org123", {
            orderKey: null,
            orderBy: undefined
        });

        const [query] = mockQuery.mock.calls[0];
        expect(query).toContain("ORDER BY start_at DESC");
    });
});
