import { pgTable, text, serial, timestamp, integer, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const SubjectResultSchema = z.object({
  subject: z.string(),
  maxMarks: z.number(),
  marksObtained: z.number(),
  grade: z.string(),
});

export type SubjectResult = z.infer<typeof SubjectResultSchema>;

export const resultsTable = pgTable("results", {
  id: serial("id").primaryKey(),
  rollNumber: text("roll_number").notNull(),
  studentName: text("student_name").notNull(),
  className: text("class_name").notNull(),
  section: text("section"),
  examType: text("exam_type").notNull(), // "Mid-term" | "Final" | "Unit-Test"
  academicYear: text("academic_year").notNull(), // e.g. "2024-25"
  subjects: jsonb("subjects").notNull().$type<SubjectResult[]>(),
  totalMarks: integer("total_marks").notNull(),
  marksObtained: integer("marks_obtained").notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  result: text("result").notNull(), // "Pass" | "Fail"
  rank: integer("rank"),
  remarks: text("remarks"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    rollClassYearIdx: index("results_roll_class_year_idx").on(table.rollNumber, table.className, table.academicYear),
    examIdx: index("results_exam_idx").on(table.examType),
  };
});

export const insertResultSchema = createInsertSchema(resultsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof resultsTable.$inferSelect;
