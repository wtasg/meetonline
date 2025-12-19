import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the database pool
const mockQuery = jest.fn();
jest.unstable_mockModule("../../src/database/db.js", () => ({
    pool: {
        query: mockQuery
    }
}));

// Import after mocking
const { logSearchQuery, getUserSearchHistory, getPopularSearchTerms } = await import("../../src/database/search_queries.js");

describe("Search Queries Database Functions", () => {
    beforeEach(() => {
        mockQuery.mockClear();
    });

    describe("logSearchQuery", () => {
        it("successfully logs a search query", async () => {
            mockQuery.mockResolvedValue({ rowCount: 1, rows: [{ id: "1" }] });

            const result = await logSearchQuery(
                "123",
                "test search",
                ["users", "events"],
                5
            );

            expect(result).toBe(true);
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO public.search_queries"),
                ["123", "test search", "users,events", 5]
            );
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const result = await logSearchQuery("123", "test", ["users"], 0);

            expect(result).toBe(false);
        });

        it("returns false when no rows inserted", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            const result = await logSearchQuery("123", "test", ["users"], 0);

            expect(result).toBe(false);
        });
    });

    describe("getUserSearchHistory", () => {
        it("returns user search history", async () => {
            const mockRows = [
                {
                    id: "1",
                    search_term: "test query",
                    search_types: "users,events",
                    results_count: 5,
                    created_at: new Date("2024-01-01"),
                },
                {
                    id: "2",
                    search_term: "another search",
                    search_types: "groups",
                    results_count: 3,
                    created_at: new Date("2024-01-02"),
                }
            ];
            mockQuery.mockResolvedValue({ rowCount: 2, rows: mockRows });

            const result = await getUserSearchHistory("123");

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: "1",
                searchTerm: "test query",
                searchTypes: ["users", "events"],
                resultsCount: 5,
                createdAt: new Date("2024-01-01"),
            });
            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("SELECT"),
                ["123", 50]
            );
        });

        it("handles empty search types", async () => {
            const mockRows = [{
                id: "1",
                search_term: "test",
                search_types: null,
                results_count: 0,
                created_at: new Date(),
            }];
            mockQuery.mockResolvedValue({ rowCount: 1, rows: mockRows });

            const result = await getUserSearchHistory("123");

            expect(result[0].searchTypes).toEqual([]);
        });

        it("respects limit parameter", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getUserSearchHistory("123", { limit: 10 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ["123", 10]
            );
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const result = await getUserSearchHistory("123");

            expect(result).toEqual([]);
        });

        it("enforces maximum limit", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getUserSearchHistory("123", { limit: 200 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ["123", 100]
            );
        });
    });

    describe("getPopularSearchTerms", () => {
        it("returns popular search terms", async () => {
            const mockRows = [
                {
                    search_term: "popular query",
                    search_count: "10",
                    total_results: "50",
                },
                {
                    search_term: "another query",
                    search_count: "5",
                    total_results: "25",
                }
            ];
            mockQuery.mockResolvedValue({ rowCount: 2, rows: mockRows });

            const result = await getPopularSearchTerms();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                searchTerm: "popular query",
                searchCount: 10,
                totalResults: 50,
            });
        });

        it("respects limit parameter", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getPopularSearchTerms({ limit: 5 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("LIMIT $1"),
                [5, "7"]
            );
        });

        it("handles database errors gracefully", async () => {
            mockQuery.mockRejectedValue(new Error("Database error"));

            const result = await getPopularSearchTerms();

            expect(result).toEqual([]);
        });

        it("enforces maximum limit", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getPopularSearchTerms({ limit: 100 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                [50, "7"]
            );
        });

        it("includes days parameter in query", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getPopularSearchTerms({ days: 14 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("INTERVAL"),
                [10, "14"]
            );
        });

        it("enforces maximum days", async () => {
            mockQuery.mockResolvedValue({ rowCount: 0, rows: [] });

            await getPopularSearchTerms({ days: 60 });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining("INTERVAL"),
                [10, "30"]
            );
        });
    });
});
