import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the database pool
const mockQuery = jest.fn();
jest.unstable_mockModule("../../src/database/db.js", () => ({
    pool: {
        query: mockQuery
    }
}));

// Import after mocking
const { searchUserProfiles, searchEvents, searchGroups, searchAll } = await import("../../src/database/search.js");
const { UserProfileModel } = await import("../../src/models/userProfileModel.js");
const { EventModel } = await import("../../src/models/eventModel.js");
const { GroupModel } = await import("../../src/models/groupModel.js");

describe("Search Database Functions", () => {
    beforeEach(() => {
        mockQuery.mockClear();
    });

    describe("searchUserProfiles", () => {
        it("returns empty array when no results found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await searchUserProfiles("test");

            expect(results).toEqual([]);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM public.user_profile"),
                expect.arrayContaining(["%test%", "test"])
            );
        });

        it("returns user profiles when results found", async () => {
            const mockRow = {
                id: "1",
                user_id: "100",
                profile_name: "testuser",
                display_name: "Test User",
                phone_number: "",
                email: "test@example.com",
                address: "",
                website_url: "",
                created_at: new Date(),
                modified_at: new Date(),
            };
            mockQuery.mockResolvedValue({ rowCount: 1, rows: [mockRow] });

            const results = await searchUserProfiles("test");

            expect(results).toHaveLength(1);
            expect(results[0]).toBeInstanceOf(UserProfileModel);
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await searchUserProfiles("test");

            expect(results).toEqual([]);
        });

        it("applies limit and offset parameters", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await searchUserProfiles("test", { limit: 10, offset: 5 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining(["%test%", "test", 10, 5])
            );
        });
    });

    describe("searchEvents", () => {
        it("returns empty array when no results found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await searchEvents("test");

            expect(results).toEqual([]);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM public.event"),
                expect.arrayContaining(["%test%", "test"])
            );
        });

        it("returns events when results found", async () => {
            const mockRow = {
                id: "1",
                organiser_id: "100",
                organisers: "",
                title: "Test Event",
                description: "Test Description",
                online_location: "",
                start_at: new Date(),
                end_at: new Date(),
                is_paid: false,
                is_broadcast: false,
                broadcast_type: null,
                tags: "",
                categories: "",
                is_interactive: true,
                is_anonymous: false,
                interested: "",
                attached_documents: "",
                group_id: null,
                created_at: new Date(),
                modified_at: new Date(),
                is_deleted: false,
                is_hidden: false,
                is_archived: false,
            };
            mockQuery.mockResolvedValue({ rowCount: 1, rows: [mockRow] });

            const results = await searchEvents("test");

            expect(results).toHaveLength(1);
            expect(results[0]).toBeInstanceOf(EventModel);
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await searchEvents("test");

            expect(results).toEqual([]);
        });
    });

    describe("searchGroups", () => {
        it("returns empty array when no results found", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await searchGroups("test");

            expect(results).toEqual([]);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM public.\"group\""),
                expect.arrayContaining(["%test%", "test"])
            );
        });

        it("returns groups when results found", async () => {
            const mockRow = {
                id: "1",
                user_profile_id: "100",
                group_name: "Test Group",
                description: "Test Description",
                is_public: true,
                members: "",
                tags: "",
                categories: "",
                created_at: new Date(),
                modified_at: new Date(),
                is_deleted: false,
                is_hidden: false,
                is_archived: false,
            };
            mockQuery.mockResolvedValue({ rowCount: 1, rows: [mockRow] });

            const results = await searchGroups("test");

            expect(results).toHaveLength(1);
            expect(results[0]).toBeInstanceOf(GroupModel);
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await searchGroups("test");

            expect(results).toEqual([]);
        });
    });

    describe("searchAll", () => {
        it("searches all entity types by default", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await searchAll("test");

            expect(results).toHaveProperty("users");
            expect(results).toHaveProperty("events");
            expect(results).toHaveProperty("groups");
            expect(mockQuery).toHaveBeenCalledTimes(3);
        });

        it("searches only specified types", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const results = await searchAll("test", { types: ["users", "events"] });

            expect(results.users).toEqual([]);
            expect(results.events).toEqual([]);
            expect(results.groups).toEqual([]);
            expect(mockQuery).toHaveBeenCalledTimes(2);
        });

        it("handles errors and returns empty results", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const results = await searchAll("test");

            expect(results).toEqual({
                users: [],
                events: [],
                groups: [],
            });
        });
    });
});
