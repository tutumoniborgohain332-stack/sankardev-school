import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number"),
  classRollNumber: text("class_roll_number"),
  studentName: text("student_name").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  permanentAddress: text("permanent_address"),
  presentAddress: text("present_address"),
  pinCode: text("pin_code"),
  guardianName: text("guardian_name"),
  guardianRelation: text("guardian_relation"),
  dateOfBirth: text("date_of_birth"),
  age: text("age"),
  caste: text("caste"),
  religion: text("religion"),
  nationality: text("nationality"),
  bloodGroup: text("blood_group"),
  previousSchoolName: text("previous_school_name"),
  previousSchoolAddress: text("previous_school_address"),
  previousClass: text("previous_class"),
  previousClassResult: text("previous_class_result"),
  reasonForLeaving: text("reason_for_leaving"),
  appliedForClass: text("applied_for_class").notNull(),
  apaarId: text("apaar_id"),
  siblingName: text("sibling_name"),
  siblingClass: text("sibling_class"),
  siblingSection: text("sibling_section"),
  specialCategory: text("special_category"),
  fatherPhone: text("father_phone"),
  motherPhone: text("mother_phone"),
  status: text("status").notNull().default("pending"),
  remarks: text("remarks"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => {
  return {
    statusIdx: index("admissions_status_idx").on(table.status),
  };
});

export const insertAdmissionSchema = createInsertSchema(admissionsTable).omit({ id: true, submittedAt: true, updatedAt: true });
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type AdmissionApplication = typeof admissionsTable.$inferSelect;
