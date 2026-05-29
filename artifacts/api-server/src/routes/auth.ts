import { Router, Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import crypto from "crypto";
import { checkRateLimit } from "../app";

const router = Router();

// Session expiry: 10 years = effectively lifetime
const SESSION_TTL = 10 * 365 * 24 * 60 * 60 * 1000;

function hashPassword(password: string): string {
  // Original salt - DO NOT CHANGE, changing breaks existing stored passwords
  return crypto.createHash("sha256").update(password + "school_salt_2024").digest("hex");
}

declare global {
  namespace Express {
    interface Request {
      session?: { userId?: number };
    }
  }
}

// Session store: token -> { userId, expiresAt }
const sessions = new Map<string, { userId: number; expiresAt: number }>();

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of sessions.entries()) {
    if (now > data.expiresAt) sessions.delete(token);
  }
}, 60 * 60 * 1000);

router.post("/auth/login", async (req, res) => {
  // Rate limiting: max 10 attempts per 15 min per IP
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many login attempts. Please try again in 15 minutes." });
  }

  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const hash = hashPassword(password);
  if (user.passwordHash !== hash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL;
  sessions.set(token, { userId: user.id, expiresAt });

  res.cookie("session_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
  });

  return res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });
});

router.post("/auth/logout", (req, res) => {
  const token = req.cookies?.session_token;
  if (token) sessions.delete(token);
  res.clearCookie("session_token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res.json({ ok: true });
});

router.get("/auth/me", async (req, res) => {
  const token = req.cookies?.session_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const sessionData = sessions.get(token);
  if (!sessionData) return res.status(401).json({ error: "Not authenticated" });
  // Check expiry
  if (Date.now() > sessionData.expiresAt) {
    sessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  };
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sessionData.userId))
    .limit(1);

  if (!user) {
    sessions.delete(token);
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session_token;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const sessionData = sessions.get(token);
  if (!sessionData) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (Date.now() > sessionData.expiresAt) {
    sessions.delete(token);
    res.status(401).json({ error: "Session expired" });
    return;
  }
  req.session = { userId: sessionData.userId };
  next();
  return;
}

export { sessions, hashPassword };
export default router;
