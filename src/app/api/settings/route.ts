import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settingsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    const [setting] = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    return NextResponse.json({ value: setting?.value || null });
  }

  const settings = await db.select().from(settingsTable);
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { key, value } = await request.json();
    
    // Upsert the setting
    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, key));
    } else {
      await db.insert(settingsTable).values({ key, value });
    }

    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
