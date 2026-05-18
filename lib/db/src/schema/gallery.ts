import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull().default("photo"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category"),
  description: text("description"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({ id: true, uploadedAt: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryItem = typeof galleryTable.$inferSelect;
