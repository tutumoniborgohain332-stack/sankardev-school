import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  titleAssamese: text("title_assamese"),
  contentAssamese: text("content_assamese"),
  category: text("category"),
  isImportant: boolean("is_important").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true, publishedAt: true, updatedAt: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type NewsItem = typeof newsTable.$inferSelect;
