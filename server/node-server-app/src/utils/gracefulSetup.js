function setupGracefulShutdown(server, dbClose) {
  let isShuttingDown = false;


  async function shutdown(reason) {
    if (isShuttingDown) {
      console.log(`[Shutdown] Already in progress → ignoring duplicate: ${reason}`);
      return;
    }


    isShuttingDown = true;
    console.log(`\n[Shutdown] Triggered due to: ${reason}`);


    try {
      await handleDatabaseClose();


      await handleServerClose();


      console.log("[Shutdown]  All resources closed safely. Exiting now...");
      process.exit(0);


    } catch (err) {
      console.error("[Shutdown]  Fatal error during shutdown:", err);
      process.exit(1);
    }
  }


  async function handleDatabaseClose() {
    try {
      await dbClose();
      console.log("[DB] Database connection closed successfully.");
    } catch (err) {
      console.error("[DB]  Error while closing database:", err);
    }
  }


  async function handleServerClose() {
    return new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error("[Server]  Error closing HTTP server:", err);
          return reject(err);
        }
        console.log("[Server]  HTTP server closed successfully.");
        resolve();
      });
    });
  }


  process.on("SIGINT", async () => {
    console.log("\n[Signal] SIGINT received (Ctrl + C pressed by user)");
    await shutdown("SIGINT");
  });


  process.on("SIGTERM", async () => {
    console.log("\n[Signal] SIGTERM received (Stop signal from OS or Cloud)");
    await shutdown("SIGTERM");
  });


  process.on("uncaughtException", async (err) => {
    console.error("\n[Fatal] Uncaught Exception:", err);
    await shutdown("uncaughtException");
  });


  process.on("unhandledRejection", async (reason) => {
    console.error("\n[Fatal] Unhandled Promise Rejection:", reason);
    await shutdown("unhandledRejection");
  });
}


export { setupGracefulShutdown };
