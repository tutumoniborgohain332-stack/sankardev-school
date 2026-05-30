import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffTable } from "@/lib/db/schema";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET() {
  const staffMembers = await db.select().from(staffTable);
  return NextResponse.json(staffMembers);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    const [staff] = await db.insert(staffTable).values({
      ...data,
      password: undefined,
    }).returning();

    return NextResponse.json(staff, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
