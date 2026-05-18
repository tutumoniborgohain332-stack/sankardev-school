import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  qualification: text("qualification"),
  subject: text("subject"),
  phone: text("phone"),
  email: text("email"),
  joinDate: text("join_date").notNull(),
  photoUrl: text("photo_url"),
  username: text("username"),
  isHeadmaster: boolean("is_headmaster").notNull().default(false),
  userId: integer("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type StaffMember = typeof staffTable.$inferSelect;
