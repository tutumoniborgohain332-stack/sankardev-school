import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { galleryTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET() {
  const gallery = await db.select().from(galleryTable).orderBy(desc(galleryTable.uploadedAt));
  return NextResponse.json(gallery);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    const [galleryItem] = await db.insert(galleryTable).values({
      ...data,
      uploadedBy: String(user.userId),
    }).returning();

    return NextResponse.json(galleryItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
