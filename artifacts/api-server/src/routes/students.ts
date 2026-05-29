import { Router } from "express";
import { requireAuth } from "./auth";
import { db, studentsTable, usersTable } from "@workspace/db";
import { eq, ilike, and, SQL, inArray } from "drizzle-orm";
import { CreateStudentBody, UpdateStudentBody, UpdateStudentParams, DeleteStudentParams, GetStudentParams, ListStudentsQueryParams } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "school_salt_2024").digest("hex");
}

// Class progression map
const CLASS_ORDER = ["Ankur", "Mukul", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];


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

router.post("/students", requireAuth, async (req, res) => {
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

router.patch("/students/:id", requireAuth, async (req, res) => {
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

router.delete("/students/:id", requireAuth, async (req, res) => {
  const parsed = DeleteStudentParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(studentsTable).where(eq(studentsTable.id, parsed.data.id));
  return res.status(204).send();
});

// ── Upscale: promote all students one class up ──────────────────────────────
// Only principal or vice_principal can do this (verified by password)
router.post("/students/upscale", requireAuth, async (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password) return res.status(400).json({ error: "Password is required" });

  // Check password matches any principal or vice_principal account
  const hash = hashPassword(password);
  const authorizedUsers = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.role, ["principal", "vice_principal"]));

  const isAuthorized = authorizedUsers.some(u => u.passwordHash === hash);
  if (!isAuthorized) {
    return res.status(403).json({ error: "Invalid password. Only Principal or Vice Principal can upscale." });
  }

  // Get all students
  const allStudents = await db.select().from(studentsTable);

  // Separate Class X students (to be marked for deletion)
  const classXStudents = allStudents.filter(s => s.className === "X");
  const otherStudents = allStudents.filter(s => s.className !== "X" && CLASS_ORDER.includes(s.className));

  let promoted = 0;
  let markedForDeletion = 0;

  // Promote each student to next class
  for (const student of otherStudents) {
    const currentIndex = CLASS_ORDER.indexOf(student.className);
    if (currentIndex >= 0 && currentIndex < CLASS_ORDER.length - 1) {
      const nextClass = CLASS_ORDER[currentIndex + 1];
      await db.update(studentsTable)
        .set({ className: nextClass })
        .where(eq(studentsTable.id, student.id));
      promoted++;
    }
  }

  // Mark Class X students: set className to "X_PENDING_DELETE" with a delete-after timestamp in updatedAt
  // We delete them after 10 days (handled by a scheduler check or admin confirmation)
  const deleteAfter = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
  for (const student of classXStudents) {
    await db.update(studentsTable)
      .set({ className: `X_DELETE_AFTER_${deleteAfter}` })
      .where(eq(studentsTable.id, student.id));
    markedForDeletion++;
  }

  // Schedule automatic deletion after 10 days (in-process timer)
  if (classXStudents.length > 0) {
    const ids = classXStudents.map(s => s.id);
    setTimeout(async () => {
      try {
        await db.delete(studentsTable).where(inArray(studentsTable.id, ids));
        console.log(`[Upscale] Auto-deleted ${ids.length} Class X students after 10 days`);
      } catch (e) {
        console.error("[Upscale] Failed to auto-delete Class X students:", e);
      }
    }, 10 * 24 * 60 * 60 * 1000);
  }

  return res.json({
    success: true,
    promoted,
    markedForDeletion,
    message: `Upscale complete! ${promoted} students promoted. ${markedForDeletion} Class X students will be auto-deleted after 10 days.`
  });
});

export default router;
