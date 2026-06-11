import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE_NAME = "school_session";
const SESSION_SECRET = process.env.AUTH_SECRET;

if (!SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET environment variable is missing in production!");
}

const DEV_SECRET = SESSION_SECRET || "default_dev_secret_key_1234567890";

/** Hashes a password using scrypt asynchronously. Format: salt:hash */
export async function hashPassword(password: string, salt: string = crypto.randomBytes(16).toString("hex")): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

const DUMMY_HASH = "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

/** Verifies a password against a stored scrypt hash asynchronously and safely */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  let hashToVerify = storedHash;
  let isDummy = false;
  if (!storedHash || !storedHash.includes(":")) {
    hashToVerify = DUMMY_HASH;
    isDummy = true;
  }
  
  const [salt, key] = hashToVerify.split(":");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const keyBuffer = Buffer.from(key, "hex");
        if (keyBuffer.length !== derivedKey.length) {
          resolve(false);
          return;
        }
        const isEqual = crypto.timingSafeEqual(keyBuffer, derivedKey);
        resolve(isDummy ? false : isEqual);
      } catch (e) {
        resolve(false);
      }
    });
  });
}

/** Signs a token (simple HMAC for session) */
export function signToken(payload: string): string {
  return crypto.createHmac("sha256", DEV_SECRET).update(payload).digest("hex");
}

export function verifySignature(payload: string, signature: string): boolean {
  try {
    const expectedSignature = Buffer.from(signToken(payload), "hex");
    const actualSignature = Buffer.from(signature, "hex");
    if (expectedSignature.length !== actualSignature.length) return false;
    return crypto.timingSafeEqual(expectedSignature, actualSignature);
  } catch (e) {
    return false;
  }
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

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  
  if (!verifySignature(payload, signature)) return null; // Invalid signature

  const [userIdStr, role, timestamp] = payload.split(":");
  const userId = parseInt(userIdStr, 10);
  
  if (isNaN(userId)) return null;

  // Enforce session TTL: reject tokens older than 7 days
  if (Date.now() - parseInt(timestamp, 10) > 1000 * 60 * 60 * 24 * 7) return null;

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
