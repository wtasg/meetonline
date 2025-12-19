# Batch Deletion System

## Overview

The batch deletion system provides a soft delete mechanism with automatic permanent deletion after a configurable retention period (default: 90 days). This gives users the ability to recover accidentally deleted items within the retention window.

## Architecture

### Database Schema

#### Updated Tables

The following tables have been updated to support batch deletion:

- `event` - Added `deleted_at` timestamp column
- `group` - Added `deleted_at` timestamp column
- `user_account` - Added `deleted_at` timestamp column
- `user_profile` - Added `is_deleted` and `deleted_at` columns

#### New Table: `pending_deletions`

Tracks items scheduled for permanent deletion:

```sql
CREATE TABLE pending_deletions (
    id                      bigserial PRIMARY KEY,
    entity_type             varchar(64) NOT NULL,  -- 'event', 'group', 'user_account', 'user_profile'
    entity_id               bigint NOT NULL,
    user_profile_id         bigint NOT NULL,
    scheduled_deletion_at   timestamp NOT NULL,    -- When hard delete should occur
    created_at              timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_processed            boolean DEFAULT false NOT NULL,
    processed_at            timestamp
);
```

### Components

#### 1. Database Functions

**Soft Delete Functions** (`/server/node-server-app/src/database/`)

- `deleteEvent()` - Soft deletes an event
- `deleteGroup()` - Soft deletes a group
- `deleteUserAccount()` - Soft deletes a user account
- `deleteUserProfile()` - Soft deletes a user profile

**Hard Delete Functions**

- `hardDeleteEvent()` - Permanently deletes an event
- `hardDeleteGroup()` - Permanently deletes a group
- `hardDeleteUserAccount()` - Permanently deletes a user account
- `hardDeleteUserProfile()` - Permanently deletes a user profile

**Pending Deletion Functions** (`/server/node-server-app/src/database/pending_deletions.js`)

- `createPendingDeletion()` - Creates a pending deletion record
- `getDuePendingDeletions()` - Retrieves deletions scheduled for today or earlier
- `markPendingDeletionAsProcessed()` - Marks a deletion as completed
- `cancelPendingDeletion()` - Cancels a pending deletion (for restore functionality)
- `getPendingDeletionsByUserProfileId()` - Gets pending deletions for a user

#### 2. Batch Processing

**Batch Deletion Processor** (`/server/node-server-app/src/utils/batchDeletion.js`)

- `processPendingDeletions()` - Processes all due deletions
- `startBatchDeletionProcessor(intervalMs)` - Starts periodic batch processing

The batch processor:

1. Runs automatically on server startup
2. Runs periodically (default: every 24 hours)
3. Hard deletes items that have exceeded the retention period
4. Sends notifications to users about permanent deletions

#### 3. API Handler Updates

**Event Handler** (`/server/node-server-app/src/handlers/eventHandler.js`)

- DELETE `/event/:id` - Soft deletes event, creates pending deletion, notifies user

**Group Handler** (`/server/node-server-app/src/handlers/groupHandler.js`)

- DELETE `/group/:id` - Soft deletes group, creates pending deletion, notifies user

## User Flow

### Deletion Flow

1. User requests deletion of an item (e.g., event, group)
2. System performs soft delete:
   - Sets `is_deleted = true`
   - Sets `deleted_at = CURRENT_TIMESTAMP`
3. System creates pending deletion record:
   - Entity type and ID
   - User profile ID
   - Scheduled deletion date (90 days from now)
4. System sends notification to user:
   - "Your [item] has been moved to trash. It will be permanently deleted in 90 days."

### Automatic Permanent Deletion

1. Batch processor runs daily
2. Checks for items with `scheduled_deletion_at <= CURRENT_TIMESTAMP`
3. For each due deletion:
   - Performs hard delete (removes from database permanently)
   - Marks pending deletion as processed
   - Sends notification: "Your [item] has been permanently deleted as scheduled."

### Future: Restore Flow (Not Yet Implemented)

Users would be able to restore soft-deleted items:

1. View deleted items in trash
2. Select item to restore
3. System:
   - Sets `is_deleted = false`
   - Sets `deleted_at = NULL`
   - Cancels pending deletion record
   - Sends notification: "Your [item] has been restored."

## Configuration

### Retention Period

The default retention period is 90 days, as required by data retention laws. This can be customized per deletion:

```javascript
await createPendingDeletion({
    entityType: "event",
    entityId: "123",
    userProfileId: "456",
    daysUntilDeletion: 90  // Customizable
});
```

### Batch Processing Interval

The batch processor runs every 24 hours by default. This can be configured in `server.js`:

```javascript
// Run daily (86400000 ms = 24 hours)
startBatchDeletionProcessor(24 * 60 * 60 * 1000);

// Or run hourly for testing
startBatchDeletionProcessor(60 * 60 * 1000);
```

## Deployment Considerations

### Production Setup

For production environments, consider:

1. **Dedicated Cron Job**: Instead of running the batch processor in the application, use a dedicated cron job or scheduled task to call the batch processor endpoint.
2. **Monitoring**: Add monitoring for:
   - Number of items processed
   - Processing failures
   - Processing time
3. **Error Handling**: The batch processor logs errors but continues processing. Monitor logs for issues.
4. **Database Indexes**: The schema includes indexes on `deleted_at` columns for efficient querying.

### Manual Processing

To manually trigger batch deletion processing:

```javascript
import { processPendingDeletions } from "./src/utils/batchDeletion.js";

const result = await processPendingDeletions();
console.log(`Processed: ${result.processed}, Failed: ${result.failed}`);
```

## Notifications

The system integrates with the existing notification system:

### Soft Delete Notification

- **Type**: `event_delete` or `group_delete`
- **Message**: "Your [name] has been moved to trash. It will be permanently deleted in 90 days."

### Hard Delete Notification

- **Type**: `system`
- **Message**: "Your [type] has been permanently deleted as scheduled."

## Security Considerations

1. **Authorization**: Deletion handlers verify user ownership before allowing deletion
2. **Audit Trail**: The `pending_deletions` table maintains a record of all deletions
3. **Data Recovery**: Within the retention period, data can be recovered (restore functionality to be implemented)
4. **Legal Compliance**: 90-day retention period complies with common data retention requirements

## Testing

### Manual Testing

1. Create a test item (event, group)
2. Delete the item
3. Verify:
   - Item is soft deleted (`is_deleted = true`)
   - `deleted_at` timestamp is set
   - Pending deletion record created
   - User receives notification
4. Manually run batch processor or wait for scheduled run
5. Verify permanent deletion and notification

### Database Queries

Check pending deletions:

```sql
SELECT * FROM pending_deletions WHERE is_processed = false;
```

Check soft-deleted items:

```sql
SELECT id, title, is_deleted, deleted_at FROM event WHERE is_deleted = true;
```

## Future Enhancements

1. **Restore Functionality**: Allow users to restore deleted items within retention period
2. **Admin Dashboard**: View all pending deletions across the system
3. **Configurable Retention**: Allow per-user or per-organization retention policies
4. **Bulk Operations**: Batch delete multiple items at once
5. **Export Before Delete**: Automatically export user data before permanent deletion
6. **Notification Preferences**: Allow users to opt-out of deletion notifications

## API Reference

### Pending Deletions

#### Create Pending Deletion

```javascript
createPendingDeletion({
    entityType: "event",      // Required: event, group, user_account, user_profile
    entityId: "123",          // Required: ID of the entity
    userProfileId: "456",     // Required: User who initiated deletion
    daysUntilDeletion: 90     // Optional: Days until deletion (default: 90)
})
```

#### Get Due Deletions

```javascript
const deletions = await getDuePendingDeletions();
// Returns array of deletion records due for processing
```

#### Cancel Pending Deletion

```javascript
const success = await cancelPendingDeletion("event", "123");
// Used for restore functionality
```

## Troubleshooting

### Batch processor not running

1. Check server logs for startup errors
2. Verify database connectivity
3. Check for exceptions in batch processor initialization

### Items not being deleted

1. Check `pending_deletions` table for records
2. Verify `scheduled_deletion_at` is in the past
3. Check batch processor logs
4. Run processor manually to test

### Performance issues

1. Check database indexes on `deleted_at` columns
2. Monitor batch processor execution time
3. Consider running processor during off-peak hours
4. Implement pagination for large deletion batches
