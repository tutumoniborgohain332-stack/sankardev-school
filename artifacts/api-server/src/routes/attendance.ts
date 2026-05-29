import { Router } from "express";
import { requireAuth } from "./auth";
import { db, attendanceTable, studentsTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

const router = Router();

router.get("/attendance", async (req, res) => {
  const { date, className, section } = req.query as Record<string, string>;

  const conditions = [];
  if (date) conditions.push(eq(attendanceTable.date, date));
  if (className) conditions.push(eq(attendanceTable.className, className));
  if (section) conditions.push(eq(attendanceTable.section, section));

  const rows = await db
    .select({
      id: attendanceTable.id,
      studentId: attendanceTable.studentId,
      studentName: studentsTable.studentName,
      rollNumber: studentsTable.rollNumber,
      date: attendanceTable.date,
      status: attendanceTable.status,
      className: attendanceTable.className,
      section: attendanceTable.section,
      markedBy: attendanceTable.markedBy,
      remarks: attendanceTable.remarks,
    })
    .from(attendanceTable)
    .leftJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(attendanceTable.date, studentsTable.rollNumber);

  return res.json(rows);
});

router.post("/attendance/bulk", async (req, res) => {
  const { date, className, section, markedBy, records } = req.body as {
    date: string;
    className: string;
    section?: string;
    markedBy?: string;
    records: Array<{ studentId: number; status: string; remarks?: string }>;
  };

  if (!date || !className || !records || !Array.isArray(records)) {
    return res.status(400).json({ error: "date, className and records are required" });
  }

  await db
    .delete(attendanceTable)
    .where(
      and(
        eq(attendanceTable.date, date),
        eq(attendanceTable.className, className),
        ...(section ? [eq(attendanceTable.section, section)] : []),
      )
    );

  if (records.length > 0) {
    await db.insert(attendanceTable).values(
      records.map((r) => ({
        studentId: r.studentId,
        date,
        status: r.status,
        className,
        section: section ?? null,
        markedBy: markedBy ?? null,
        remarks: r.remarks ?? null,
      }))
    );
  }

  return res.json({ ok: true, count: records.length });
});

router.get("/attendance/report", async (req, res) => {
  const { className, section, month, year } = req.query as Record<string, string>;

  if (!month || !year || !className) {
    return res.status(400).json({ error: "className, month and year are required" });
  }

  const monthNum = month.padStart(2, "0");
  const startDate = `${year}-${monthNum}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const endDate = `${year}-${monthNum}-${lastDay}`;

  const rows = await db
    .select({
      studentId: attendanceTable.studentId,
      studentName: studentsTable.studentName,
      rollNumber: studentsTable.rollNumber,
      date: attendanceTable.date,
      status: attendanceTable.status,
    })
    .from(attendanceTable)
    .leftJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
    .where(
      and(
        eq(attendanceTable.className, className),
        gte(attendanceTable.date, startDate),
        lte(attendanceTable.date, endDate),
        ...(section ? [eq(attendanceTable.section, section)] : []),
      )
    )
    .orderBy(studentsTable.rollNumber, attendanceTable.date);

  const studentMap: Record<number, {
    studentId: number;
    studentName: string;
    rollNumber: string;
    present: number;
    absent: number;
    late: number;
    total: number;
    dates: Record<string, string>;
  }> = {};

  for (const row of rows) {
    if (!row.studentId) continue;
    if (!studentMap[row.studentId]) {
      studentMap[row.studentId] = {
        studentId: row.studentId,
        studentName: row.studentName ?? "",
        rollNumber: row.rollNumber ?? "",
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        dates: {},
      };
    }
    const s = studentMap[row.studentId];
    s.total++;
    if (row.status === "present") s.present++;
    else if (row.status === "absent") s.absent++;
    else if (row.status === "late") s.late++;
    s.dates[row.date] = row.status;
  }

  return res.json({
    className,
    section: section ?? null,
    month: Number(month),
    year: Number(year),
    startDate,
    endDate,
    students: Object.values(studentMap).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })),
  });
});

router.delete("/attendance/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await db.delete(attendanceTable).where(eq(attendanceTable.id, id));
  return res.json({ ok: true });
});

export default router;
