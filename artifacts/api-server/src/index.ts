import app from "./app";
import { logger } from "./lib/logger";
import { seedDefaultUsers } from "./lib/seed";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Seed users on startup (non-blocking)
seedDefaultUsers().catch((err) => {
  logger.error({ err }, "Failed to seed default users");
});

// On Vercel (serverless), export the app — no app.listen() needed.
// Locally (PORT is set), start the HTTP server normally.
const rawPort = process.env["PORT"];

if (rawPort) {
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
} else {
  logger.info("No PORT set — running as serverless function");
}

// Must export app for Vercel serverless
export default app;
