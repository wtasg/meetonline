# Search Feature Documentation

## Overview

The search feature allows users to search across multiple entity types in the meetonline platform:
- **User Profiles**: Search by profile name or ID
- **Events**: Search by title, description, tags, categories, or ID
- **Groups**: Search by name, description, tags, categories, or ID

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

#### Handler Layer (`/server/node-server-app/src/handlers/searchHandler.js`)

- Validates search term
- Parses entity types filter
- Calls database search functions
- Converts results to client format

### Frontend (Client)

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
- Only public groups are searchable
- Hidden and deleted entities are excluded from results
- User profiles must have a non-empty profile_name to appear in search results

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

Unit tests are located in `/server/node-server-app/tests-jest/database/search.test.js`

Run tests:
```bash
cd server/node-server-app
npm test tests-jest/database/search.test.js
```

## Future Enhancements

Potential improvements for the search feature:
1. Add full-text search with ranking
2. Search comments (when comment feature is implemented)
3. Add autocomplete/suggestions
4. Add search filters (date range, tags, categories)
5. Add search history
6. Implement search analytics
7. Add fuzzy matching for typos
8. Add search result highlighting
