import { pgTable, serial, integer, text, date, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
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
  return {
    studentIdx: index("attendance_student_id_idx").on(table.studentId),
    dateIdx: index("attendance_date_idx").on(table.date),
    classIdx: index("attendance_class_idx").on(table.className),
    uniqueStudentDate: uniqueIndex("attendance_student_date_unique").on(table.studentId, table.date),
  };
});

export type Attendance = typeof attendanceTable.$inferSelect;
export type InsertAttendance = typeof attendanceTable.$inferInsert;
