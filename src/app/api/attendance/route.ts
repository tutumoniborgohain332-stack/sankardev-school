import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceTable, studentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const className = searchParams.get("class");
  const date = searchParams.get("date");
  
  if (!className || !date) {
    return NextResponse.json({ error: "class and date are required" }, { status: 400 });
  }

  // Get all students for the class
  const students = await db.select().from(studentsTable).where(eq(studentsTable.className, className));
  if (!students.length) return NextResponse.json([]);

  // Get attendance records
  const records = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.date, date),
        // Filter those students by ID in application memory
      )
    );

  const studentIds = students.map(s => s.id);
  const classRecords = records.filter(r => studentIds.includes(r.studentId));

  // Merge students and attendance
  const result = students.map(student => {
    const record = classRecords.find(r => r.studentId === student.id);
    return {
      student,
      attendance: record || null
    };
  });

  return NextResponse.json(result);
}
