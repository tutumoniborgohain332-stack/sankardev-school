import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession, isStaffRole } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { date, className, section, records } = await request.json();

    for (const record of records) {
      const existing = await db
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
        await db
          .update(attendanceTable)
          .set({
            status: record.status,
            markedBy: String(user.userId)
          })
          .where(eq(attendanceTable.id, existing[0].id));
      } else {
        await db.insert(attendanceTable).values({
          studentId: record.studentId,
          date,
          className,
          section,
          status: record.status,
          markedBy: String(user.userId)
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
