import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resultsTable, usersTable, studentsTable, insertResultSchema } from "@/lib/db/schema";
import { desc, eq, SQL, and } from "drizzle-orm";
import { getSession, isStaffRole } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("rollNumber") || searchParams.get("studentId");
  const examType = searchParams.get("examType");
  const year = searchParams.get("academicYear") || searchParams.get("year");
  const className = searchParams.get("className");
  const section = searchParams.get("section");

  const conditions: SQL[] = [];
  
  if (user?.role === "student") {
    const [currentUser] = await db.select({ referenceId: usersTable.referenceId })
                                  .from(usersTable)
                                  .where(eq(usersTable.id, user.userId));
    if (!currentUser?.referenceId) return NextResponse.json([]);
    
    const [student] = await db.select({ rollNumber: studentsTable.rollNumber, className: studentsTable.className, section: studentsTable.section })
                              .from(studentsTable)
                              .where(eq(studentsTable.id, parseInt(currentUser.referenceId, 10)));
    if (!student) return NextResponse.json([]);
    
    conditions.push(eq(resultsTable.rollNumber, student.rollNumber));
    conditions.push(eq(resultsTable.className, student.className));
    if (student.section) conditions.push(eq(resultsTable.section, student.section));
  } else if (isStaffRole(user?.role)) {
    if (studentId) conditions.push(eq(resultsTable.rollNumber, studentId));
    if (className) conditions.push(eq(resultsTable.className, className));
    if (section) conditions.push(eq(resultsTable.section, section));
  } else {
    // Unauthenticated public search: requires exact match to prevent dumping
    if (!studentId || !className || !year) {
      return NextResponse.json({ error: "Missing required parameters for public search" }, { status: 400 });
    }
    conditions.push(eq(resultsTable.rollNumber, studentId));
    conditions.push(eq(resultsTable.className, className));
    conditions.push(eq(resultsTable.academicYear, year));
    if (section) {
      conditions.push(eq(resultsTable.section, section));
    }
  }

  if (examType) conditions.push(eq(resultsTable.examType, examType));
  if (year) conditions.push(eq(resultsTable.academicYear, year));

  let query = db.select().from(resultsTable);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query.orderBy(desc(resultsTable.createdAt));
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rawData = await request.json();
    const parsedData = insertResultSchema.parse(rawData);
    
    const marksObtained = parseInt(parsedData.marksObtained as unknown as string, 10) || 0;
    const totalMarks = parseInt(parsedData.totalMarks as unknown as string, 10) || 100;
    
    const calculatedPercentage = ((marksObtained / totalMarks) * 100).toFixed(2) + "%";

    const [result] = await db.insert(resultsTable).values({
      ...parsedData,
      percentage: calculatedPercentage,
      uploadedBy: String(user.userId),
    }).returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
