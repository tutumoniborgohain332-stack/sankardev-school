import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settingsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function PUT(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { open } = await request.json();
    const val = open ? "true" : "false";

    const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, "admission_open")).limit(1);
    if (existing.length > 0) {
      await db.update(settingsTable).set({ value: val, updatedAt: new Date() }).where(eq(settingsTable.key, "admission_open"));
    } else {
      await db.insert(settingsTable).values({ key: "admission_open", value: val });
    }

    return NextResponse.json({ admissionOpen: open });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
