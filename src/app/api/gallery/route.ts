import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { galleryTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET() {
  try {
    const gallery = await db.select().from(galleryTable).orderBy(desc(galleryTable.uploadedAt));
    return NextResponse.json(gallery);
  } catch (error) {
    console.error("DB Error, returning mock gallery data:", error);
    return NextResponse.json([
      {
        id: "mock-1",
        title: "Annual Sports Day",
        type: "photo",
        url: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80",
        category: "Sports",
        description: "Students participating in the annual sports day event.",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: "mock-2",
        title: "Science Exhibition",
        type: "photo",
        url: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=800&q=80",
        category: "Events",
        description: "A brilliant science project showcased by our students.",
        uploadedAt: new Date().toISOString(),
      }
    ]);
  }
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
