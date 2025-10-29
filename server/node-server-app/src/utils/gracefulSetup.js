import { dbClose } from '../database/db.js';

function setupGracefulShutdown(server) {
    async function shutdown() {
        try {
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
        await dbClose();
        console.log("Server crashed.");
        process.exit(1);
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("uncaughtException", crashOut);
    process.on("unhandledRejection", crashOut);
}

export { setupGracefulShutdown };
