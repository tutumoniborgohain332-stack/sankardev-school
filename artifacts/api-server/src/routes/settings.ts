import { Router } from "express";
import { requireAuth } from "./auth";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Public: no auth needed — used by home page, admission page etc.
router.get("/settings/public", async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return res.json({
      admissionOpen: map["admission_open"] !== "false",
    });
  } catch {
    // If settings table doesn't exist yet, default to open
    return res.json({ admissionOpen: true });
  }
});

// Admin only: toggle admission
router.put("/settings/admission", requireAuth, async (req, res) => {
  const { open } = req.body as { open?: boolean };
  if (typeof open !== "boolean") {
    return res.status(400).json({ error: "open must be a boolean" });
  }

  await db
    .insert(settingsTable)
    .values({ key: "admission_open", value: open ? "true" : "false" })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: open ? "true" : "false", updatedAt: new Date() },
    });

  return res.json({ admissionOpen: open });
});

export default router;
