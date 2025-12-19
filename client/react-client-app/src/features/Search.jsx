import { useSearch } from "../hooks/useSearch.js";

/**
 * Search component with client-side throttling
 */
function Search() {
    const { searchTerm, results, loading, error, handleSearch, setSearchTerm } = useSearch();

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearch(value);
    };

    return (
        <div className="search-container">
            <h2>Search</h2>
            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Search for users, events, or groups..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="search-input"
                />
                {loading && <span className="search-loading">Searching...</span>}
            </div>

            {error && <div className="search-error">{error}</div>}

            {searchTerm && (
                <div className="search-results">
                    {/* Users Results */}
                    {results.users.length > 0 && (
                        <div className="search-section">
                            <h3>Users ({results.users.length})</h3>
                            <ul className="search-list">
                                {results.users.map((user) => (
                                    <li key={user.id} className="search-item">
                                        <div className="search-item-title">
                                            {user.profileName || user.displayName}
                                        </div>
                                        <div className="search-item-meta">
                                            Display Name: {user.displayName}
                                            {user.email && ` • ${user.email}`}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Events Results */}
                    {results.events.length > 0 && (
                        <div className="search-section">
                            <h3>Events ({results.events.length})</h3>
                            <ul className="search-list">
                                {results.events.map((event) => (
                                    <li key={event.id} className="search-item">
                                        <div className="search-item-title">{event.title}</div>
                                        <div className="search-item-meta">
                                            {new Date(event.startAt).toLocaleDateString()}
                                            {event.description && (
                                                <div className="search-item-description">
                                                    {event.description.substring(0, 150)}
                                                    {event.description.length > 150 ? "..." : ""}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Groups Results */}
                    {results.groups.length > 0 && (
                        <div className="search-section">
                            <h3>Groups ({results.groups.length})</h3>
                            <ul className="search-list">
                                {results.groups.map((group) => (
                                    <li key={group.id} className="search-item">
                                        <div className="search-item-title">{group.groupName}</div>
                                        <div className="search-item-meta">
                                            {group.description && (
                                                <div className="search-item-description">
                                                    {group.description.substring(0, 150)}
                                                    {group.description.length > 150 ? "..." : ""}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* No Results */}
                    {results.users.length === 0 &&
                        results.events.length === 0 &&
                        results.groups.length === 0 &&
                        !loading &&
                        !error && (
                        <div className="search-no-results">
                            No results found for &quot;{searchTerm}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Search;
