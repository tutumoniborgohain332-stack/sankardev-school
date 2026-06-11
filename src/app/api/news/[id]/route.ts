export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const [newsItem] = await db.select().from(newsTable).where(eq(newsTable.id, Number((await params).id))).limit(1);
  if (!newsItem) return NextResponse.json({ error: "News item not found" }, { status: 404 });
  return NextResponse.json(newsItem);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    delete data.updatedAt;
    
    const [newsItem] = await db
      .update(newsTable)
      .set(data)
      .where(eq(newsTable.id, Number((await params).id)))
      .returning();

    if (!newsItem) return NextResponse.json({ error: "News item not found" }, { status: 404 });
    return NextResponse.json(newsItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(newsTable).where(eq(newsTable.id, Number((await params).id)));
  return new NextResponse(null, { status: 204 });
}
