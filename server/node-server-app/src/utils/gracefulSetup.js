import { dbClose } from "../database/db.js";

let batchDeletionProcessor = null;

function setBatchDeletionProcessor(processor) {
    batchDeletionProcessor = processor;
}

function setupGracefulShutdown(server) {
    async function shutdown() {
        try {
            // Stop batch deletion processor if running
            if (batchDeletionProcessor && batchDeletionProcessor.stop) {
                batchDeletionProcessor.stop();
            }
            await dbClose();
            server.close(() => {
                process.exit(0);
            });

            setTimeout(() => {
                server.closeAllConnections();
                process.exit(1);
            }, 3 * 1000);

        } catch (err) {
            console.error(err);
            process.exit(1);
        } finally {
            console.log("Server closed.");
        }
    }

    async function crashOut(e) {
        console.error(e);
        // Stop batch deletion processor if running
        if (batchDeletionProcessor && batchDeletionProcessor.stop) {
            batchDeletionProcessor.stop();
        }
        await dbClose();
        console.log("Server crashed.");
        process.exit(1);
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("uncaughtException", crashOut);
    process.on("unhandledRejection", crashOut);
}

export { setupGracefulShutdown, setBatchDeletionProcessor };
