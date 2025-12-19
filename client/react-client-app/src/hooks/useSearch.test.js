import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSearch } from "./useSearch.js";

// Mock the searchAll action
vi.mock("../actions/searchActions.js", () => ({
    searchAll: vi.fn()
}));

import { searchAll } from "../actions/searchActions.js";

describe("useSearch", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes with default state", () => {
        const { result } = renderHook(() => useSearch());

        expect(result.current.searchTerm).toBe("");
        expect(result.current.results).toEqual({
            users: [],
            events: [],
            groups: [],
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe("");
    });

    it("updates searchTerm when setSearchTerm is called", () => {
        const { result } = renderHook(() => useSearch());

        act(() => {
            result.current.setSearchTerm("test");
        });

        expect(result.current.searchTerm).toBe("test");
    });

    it("performs search and updates results on success", async () => {
        const mockResults = {
            ok: true,
            results: {
                users: [{ id: "1", name: "User 1" }],
                events: [{ id: "2", title: "Event 1" }],
                groups: [{ id: "3", name: "Group 1" }],
            }
        };
        searchAll.mockResolvedValue(mockResults);

        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch("test query");
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.results).toEqual(mockResults.results);
        expect(result.current.error).toBe("");
    });

    it("handles search errors", async () => {
        const mockError = {
            ok: false,
            message: "Search failed",
            results: { users: [], events: [], groups: [] }
        };
        searchAll.mockResolvedValue(mockError);

        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch("test");
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("Search failed");
    });

    it("clears results for empty search term", async () => {
        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch("");
        });

        expect(result.current.results).toEqual({
            users: [],
            events: [],
            groups: [],
        });
        expect(result.current.error).toBe("");
        expect(result.current.loading).toBe(false);
    });

    it("clears results for whitespace-only search term", async () => {
        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch("   ");
        });

        expect(result.current.results).toEqual({
            users: [],
            events: [],
            groups: [],
        });
        expect(result.current.loading).toBe(false);
    });

    it("handles network errors", async () => {
        searchAll.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch("test");
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("An error occurred while searching");
    });

    it("trims search term before searching", async () => {
        const mockResults = {
            ok: true,
            results: { users: [], events: [], groups: [] }
        };
        searchAll.mockResolvedValue(mockResults);

        const { result } = renderHook(() => useSearch());

        await act(async () => {
            await result.current.handleSearch("  test query  ");
        });

        await waitFor(() => {
            expect(searchAll).toHaveBeenCalledWith("test query");
        });
    });
});
