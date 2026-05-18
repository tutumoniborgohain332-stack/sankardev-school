import { Router } from "express";
import { db, galleryTable } from "@workspace/db";
import { eq, and, SQL } from "drizzle-orm";
import { CreateGalleryItemBody, DeleteGalleryItemParams, ListGalleryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/gallery", async (req, res) => {
  const parsed = ListGalleryQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const conditions: SQL[] = [];
  if (params.type) conditions.push(eq(galleryTable.type, params.type));
  if (params.category) conditions.push(eq(galleryTable.category, params.category));

  const items = conditions.length
    ? await db.select().from(galleryTable).where(and(...conditions))
    : await db.select().from(galleryTable);

  return res.json(items.map(i => ({
    ...i,
    uploadedAt: i.uploadedAt?.toISOString() ?? new Date().toISOString(),
  })));
});

router.post("/gallery", async (req, res) => {
  const parsed = CreateGalleryItemBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const [item] = await db.insert(galleryTable).values({
    title: parsed.data.title,
    type: parsed.data.type,
    url: parsed.data.url,
    thumbnailUrl: parsed.data.thumbnailUrl ?? null,
    category: parsed.data.category ?? null,
    description: parsed.data.description ?? null,
  }).returning();

  return res.status(201).json({
    ...item,
    uploadedAt: item.uploadedAt?.toISOString() ?? new Date().toISOString(),
  });
});

router.delete("/gallery/:id", async (req, res) => {
  const parsed = DeleteGalleryItemParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(galleryTable).where(eq(galleryTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
