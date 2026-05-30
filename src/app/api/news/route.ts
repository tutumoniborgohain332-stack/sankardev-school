import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET() {
  const news = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  return NextResponse.json(news);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    const [newsItem] = await db.insert(newsTable).values({
      ...data,
      publishedBy: String(user.userId),
    }).returning();

    return NextResponse.json(newsItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
