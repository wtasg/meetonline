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
        <div className="container p-3">
            <h2>Search</h2>
            <div className="form-group mb-3">
                <input
                    type="text"
                    placeholder="Search for users, events, or groups..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="form-input"
                />
                {loading && <span className="text-muted">Searching...</span>}
            </div>

            {error && <div className="message message--error">{error}</div>}

            {searchTerm && (
                <div className="vflex gap-4">
                    {/* Users Results */}
                    {results.users.length > 0 && (
                        <div className="vflex gap-2">
                            <h3>Users ({results.users.length})</h3>
                            <div className="vflex gap-2">
                                {results.users.map((user) => (
                                    <div key={user.id} className="card">
                                        <div className="list-item__title">
                                            {user.profileName || user.displayName}
                                        </div>
                                        <div className="list-item__meta">
                                            Display Name: {user.displayName}
                                            {user.email && ` • ${user.email}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Events Results */}
                    {results.events.length > 0 && (
                        <div className="vflex gap-2">
                            <h3>Events ({results.events.length})</h3>
                            <div className="vflex gap-2">
                                {results.events.map((event) => (
                                    <div key={event.id} className="card">
                                        <div className="list-item__title">{event.title}</div>
                                        <div className="list-item__meta">
                                            {new Date(event.startAt).toLocaleDateString()}
                                        </div>
                                        {event.description && (
                                            <div className="text-muted mt-1">
                                                {event.description.substring(0, 150)}
                                                {event.description.length > 150 ? "..." : ""}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Groups Results */}
                    {results.groups.length > 0 && (
                        <div className="vflex gap-2">
                            <h3>Groups ({results.groups.length})</h3>
                            <div className="vflex gap-2">
                                {results.groups.map((group) => (
                                    <div key={group.id} className="card">
                                        <div className="list-item__title">{group.groupName}</div>
                                        {group.description && (
                                            <div className="text-muted mt-1">
                                                {group.description.substring(0, 150)}
                                                {group.description.length > 150 ? "..." : ""}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {results.users.length === 0 &&
                        results.events.length === 0 &&
                        results.groups.length === 0 &&
                        !loading &&
                        !error && (
                            <div className="text-center text-muted p-4">
                                No results found for &quot;{searchTerm}&quot;
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}

export default Search;
