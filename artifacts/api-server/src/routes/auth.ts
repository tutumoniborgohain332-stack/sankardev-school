import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "school_salt_2024").digest("hex");
}

declare module "express-serve-static-core" {
  interface Request {
    session?: { userId?: number };
  }
}

const sessions: Map<string, number> = new Map();

router.post("/auth/login", async (req, res) => {
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
  sessions.set(token, user.id);

  res.cookie("session_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
  res.clearCookie("session_token");
  return res.json({ ok: true });
});

router.get("/auth/me", async (req, res) => {
  const token = req.cookies?.session_token;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userId = sessions.get(token)!;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
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

export { sessions, hashPassword };
export default router;
