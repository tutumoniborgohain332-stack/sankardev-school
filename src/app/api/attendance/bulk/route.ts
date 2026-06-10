import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceTable, studentsTable } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSession, isStaffRole } from "@/lib/auth";

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

    // Sort records by studentId to prevent transaction deadlocks
    const sortedRecords = [...records].sort((a, b) => a.studentId - b.studentId);

    // Verify that all students actually belong to the specified class and section
    const studentIds = sortedRecords.map((r: any) => r.studentId);
    
    const validStudentsQuery = db.select({ id: studentsTable.id })
                               .from(studentsTable)
                               .where(and(eq(studentsTable.className, className), eq(studentsTable.section, section), inArray(studentsTable.id, studentIds)));
    
    const validStudents = await validStudentsQuery;

    if (validStudents.length !== studentIds.length) {
       return NextResponse.json({ error: "Some students do not belong to the specified class or section" }, { status: 400 });
    }

    await db.transaction(async (tx) => {
      for (const record of sortedRecords) {
        const existing = await tx
          .select()
          .from(attendanceTable)
          .where(
            and(
              eq(attendanceTable.studentId, record.studentId),
              eq(attendanceTable.date, date)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await tx
            .update(attendanceTable)
            .set({
              status: record.status,
              markedBy: String(user.userId)
            })
            .where(eq(attendanceTable.id, existing[0].id));
        } else {
          await tx.insert(attendanceTable).values({
            studentId: record.studentId,
            date,
            className,
            section,
            status: record.status,
            markedBy: String(user.userId)
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
