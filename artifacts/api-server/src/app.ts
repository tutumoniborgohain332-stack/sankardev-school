import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Simple in-memory rate limiter for login
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min window
    return true;
  }
  if (entry.count >= 10) return false; // max 10 attempts per 15 min
  entry.count++;
  return true;
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// CORS: only allow same-origin in production; dev allows localhost
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : ["http://localhost:4000", "http://localhost:5173"];
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no origin header) and whitelisted origins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use("/api", router);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statically serve the frontend
const frontendPath = path.resolve(__dirname, "../../school-website/dist/public");
app.use(express.static(frontendPath));

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, "../../school-website/dist/public/index.html"));
  } else {
    next();
  }
});

export default app;
