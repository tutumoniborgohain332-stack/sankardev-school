import { pgTable, serial, integer, text, date, timestamp } from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

export const attendanceTable = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  date: date("date").notNull(),
  status: text("status").notNull().default("present"),
  className: text("class_name").notNull(),
  section: text("section"),
  markedBy: text("marked_by"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Attendance = typeof attendanceTable.$inferSelect;
export type InsertAttendance = typeof attendanceTable.$inferInsert;
