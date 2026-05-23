import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { logger } from "./logger";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "school_salt_2024").digest("hex");
}

const DEFAULT_USERS = [
  { username: "ujjal", password: "ujjal2007", role: "staff", name: "Ujjal" },
  { username: "admin", password: "admin@school2024", role: "admin", name: "Administrator" },
];

export async function seedDefaultUsers() {
  for (const u of DEFAULT_USERS) {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, u.username))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(usersTable).values({
        username: u.username,
        passwordHash: hashPassword(u.password),
        role: u.role,
        name: u.name,
      });
      logger.info({ username: u.username }, "Default user seeded");
    } else {
      await db
        .update(usersTable)
        .set({ passwordHash: hashPassword(u.password), role: u.role, name: u.name })
        .where(eq(usersTable.username, u.username));
    }
  }
}
