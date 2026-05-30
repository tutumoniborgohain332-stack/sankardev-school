import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admissionsTable } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let admissions;
  if (status) {
    const statuses = status.split(",");
    admissions = await db.select().from(admissionsTable).where(inArray(admissionsTable.status, statuses as any)).orderBy(desc(admissionsTable.submittedAt));
  } else {
    admissions = await db.select().from(admissionsTable).orderBy(desc(admissionsTable.submittedAt));
  }

  return NextResponse.json(admissions);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const [admission] = await db.insert(admissionsTable).values({
      ...data,
      status: "pending",
    }).returning();

    return NextResponse.json(admission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
