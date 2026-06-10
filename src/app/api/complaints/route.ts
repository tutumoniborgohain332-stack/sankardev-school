import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaintsTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const complaints = await db.select().from(complaintsTable).orderBy(desc(complaintsTable.createdAt));
    return NextResponse.json(complaints);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.identityDetails || !data.subject || !data.content) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const [complaint] = await db.insert(complaintsTable).values({
      name: data.name,
      identityDetails: data.identityDetails,
      subject: data.subject,
      content: data.content,
    }).returning();

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
