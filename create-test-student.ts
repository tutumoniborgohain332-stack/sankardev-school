import { db } from "./src/lib/db";
import { usersTable, studentsTable } from "./src/lib/db/schema";
import { hashPassword } from "./src/lib/auth";

async function main() {
  const pwd = await hashPassword("student123");
  const [user] = await db.insert(usersTable).values({
    username: "teststudent",
    passwordHash: pwd,
    role: "student",
    isActive: true,
  }).returning();

  await db.insert(studentsTable).values({
    userId: user.id,
    admissionNumber: "STU-001",
    firstName: "Test",
    lastName: "Student",
    dateOfBirth: new Date("2010-01-01"),
    gender: "male",
    bloodGroup: "O+",
    status: "active",
  });
  console.log("Created student with username: teststudent, password: student123");
  process.exit(0);
}
main();
