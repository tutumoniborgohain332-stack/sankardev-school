import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resultsTable } from "@/lib/db/schema";
import { desc, eq, SQL } from "drizzle-orm";
import { getSession, isStaffRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const examType = searchParams.get("examType");
  const year = searchParams.get("year");

  const conditions: SQL[] = [];
  if (studentId) conditions.push(eq(resultsTable.rollNumber, studentId));
  if (examType) conditions.push(eq(resultsTable.examType, examType));
  if (year) conditions.push(eq(resultsTable.academicYear, year));

  let query = db.select().from(resultsTable);
  for (const condition of conditions) {
    query = query.where(condition) as any;
  }
  
  const results = await query.orderBy(desc(resultsTable.createdAt));
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await request.json();
    const [result] = await db.insert(resultsTable).values({
      ...data,
      uploadedBy: String(user.userId),
    }).returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
