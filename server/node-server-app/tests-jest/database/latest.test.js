import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the database pool
const mockQuery = jest.fn();
jest.unstable_mockModule("../../src/database/db.js", () => ({
    pool: {
        query: mockQuery
    }
}));

// Import after mocking
const { getLatestEvents, getLatestEventsForUser } = await import("../../src/database/event.js");
const { getLatestGroups, getLatestGroupsForUser } = await import("../../src/database/group.js");
const { EventModel } = await import("../../src/models/eventModel.js");
const { GroupModel } = await import("../../src/models/groupModel.js");

describe("Latest Events and Groups Database Functions", () => {
    beforeEach(() => {
        mockQuery.mockClear();
    });

    describe("getLatestEvents", () => {
        it("returns empty array when no events found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await getLatestEvents();

            expect(results).toEqual([]);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("SELECT id, title, created_at")
            );
        });

        it("returns minimal event info when events found", async () => {
            const mockRows = [
                {
                    id: 1,
                    title: "Event 1",
                    created_at: new Date("2024-01-01")
                },
                {
                    id: 2,
                    title: "Event 2",
                    created_at: new Date("2024-01-02")
                }
            ];
            mockQuery.mockResolvedValue({ rowCount: 2, rows: mockRows });

            const results = await getLatestEvents();

            expect(results).toHaveLength(2);
            expect(results[0]).toEqual({
                id: "1",
                title: "Event 1",
                createdAt: expect.any(String)
            });
            expect(results[1]).toEqual({
                id: "2",
                title: "Event 2",
                createdAt: expect.any(String)
            });
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await getLatestEvents();

            expect(results).toEqual([]);
        });

        it("limits results to 30 events", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getLatestEvents();

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("LIMIT 30")
            );
        });
    });

    describe("getLatestEventsForUser", () => {
        it("returns empty array when no events found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await getLatestEventsForUser();

            expect(results).toEqual([]);
        });

        it("returns full event models when events found", async () => {
            const mockRow = {
                id: 1,
                organiser_id: 100,
                organisers: "",
                title: "Event 1",
                description: "Test description",
                online_location: "https://meet.example.com",
                start_at: new Date("2024-01-01"),
                end_at: new Date("2024-01-02"),
                is_paid: false,
                is_broadcast: false,
                broadcast_type: "",
                tags: "",
                categories: "",
                is_interactive: true,
                is_anonymous: false,
                interested: "",
                attached_documents: "",
                group_id: 0,
                created_at: new Date(),
                modified_at: new Date(),
                is_deleted: false,
                deleted_at: null,
                is_hidden: false,
                is_archived: false
            };
            mockQuery.mockResolvedValue({ rowCount: 1, rows: [mockRow] });

            const results = await getLatestEventsForUser();

            expect(results).toHaveLength(1);
            expect(results[0]).toBeInstanceOf(EventModel);
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await getLatestEventsForUser();

            expect(results).toEqual([]);
        });
    });

    describe("getLatestGroups", () => {
        it("returns empty array when no groups found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await getLatestGroups();

            expect(results).toEqual([]);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("SELECT id, group_name, created_at")
            );
        });

        it("returns minimal group info when groups found", async () => {
            const mockRows = [
                {
                    id: 1,
                    group_name: "Group 1",
                    created_at: new Date("2024-01-01")
                },
                {
                    id: 2,
                    group_name: "Group 2",
                    created_at: new Date("2024-01-02")
                }
            ];
            mockQuery.mockResolvedValue({ rowCount: 2, rows: mockRows });

            const results = await getLatestGroups();

            expect(results).toHaveLength(2);
            expect(results[0]).toEqual({
                id: "1",
                groupName: "Group 1",
                createdAt: expect.any(String)
            });
            expect(results[1]).toEqual({
                id: "2",
                groupName: "Group 2",
                createdAt: expect.any(String)
            });
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await getLatestGroups();

            expect(results).toEqual([]);
        });

        it("limits results to 30 groups", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getLatestGroups();

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("LIMIT 30")
            );
        });
    });

    describe("getLatestGroupsForUser", () => {
        it("returns empty array when no groups found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await getLatestGroupsForUser();

            expect(results).toEqual([]);
        });

        it("returns full group models when groups found", async () => {
            const mockRow = {
                id: 1,
                user_profile_id: 100,
                group_name: "Group 1",
                description: "Test description",
                is_public: true,
                members: "",
                tags: "",
                categories: "",
                created_at: new Date(),
                modified_at: new Date(),
                is_deleted: false,
                deleted_at: null,
                is_hidden: false,
                is_archived: false
            };
            mockQuery.mockResolvedValue({ rowCount: 1, rows: [mockRow] });

            const results = await getLatestGroupsForUser();

            expect(results).toHaveLength(1);
            expect(results[0]).toBeInstanceOf(GroupModel);
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await getLatestGroupsForUser();

            expect(results).toEqual([]);
        });
    });
});
