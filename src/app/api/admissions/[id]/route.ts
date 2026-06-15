import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admissionsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const [deleted] = await db.delete(admissionsTable).where(eq(admissionsTable.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
