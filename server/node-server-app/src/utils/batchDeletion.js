import { getDuePendingDeletions, markPendingDeletionAsProcessed } from "../database/pending_deletions.js";
import { hardDeleteEvent } from "../database/event.js";
import { hardDeleteGroup } from "../database/group.js";
import { hardDeleteUserAccount } from "../database/user_account.js";
import { hardDeleteUserProfile } from "../database/user_profile.js";
import { createNotification } from "../database/notification.js";

/**
 * Process pending deletions that are due for hard deletion
 * This should be called periodically (e.g., daily via cron)
 * @returns {Promise<{processed: number, failed: number}>}
 */
async function processPendingDeletions() {
    try {
        const dueDeletions = await getDuePendingDeletions();
        
        console.log(`Processing ${dueDeletions.length} pending deletions...`);
        
        let processed = 0;
        let failed = 0;

        for (const deletion of dueDeletions) {
            try {
                const { id, entity_type, entity_id, user_profile_id } = deletion;
                
                let deleteSuccess = false;
                let entityName = "item";

                // Perform hard delete based on entity type
                switch (entity_type) {
                    case "event":
                        deleteSuccess = await hardDeleteEvent(entity_id);
                        entityName = "event";
                        break;
                    case "group":
                        deleteSuccess = await hardDeleteGroup(entity_id);
                        entityName = "group";
                        break;
                    case "user_account":
                        deleteSuccess = await hardDeleteUserAccount(entity_id);
                        entityName = "account";
                        break;
                    case "user_profile":
                        deleteSuccess = await hardDeleteUserProfile(entity_id);
                        entityName = "profile";
                        break;
                    default:
                        console.error(`Unknown entity type: ${entity_type}`);
                        failed++;
                        continue;
                }

                if (deleteSuccess) {
                    // Mark pending deletion as processed
                    await markPendingDeletionAsProcessed(id);
                    
                    // Notify user that the item has been permanently deleted
                    await createNotification({
                        userProfileId: user_profile_id,
                        type: "system",
                        source: entity_id,
                        message: `Your ${entityName} has been permanently deleted as scheduled.`
                    });
                    
                    processed++;
                    console.log(`Successfully deleted ${entity_type} with ID ${entity_id}`);
                } else {
                    console.error(`Failed to delete ${entity_type} with ID ${entity_id}`);
                    failed++;
                }
            } catch (err) {
                console.error(`Error processing deletion for ${deletion.entity_type} ${deletion.entity_id}:`, err);
                failed++;
            }
        }

        console.log(`Batch deletion complete: ${processed} processed, ${failed} failed`);
        
        return { processed, failed };
    } catch (err) {
        console.error("Error in processPendingDeletions:", err);
        return { processed: 0, failed: 0 };
    }
}

/**
 * Start batch deletion processor that runs periodically
 * @param {number} intervalMs - Interval in milliseconds (default: 24 hours)
 */
function startBatchDeletionProcessor(intervalMs = 24 * 60 * 60 * 1000) {
    console.log(`Starting batch deletion processor with interval: ${intervalMs}ms`);
    
    // Run immediately on start
    processPendingDeletions()
        .then(result => {
            console.log("Initial batch deletion run complete:", result);
        })
        .catch(err => {
            console.error("Error in initial batch deletion run:", err);
        });
    
    // Then run periodically
    const interval = setInterval(() => {
        processPendingDeletions()
            .then(result => {
                console.log("Scheduled batch deletion run complete:", result);
            })
            .catch(err => {
                console.error("Error in scheduled batch deletion run:", err);
            });
    }, intervalMs);
    
    return interval;
}

export {
    processPendingDeletions,
    startBatchDeletionProcessor,
};
