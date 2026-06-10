import { pgTable, text, serial, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  permanentAddress: text("permanent_address"),
  presentAddress: text("present_address"),
  dateOfBirth: text("date_of_birth"),
  caste: text("caste"),
  religion: text("religion"),
  className: text("class_name").notNull(),
  section: text("section"),
  rollNumber: text("roll_number").notNull(),
  apaarId: text("apaar_id").notNull(),
  bloodGroup: text("blood_group"),
  nationality: text("nationality"),
  guardianName: text("guardian_name"),
  guardianRelation: text("guardian_relation"),
  guardianPhone: text("guardian_phone"),
  previousSchool: text("previous_school"),
  admissionDate: text("admission_date").notNull(),
  photoUrl: text("photo_url"),
  username: text("username"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    classIdx: index("students_class_idx").on(table.className),
    rollIdx: index("students_roll_idx").on(table.rollNumber),
    sectionIdx: index("students_section_idx").on(table.section),
  };
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
