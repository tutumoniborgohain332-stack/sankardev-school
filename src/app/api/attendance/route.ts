import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceTable, studentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const className = searchParams.get("class");
  const date = searchParams.get("date");
  const section = searchParams.get("section");
  
  if (!className || !date || !section) {
    return NextResponse.json({ error: "class, section, and date are required" }, { status: 400 });
  }

  // Get all students for the class and section
  const students = await db.select().from(studentsTable).where(
    and(
      eq(studentsTable.className, className),
      eq(studentsTable.section, section)
    )
  );
  if (!students.length) return NextResponse.json([]);

  // Get attendance records for this class on this date ONLY
  const records = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.date, date),
        eq(attendanceTable.className, className),
        eq(attendanceTable.section, section)
      )
    );

  // Merge students and attendance
  const result = students.map(student => {
    const record = records.find(r => r.studentId === student.id);
    return {
      student,
      attendance: record || null
    };
  });

  return NextResponse.json(result);
}
