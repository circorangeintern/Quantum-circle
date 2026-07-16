import app from "./app";
import { env } from "./core/config/env.config";
import { connectDatabase } from "./core/config/database.config";
import logger from "./core/utils/logger.util";

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 http://localhost:${env.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("Shutting down gracefully...");
      server.close(async () => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
