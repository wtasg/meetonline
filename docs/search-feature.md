# Search Feature Documentation

## Overview

The search feature allows users to search across multiple entity types in the meetonline platform:

- **User Profiles**: Search by profile name or ID
- **Events**: Search by title, description, tags, categories, or ID
- **Groups**: Search by name, description, tags, categories, or ID

The feature includes:

- Real-time search with client-side throttling
- Server-side rate limiting
- Search query logging and analytics
- Reusable React hooks for search functionality

## API Endpoint

### GET /search

Unified search endpoint that returns results from all entity types.

**Authentication**: Required (via JWT or session cookies)

**Query Parameters**:

- `q` (required): Search term
- `types` (optional): Comma-separated list of entity types to search. Options: `users`, `events`, `groups`. Default: all types
- `limit` (optional): Maximum results per type. Default: 20, Max: 100
- `offset` (optional): Pagination offset. Default: 0

**Example Request**:

```bash
GET /search?q=conference&types=events,groups&limit=10
```

**Response Format**:

```json
{
    "ok": true,
    "results": {
        "users": [...],
        "events": [...],
        "groups": [...]
    },
    "message": "Success."
}
```

**Search Query Logging**:
All search queries are automatically logged to the `search_queries` table with:

- User ID
- Search term
- Search types
- Results count
- Timestamp

## Implementation Details

### Backend (Server)

#### Database Layer (`/server/node-server-app/src/database/search.js`)

Functions:

- `searchUserProfiles(searchTerm, options)`: Search user profiles
- `searchEvents(searchTerm, options)`: Search events
- `searchGroups(searchTerm, options)`: Search groups
- `searchAll(searchTerm, options)`: Unified search across all types

All search functions:

- Use parameterized queries to prevent SQL injection
- Support pagination via `limit` and `offset`
- Filter out deleted/hidden entities
- Use case-insensitive ILIKE matching

#### Search Query Logging (`/server/node-server-app/src/database/search_queries.js`)

Functions:

- `logSearchQuery(userId, searchTerm, searchTypes, resultsCount)`: Log a search query
- `getUserSearchHistory(userId, options)`: Get user's search history
- `getPopularSearchTerms(options)`: Get trending search terms

Database Table: `search_queries`

- Stores: user_id, search_term, search_types, results_count, created_at
- Indexed on: user_id, search_term, created_at

#### Handler Layer (`/server/node-server-app/src/handlers/searchHandler.js`)

- Validates search term
- Parses entity types filter
- Calls database search functions
- Converts results to client format
- Logs query asynchronously (non-blocking)

### Frontend (Client)

#### React Hooks

**useThrottle** (`/client/react-client-app/src/hooks/useThrottle.js`)

```javascript
const throttledFunction = useThrottle(callback, delay);
```

- Generic throttling hook for any function
- Prevents excessive calls
- Supports async callbacks
- Configurable delay

**useSearch** (`/client/react-client-app/src/hooks/useSearch.js`)

```javascript
const { searchTerm, results, loading, error, handleSearch, setSearchTerm } = useSearch();
```

- Complete search state management
- Built-in throttling (default 500ms)
- Loading and error states
- Automatic result updates

#### Network Layer (`/client/react-client-app/src/net/search.js`)

Functions:

- `searchAll(searchTerm, options)`: Search all types (throttled)
- `searchUsers(searchTerm, options)`: Search users only (throttled)
- `searchEvents(searchTerm, options)`: Search events only (throttled)
- `searchGroups(searchTerm, options)`: Search groups only (throttled)

**Throttling**: All search functions are throttled with a 500ms delay to prevent excessive API calls.

#### Actions Layer (`/client/react-client-app/src/actions/searchActions.js`)

Provides simple wrappers around network functions for use in components.

#### UI Component (`/client/react-client-app/src/features/Search.jsx`)

React component that provides:

- Search input field
- Real-time search as user types (with throttling)
- Categorized results display
- Loading and error states

## Security & Privacy

- All searches require authentication
- Rate limiting: 30 requests per minute per IP address
- Client-side throttling: 500ms delay between requests
- Only public groups are searchable
- Hidden and deleted entities are excluded from results
- User profiles must have a non-empty profile_name to appear in search results
- Parameterized SQL queries prevent SQL injection attacks

## Search Criteria

### User Profiles

- Profile name (case-insensitive partial match)
- Profile ID (exact match)
- Excludes profiles with empty/null profile names

### Events

- Title (case-insensitive partial match)
- Description (case-insensitive partial match)
- Tags (case-insensitive partial match)
- Categories (case-insensitive partial match)
- Event ID (exact match)
- Excludes hidden and deleted events

### Groups

- Group name (case-insensitive partial match)
- Description (case-insensitive partial match)
- Tags (case-insensitive partial match)
- Categories (case-insensitive partial match)
- Group ID (exact match)
- Only public groups are included
- Excludes hidden and deleted groups

## Testing

### Server Tests

**Database Functions** (`tests-jest/database/search.test.js`)

- 13 tests for search functions
- Mocked database pool
- Tests all search functions and error handling

**Search Query Logging** (`tests-jest/database/search_queries.test.js`)

- 14 tests for query logging functions
- Tests logSearchQuery, getUserSearchHistory, getPopularSearchTerms
- Validates data sanitization and limits

### Client Tests

**useThrottle Hook** (`src/hooks/useThrottle.test.js`)

- 5 tests for throttling behavior
- Tests immediate calls, delayed calls, async callbacks
- Uses React Testing Library

**useSearch Hook** (`src/hooks/useSearch.test.js`)

- 8 tests for search state management
- Tests loading states, error handling, result updates
- Mocked search actions

Run tests:

```bash
# Server tests
cd server/node-server-app
npm test

# Client tests
cd client/react-client-app
npm test -- --run
```

**Total Test Coverage**: 40 tests passing

## Analytics & Insights

The search feature includes built-in analytics:

### Search History

Get a user's search history:

```javascript
const history = await getUserSearchHistory(userId, { limit: 50 });
// Returns: [{ id, searchTerm, searchTypes, resultsCount, createdAt }]
```

### Popular Search Terms

Get trending searches:

```javascript
const popular = await getPopularSearchTerms({ limit: 10, days: 7 });
// Returns: [{ searchTerm, searchCount, totalResults }]
```

## Usage Examples

### Using useSearch Hook

```javascript
import { useSearch } from "../hooks/useSearch.js";

function SearchComponent() {
    const { searchTerm, results, loading, error, handleSearch, setSearchTerm } = useSearch();

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        handleSearch(e.target.value); // Automatically throttled
    };

    return (
        <div>
            <input value={searchTerm} onChange={handleInputChange} />
            {loading && <p>Searching...</p>}
            {error && <p>Error: {error}</p>}
            {/* Display results */}
        </div>
    );
}
```

### Using useThrottle Hook

```javascript
import { useThrottle } from "../hooks/useThrottle.js";

function Component() {
    const handleAction = useCallback(async (data) => {
        // Expensive operation
        await saveData(data);
    }, []);

    const throttledAction = useThrottle(handleAction, 1000);

    return <button onClick={() => throttledAction(data)}>Save</button>;
}
```

## Future Enhancements

Potential improvements for the search feature:

1. Add full-text search with ranking
2. Search comments (when comment feature is implemented)
3. Add autocomplete/suggestions based on popular searches
4. Add advanced search filters (date range, tags, categories)
5. ~~Add search history~~ ✅ Implemented
6. ~~Implement search analytics~~ ✅ Implemented
7. Add fuzzy matching for typos
8. Add search result highlighting
9. Add search suggestions based on user's previous searches
10. Implement search result caching
