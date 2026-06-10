export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { galleryTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [galleryItem] = await db.select().from(galleryTable).where(eq(galleryTable.id, Number((await params).id))).limit(1);
  if (!galleryItem) return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
  return NextResponse.json(galleryItem);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(galleryTable).where(eq(galleryTable.id, Number((await params).id)));
  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    const id = Number((await params).id);
    
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const [updatedItem] = await db.update(galleryTable)
      .set({ isHero: data.isHero })
      .where(eq(galleryTable.id, id))
      .returning();

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
