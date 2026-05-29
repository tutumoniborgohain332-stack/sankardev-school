// Vercel serverless entry point — API only
// Static files are served by Vercel CDN (via outputDirectory)
import { seedDefaultUsers } from "../artifacts/api-server/src/lib/seed";
import app from "../artifacts/api-server/src/app";

// Seed default users on cold start (non-blocking)
seedDefaultUsers().catch(console.error);

export default app;
