# Notifications Feature

## Overview

The notifications feature allows users to receive and manage notifications about various events and activities in the application. Notifications are displayed in an overlay that can be accessed from the top navigation bar.

## Database Schema

### Table: `user_notifications`

| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| user_profile_id | bigint | Foreign key to user_profile.id |
| type | varchar(64) | Type of notification (see types below) |
| source | varchar(128) | Source ID (profile_id, event_id, group_id, etc.) |
| message | text | Notification message text |
| created_at | timestamp | Creation timestamp |
| is_read | boolean | Whether notification has been read |
| read_at | timestamp | When notification was marked as read |
| is_deleted | boolean | Soft delete flag |
| deleted_at | timestamp | When notification was deleted |

### Notification Types

- `comment` - Comment on user's content
- `event_create` - New event created
- `event_modify` - Event modified
- `event_delete` - Event deleted
- `group_create` - New group created
- `group_modify` - Group modified
- `group_delete` - Group deleted
- `message` - Direct message
- `system` - System notification
- `other` - Other notification types

## Server API

### Endpoints

#### GET `/notification/:id`
Get a specific notification by ID.

**Response:**
```json
{
  "ok": true,
  "notification": {
    "id": "1",
    "userProfileId": "100",
    "type": "event_create",
    "source": "event_123",
    "message": "New event created",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "isRead": false,
    "readAt": "",
    "isDeleted": false,
    "deletedAt": ""
  },
  "message": "Success."
}
```

#### GET `/notifications`
Get notifications for the current user.

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 20, max: 100)
- `offset` (optional): Offset for pagination (default: 0)
- `isRead` (optional): Filter by read status (true/false)
- `days` (optional): Number of days to fetch (default: 3)

**Response:**
```json
{
  "ok": true,
  "notifications": [...],
  "message": "Success."
}
```

#### GET `/notifications/unread-count`
Get count of unread notifications for the current user.

**Response:**
```json
{
  "ok": true,
  "count": 5,
  "message": "Success."
}
```

#### PATCH `/notification/:id/read`
Mark a notification as read.

**Response:**
```json
{
  "ok": true,
  "notification": {...},
  "message": "Notification marked as read."
}
```

#### PATCH `/notifications/read-all`
Mark all notifications as read for the current user.

**Response:**
```json
{
  "ok": true,
  "message": "All notifications marked as read."
}
```

#### DELETE `/notification/:id`
Delete (soft delete) a notification.

**Response:**
```json
{
  "ok": true,
  "message": "Notification deleted successfully."
}
```

## Client Implementation

### Components

#### `Notifications.jsx`
Main notification overlay component that displays notifications in a modal.

**Features:**
- Filter notifications by status (unread/read/all)
- Mark individual notifications as read
- Mark all notifications as read
- Delete individual notifications
- Load more notifications (pagination)
- Auto-refresh when overlay is closed

#### `Menu.jsx`
Updated to include notification icon with unread count badge.

**Features:**
- Bell icon (🔔) in the navigation bar
- Badge showing unread notification count
- Opens notification overlay on click
- Polls for unread count every 30 seconds

### Network Layer

Location: `client/react-client-app/src/net/notification.js`

Functions:
- `fetchNotification(notificationId)` - Get a single notification
- `fetchNotifications(options)` - Get list of notifications
- `fetchUnreadNotificationCount()` - Get unread count
- `markNotificationAsRead(notificationId)` - Mark as read
- `markAllNotificationsAsRead()` - Mark all as read
- `deleteNotification(notificationId)` - Delete notification

### Actions Layer

Location: `client/react-client-app/src/actions/notificationActions.js`

Provides action functions that wrap the network layer.

## Usage Example

### Creating a Notification (Server-side)

```javascript
import { createNotification } from "../database/notification.js";

// Create a notification when an event is created
await createNotification({
    userProfileId: recipientProfileId,
    type: "event_create",
    source: `event_${eventId}`,
    message: `New event "${eventTitle}" has been created`
});
```

### Displaying Notifications (Client-side)

Notifications are automatically displayed when the user clicks the notification icon in the top navigation bar. The `Notifications` component handles all the UI and interactions.

## Styling

Notification styles are defined in `client/react-client-app/src/index.css`:

- `.notification-icon` - Bell icon styling
- `.notification-badge` - Unread count badge
- `.notification-filters` - Filter buttons
- `.notification-list` - List container
- `.notification-item` - Individual notification
- `.notification-item.unread` - Unread notification styling
- `.notification-item.read` - Read notification styling

## Testing

### Server Tests

Location: `server/node-server-app/tests-jest/models/notificationModel.test.js`

- Model creation and validation
- Database row parsing
- Key mapping (camelCase ↔ snake_case)

### Client Tests

Location: `client/react-client-app/src/actions/notificationActions.test.js`

- Action layer functionality
- Network layer integration

## Performance Considerations

1. **Polling Interval**: Unread count is polled every 30 seconds. Adjust this based on requirements.
2. **Pagination**: Default limit is 20 notifications per request.
3. **Time Filter**: By default, only notifications from the last 3 days are fetched.
4. **Indexes**: Database indexes on `user_profile_id`, `is_read`, `is_deleted`, and `created_at` ensure fast queries.

## Future Enhancements

- Real-time notifications using WebSockets
- Push notifications
- Email notifications
- Notification preferences per type
- Rich notification content with actions
- Notification grouping
