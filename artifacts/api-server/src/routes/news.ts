import { Router } from "express";
import { db, newsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateNewsBody, UpdateNewsBody, UpdateNewsParams, DeleteNewsParams, ListNewsQueryParams } from "@workspace/api-zod";
import { ensureBilingual } from "../lib/translate";

const router = Router();

router.get("/news", async (req, res) => {
  const parsed = ListNewsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const limit = params.limit ? Number(params.limit) : 100;

  const items = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt)).limit(limit);

  return res.json(items.map(n => ({
    ...n,
    publishedAt: n.publishedAt?.toISOString() ?? new Date().toISOString(),
    isImportant: n.isImportant ?? false,
  })));
});

router.post("/news", async (req, res) => {
  const parsed = CreateNewsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const bilingual = await ensureBilingual(parsed.data.title, parsed.data.content);

  const [item] = await db.insert(newsTable).values({
    title: bilingual.titleEn,
    content: bilingual.contentEn,
    titleAssamese: bilingual.titleAs,
    contentAssamese: bilingual.contentAs,
    category: parsed.data.category ?? null,
    isImportant: parsed.data.isImportant ?? false,
  }).returning();

  return res.status(201).json({
    ...item,
    publishedAt: item.publishedAt?.toISOString() ?? new Date().toISOString(),
    isImportant: item.isImportant ?? false,
  });
});

router.patch("/news/:id", async (req, res) => {
  const paramParsed = UpdateNewsParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateNewsBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: "Invalid input" });

  let updateData: Partial<typeof newsTable.$inferInsert> = { ...bodyParsed.data };

  if (bodyParsed.data.title || bodyParsed.data.content) {
    const existing = await db.select().from(newsTable).where(eq(newsTable.id, paramParsed.data.id)).limit(1);
    const currentTitle = bodyParsed.data.title ?? existing[0]?.title ?? "";
    const currentContent = bodyParsed.data.content ?? existing[0]?.content ?? "";
    const bilingual = await ensureBilingual(currentTitle, currentContent);
    updateData.title = bilingual.titleEn;
    updateData.content = bilingual.contentEn;
    updateData.titleAssamese = bilingual.titleAs;
    updateData.contentAssamese = bilingual.contentAs;
  }

  const [item] = await db
    .update(newsTable)
    .set(updateData)
    .where(eq(newsTable.id, paramParsed.data.id))
    .returning();

  if (!item) return res.status(404).json({ error: "News item not found" });
  return res.json({
    ...item,
    publishedAt: item.publishedAt?.toISOString() ?? new Date().toISOString(),
    isImportant: item.isImportant ?? false,
  });
});

router.delete("/news/:id", async (req, res) => {
  const parsed = DeleteNewsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  await db.delete(newsTable).where(eq(newsTable.id, parsed.data.id));
  return res.status(204).send();
});

export default router;
