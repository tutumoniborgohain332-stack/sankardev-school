export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET() {
  const news = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  return NextResponse.json(news);
}

