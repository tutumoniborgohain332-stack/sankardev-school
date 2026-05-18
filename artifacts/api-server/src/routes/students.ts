import { Router } from "express";
import { db, studentsTable } from "@workspace/db";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { CreateStudentBody, UpdateStudentBody, UpdateStudentParams, DeleteStudentParams, GetStudentParams, ListStudentsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/students", async (req, res) => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  
  const conditions: SQL[] = [];
  if (params.class) conditions.push(eq(studentsTable.className, params.class));
  if (params.search) conditions.push(ilike(studentsTable.studentName, `%${params.search}%`));

  const students = conditions.length
    ? await db.select().from(studentsTable).where(and(...conditions))
    : await db.select().from(studentsTable);

  return res.json(students.map(s => ({
    ...s,
    admissionDate: s.admissionDate ?? new Date().toISOString().split("T")[0],
  })));
});

router.post("/students", async (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { password, ...data } = parsed.data as typeof parsed.data & { password?: string };

  const [student] = await db.insert(studentsTable).values({
    studentName: data.studentName,
    fatherName: data.fatherName,
    motherName: data.motherName,
    permanentAddress: data.permanentAddress ?? null,
    presentAddress: data.presentAddress ?? null,
    dateOfBirth: data.dateOfBirth ?? null,
    caste: data.caste ?? null,
    religion: data.religion ?? null,
    className: data.className,
    section: data.section ?? null,
    rollNumber: data.rollNumber,
    apaarId: data.apaarId,
    bloodGroup: data.bloodGroup ?? null,
    nationality: data.nationality ?? null,
    guardianName: data.guardianName ?? null,
    guardianRelation: data.guardianRelation ?? null,
    guardianPhone: data.guardianPhone ?? null,
    previousSchool: data.previousSchool ?? null,
    admissionDate: data.admissionDate,
    photoUrl: data.photoUrl ?? null,
    username: data.username ?? null,
  }).returning();

  return res.status(201).json(student);
});

router.get("/students/:id", async (req, res) => {
  const parsed = GetStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, parsed.data.id)).limit(1);
  if (!student) return res.status(404).json({ error: "Student not found" });
  return res.json(student);
});

router.patch("/students/:id", async (req, res) => {
  const paramParsed = UpdateStudentParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateStudentBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid input" });

  const [student] = await db
    .update(studentsTable)
    .set(bodyParsed.data)
    .where(eq(studentsTable.id, paramParsed.data.id))
    .returning();

  if (!student) return res.status(404).json({ error: "Student not found" });
  return res.json(student);
});

router.delete("/students/:id", async (req, res) => {
  const parsed = DeleteStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(studentsTable).where(eq(studentsTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
