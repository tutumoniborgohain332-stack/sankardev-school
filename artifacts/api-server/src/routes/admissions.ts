import { Router } from "express";
import { db, admissionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SubmitAdmissionBody, GetAdmissionParams, UpdateAdmissionStatusBody, UpdateAdmissionStatusParams, ListAdmissionsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/admissions", async (req, res) => {
  const parsed = ListAdmissionsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const applications = params.status
    ? await db.select().from(admissionsTable).where(eq(admissionsTable.status, params.status)).orderBy(desc(admissionsTable.submittedAt))
    : await db.select().from(admissionsTable).orderBy(desc(admissionsTable.submittedAt));

  return res.json(applications.map(a => ({
    ...a,
    submittedAt: a.submittedAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.post("/admissions", async (req, res) => {
  const parsed = SubmitAdmissionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const [application] = await db.insert(admissionsTable).values({
    ...parsed.data,
    status: "pending",
  }).returning();

  return res.status(201).json({
    ...application,
    submittedAt: application.submittedAt?.toISOString() ?? new Date().toISOString(),
  });
});

router.get("/admissions/:id", async (req, res) => {
  const parsed = GetAdmissionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [application] = await db.select().from(admissionsTable).where(eq(admissionsTable.id, parsed.data.id)).limit(1);
  if (!application) return res.status(404).json({ error: "Application not found" });
  return res.json({
    ...application,
    submittedAt: application.submittedAt?.toISOString() ?? new Date().toISOString(),
  });
});

router.patch("/admissions/:id", async (req, res) => {
  const paramParsed = UpdateAdmissionStatusParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateAdmissionStatusBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid input" });

  const [application] = await db
    .update(admissionsTable)
    .set({ status: bodyParsed.data.status, remarks: bodyParsed.data.remarks ?? null })
    .where(eq(admissionsTable.id, paramParsed.data.id))
    .returning();

  if (!application) return res.status(404).json({ error: "Application not found" });
  return res.json({
    ...application,
    submittedAt: application.submittedAt?.toISOString() ?? new Date().toISOString(),
  });
});

export default router;
