import { Router } from "express";
import { requireAuth } from "./auth";
import { db, staffTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateStaffBody, UpdateStaffBody, UpdateStaffParams, DeleteStaffParams, GetStaffMemberParams } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "school_salt_2024").digest("hex");
}

router.get("/staff", async (req, res) => {
  const staff = await db.select().from(staffTable);
  return res.json(staff.map(s => ({ ...s, isHeadmaster: s.isHeadmaster ?? false })));
});

router.post("/staff", requireAuth, async (req, res) => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const data = parsed.data as typeof parsed.data & { password?: string };
  const { password, ...staffData } = data;

  let userId: number | null = null;

  if (staffData.username && password) {
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, staffData.username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }
    const [newUser] = await db.insert(usersTable).values({
      username: staffData.username,
      passwordHash: hashPassword(password),
      role: "staff",
      name: staffData.name,
    }).returning();
    userId = newUser.id;
  }

  const [member] = await db.insert(staffTable).values({
    name: staffData.name,
    designation: staffData.designation,
    qualification: staffData.qualification ?? null,
    subject: staffData.subject ?? null,
    phone: staffData.phone ?? null,
    email: staffData.email ?? null,
    joinDate: staffData.joinDate,
    photoUrl: staffData.photoUrl ?? null,
    username: staffData.username ?? null,
    isHeadmaster: staffData.isHeadmaster ?? false,
    userId: userId,
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

router.patch("/staff/:id", requireAuth, async (req, res) => {
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

router.delete("/staff/:id", requireAuth, async (req, res) => {
  const parsed = DeleteStaffParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(staffTable).where(eq(staffTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
