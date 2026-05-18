import { Router } from "express";
import { db, resultsTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/results", async (req, res) => {
  const { rollNumber, className, examType, academicYear } = req.query as Record<string, string | undefined>;

  const conditions: SQL[] = [];
  if (rollNumber) conditions.push(eq(resultsTable.rollNumber, rollNumber));
  if (className) conditions.push(eq(resultsTable.className, className));
  if (examType) conditions.push(eq(resultsTable.examType, examType));
  if (academicYear) conditions.push(eq(resultsTable.academicYear, academicYear));

  const rows = conditions.length
    ? await db.select().from(resultsTable).where(and(...conditions)).orderBy(desc(resultsTable.publishedAt))
    : await db.select().from(resultsTable).orderBy(desc(resultsTable.publishedAt));

  return res.json(rows.map(r => ({
    ...r,
    percentage: r.percentage?.toString() ?? "0",
    publishedAt: r.publishedAt?.toISOString() ?? new Date().toISOString(),
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
    subjects: r.subjects ?? [],
  })));
});

router.post("/results", async (req, res) => {
  const { rollNumber, studentName, className, section, examType, academicYear, subjects, totalMarks, marksObtained, percentage, result, rank, remarks } = req.body;

  if (!rollNumber || !studentName || !className || !examType || !academicYear || !subjects || totalMarks == null || marksObtained == null || !percentage || !result) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [row] = await db.insert(resultsTable).values({
    rollNumber,
    studentName,
    className,
    section: section ?? null,
    examType,
    academicYear,
    subjects,
    totalMarks: Number(totalMarks),
    marksObtained: Number(marksObtained),
    percentage: String(percentage),
    result,
    rank: rank ? Number(rank) : null,
    remarks: remarks ?? null,
  }).returning();

  return res.status(201).json({
    ...row,
    percentage: row.percentage?.toString() ?? "0",
    publishedAt: row.publishedAt?.toISOString() ?? new Date().toISOString(),
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    subjects: row.subjects ?? [],
  });
});

router.patch("/results/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { rollNumber, studentName, className, section, examType, academicYear, subjects, totalMarks, marksObtained, percentage, result, rank, remarks } = req.body;

  const updates: Partial<typeof resultsTable.$inferInsert> = {};
  if (rollNumber !== undefined) updates.rollNumber = rollNumber;
  if (studentName !== undefined) updates.studentName = studentName;
  if (className !== undefined) updates.className = className;
  if (section !== undefined) updates.section = section;
  if (examType !== undefined) updates.examType = examType;
  if (academicYear !== undefined) updates.academicYear = academicYear;
  if (subjects !== undefined) updates.subjects = subjects;
  if (totalMarks !== undefined) updates.totalMarks = Number(totalMarks);
  if (marksObtained !== undefined) updates.marksObtained = Number(marksObtained);
  if (percentage !== undefined) updates.percentage = String(percentage);
  if (result !== undefined) updates.result = result;
  if (rank !== undefined) updates.rank = rank ? Number(rank) : null;
  if (remarks !== undefined) updates.remarks = remarks;

  const [row] = await db.update(resultsTable).set(updates).where(eq(resultsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "Result not found" });

  return res.json({
    ...row,
    percentage: row.percentage?.toString() ?? "0",
    publishedAt: row.publishedAt?.toISOString() ?? new Date().toISOString(),
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    subjects: row.subjects ?? [],
  });
});

router.delete("/results/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  await db.delete(resultsTable).where(eq(resultsTable.id, id));
  return res.status(204).send();
});

export default router;
