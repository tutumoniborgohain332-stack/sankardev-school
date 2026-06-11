import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceTable, studentsTable } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSession, isStaffRole } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { date, className, section, records } = await request.json();

    if (!records || !Array.isArray(records) || records.length === 0) {
       return NextResponse.json({ error: "No records provided" }, { status: 400 });
    }
    
    if (!section) {
       return NextResponse.json({ error: "Section is required for bulk attendance" }, { status: 400 });
    }

    const studentIds = records.map((r: any) => r.studentId);
    
    // Verify all students belong to the specified class and section
    const validStudents = await db.select({ id: studentsTable.id })
      .from(studentsTable)
      .where(and(eq(studentsTable.className, className), eq(studentsTable.section, section), inArray(studentsTable.id, studentIds)));

    if (validStudents.length !== studentIds.length) {
       return NextResponse.json({ error: "Some students do not belong to the specified class or section" }, { status: 400 });
    }

    // Bulk upsert: single query replaces N+1 loop
    const values = records.map((r: any) => ({
      studentId: r.studentId,
      date,
      className,
      section,
      status: r.status,
      markedBy: String(user.userId),
    }));

    await db.insert(attendanceTable)
      .values(values)
      .onConflictDoUpdate({
        target: [attendanceTable.studentId, attendanceTable.date],
        set: {
          status: sql`excluded.status`,
          markedBy: sql`excluded.marked_by`,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
