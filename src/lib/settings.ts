import { db } from "./db";
import { settingsTable } from "./db/schema";
import { eq } from "drizzle-orm";

export async function isAdmissionOpen(): Promise<boolean> {
  const [setting] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "admission_open"))
    .limit(1);

  if (setting) {
    return setting.value === "true";
  }
  return false;
}

export async function setAdmissionOpen(isOpen: boolean): Promise<void> {
  const value = isOpen ? "true" : "false";

  const [existing] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "admission_open"))
    .limit(1);

  if (existing) {
    await db
      .update(settingsTable)
      .set({ value })
      .where(eq(settingsTable.key, "admission_open"));
  } else {
    await db.insert(settingsTable).values({
      key: "admission_open",
      value,
    });
  }
}
