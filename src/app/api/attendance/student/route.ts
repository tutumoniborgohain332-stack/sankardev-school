export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceTable, studentsTable } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get the student ID for this user
  const [student] = await db.select({ id: studentsTable.id }).from(studentsTable).where(eq(studentsTable.userId, user.userId));
  if (!student) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  // Calculate 90 days ago
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const dateStr = ninetyDaysAgo.toISOString().split("T")[0];

  const records = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.studentId, student.id),
        gte(attendanceTable.date, dateStr)
      )
    )
    .orderBy(desc(attendanceTable.date));

  return NextResponse.json(records);
}
