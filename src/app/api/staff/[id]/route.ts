export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffTable, insertStaffSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, Number((await params).id))).limit(1);
  if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  return NextResponse.json(staff);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rawData = await request.json();
    const data = insertStaffSchema.partial().parse(rawData);
    
    if (data.isHeadmaster && user.role !== "principal" && user.role !== "admin") {
      return NextResponse.json({ error: "Only the Principal or Admin can create or update a Headmaster" }, { status: 403 });
    }

    const [staff] = await db
      .update(staffTable)
      .set(data)
      .where(eq(staffTable.id, Number((await params).id)))
      .returning();

    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    return NextResponse.json(staff);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(staffTable).where(eq(staffTable.id, Number((await params).id)));
  return new NextResponse(null, { status: 204 });
}
