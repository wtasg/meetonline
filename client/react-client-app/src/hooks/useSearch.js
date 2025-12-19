import { useState, useCallback } from "react";
import { searchAll } from "../actions/searchActions.js";
import { useThrottle } from "./useThrottle.js";

/**
 * Hook to handle search functionality with throttling
 * @param {number} throttleDelay - Delay in milliseconds for throttling (default: 500ms)
 * @returns {{
 *   searchTerm: string,
 *   results: {users: array, events: array, groups: array},
 *   loading: boolean,
 *   error: string,
 *   handleSearch: function,
 *   setSearchTerm: function
 * }}
 * 
 * @example
 * const { searchTerm, results, loading, error, handleSearch, setSearchTerm } = useSearch();
 * 
 * // In input onChange
 * const handleChange = (e) => {
 *   setSearchTerm(e.target.value);
 *   handleSearch(e.target.value);
 * };
 */
function useSearch(throttleDelay = 500) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState({
        users: [],
        events: [],
        groups: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const performSearch = useCallback(async (term) => {
        if (!term || !term.trim()) {
            setResults({ users: [], events: [], groups: [] });
            setError("");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await searchAll(term.trim());
            if (response.ok) {
                setResults(response.results);
            } else {
                setError(response.message || "Search failed");
            }
        } catch (err) {
            setError("An error occurred while searching");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = useThrottle(performSearch, throttleDelay);

    return {
        searchTerm,
        results,
        loading,
        error,
        handleSearch,
        setSearchTerm,
    };
}

export { useSearch };
