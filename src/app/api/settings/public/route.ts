import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settingsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const [setting] = await db.select().from(settingsTable).where(eq(settingsTable.key, "admission_open")).limit(1);
  return NextResponse.json({ admissionOpen: setting?.value === "true" || setting?.value === null || setting === undefined });
}
