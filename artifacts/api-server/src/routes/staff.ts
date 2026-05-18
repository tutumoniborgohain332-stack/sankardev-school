import { Router } from "express";
import { db, staffTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateStaffBody, UpdateStaffBody, UpdateStaffParams, DeleteStaffParams, GetStaffMemberParams } from "@workspace/api-zod";

const router = Router();

router.get("/staff", async (req, res) => {
  const staff = await db.select().from(staffTable);
  return res.json(staff.map(s => ({ ...s, isHeadmaster: s.isHeadmaster ?? false })));
});

router.post("/staff", async (req, res) => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { password, ...data } = parsed.data as typeof parsed.data & { password?: string };

  const [member] = await db.insert(staffTable).values({
    name: data.name,
    designation: data.designation,
    department: data.department,
    qualification: data.qualification ?? null,
    subject: data.subject ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    joinDate: data.joinDate,
    photoUrl: data.photoUrl ?? null,
    username: data.username ?? null,
    isHeadmaster: data.isHeadmaster ?? false,
  }).returning();

  return res.status(201).json({ ...member, isHeadmaster: member.isHeadmaster ?? false });
});

router.get("/staff/:id", async (req, res) => {
  const parsed = GetStaffMemberParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [member] = await db.select().from(staffTable).where(eq(staffTable.id, parsed.data.id)).limit(1);
  if (!member) return res.status(404).json({ error: "Staff member not found" });
  return res.json({ ...member, isHeadmaster: member.isHeadmaster ?? false });
});

router.patch("/staff/:id", async (req, res) => {
  const paramParsed = UpdateStaffParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateStaffBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid input" });

  const [member] = await db
    .update(staffTable)
    .set(bodyParsed.data)
    .where(eq(staffTable.id, paramParsed.data.id))
    .returning();

  if (!member) return res.status(404).json({ error: "Staff member not found" });
  return res.json({ ...member, isHeadmaster: member.isHeadmaster ?? false });
});

router.delete("/staff/:id", async (req, res) => {
  const parsed = DeleteStaffParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(staffTable).where(eq(staffTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
