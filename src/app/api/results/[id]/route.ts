export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resultsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isStaffRole } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [result] = await db.select().from(resultsTable).where(eq(resultsTable.id, Number((await params).id))).limit(1);
  if (!result) return NextResponse.json({ error: "Result not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    const [result] = await db
      .update(resultsTable)
      .set(data)
      .where(eq(resultsTable.id, Number((await params).id)))
      .returning();

    if (!result) return NextResponse.json({ error: "Result not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(resultsTable).where(eq(resultsTable.id, Number((await params).id)));
  return new NextResponse(null, { status: 204 });
}
