import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaintsTable, insertComplaintSchema } from "@/lib/db/schema";
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
    return NextResponse.json({ error: "Failed to fetch complaints." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Strict Zod validation
    const parsedData = insertComplaintSchema.parse(data);

    const [complaint] = await db.insert(complaintsTable).values({
      name: parsedData.name.substring(0, 255),
      identityDetails: parsedData.identityDetails.substring(0, 255),
      subject: parsedData.subject.substring(0, 255),
      content: parsedData.content.substring(0, 5000),
    }).returning();

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Invalid data provided." }, { status: 400 });
  }
}
