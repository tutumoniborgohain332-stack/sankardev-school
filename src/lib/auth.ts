import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";

const SALT = "school_salt_2024";
const SESSION_COOKIE_NAME = "school_session";
const SESSION_SECRET = process.env.AUTH_SECRET || "default_dev_secret_key_1234567890";

/** Hashes a password exactly like the old system */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

/** Signs a token (simple HMAC for session) */
function signToken(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

/** Sets a secure session cookie */
export async function setSession(userId: number, role: string) {
  const payload = `${userId}:${role}:${Date.now()}`;
  const signature = signToken(payload);
  const token = `${payload}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

/** Gets current session user ID */
export async function getSession(): Promise<{ userId: number; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (signToken(payload) !== signature) return null; // Invalid signature

  const [userIdStr, role, timestamp] = payload.split(":");
  const userId = parseInt(userIdStr, 10);
  
  if (isNaN(userId)) return null;

  // Optional: check expiry if we wanted
  // if (Date.now() - parseInt(timestamp, 10) > 1000 * 60 * 60 * 24 * 7) return null;

  return { userId, role };
}

/** Checks if a role has admin privileges */
export function isPrivilegedRole(role?: string | null): boolean {
  if (!role) return false;
  return ["admin", "principal", "vice_principal"].includes(role);
}

/** Checks if a role has staff privileges (including admin) */
export function isStaffRole(role?: string | null): boolean {
  if (!role) return false;
  return isPrivilegedRole(role) || role === "staff";
}

/** Clears the session cookie */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Fetches the full user object for the current session */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const [user] = await db
    .select({ id: usersTable.id, username: usersTable.username, name: usersTable.name, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  return user || null;
}
