import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable, studentsTable } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const pwd = await hashPassword("student123");
    const [user] = await db.insert(usersTable).values({
      username: "demostudent3",
      passwordHash: pwd,
      role: "student",
      name: "Demo Student 2",
      referenceId: "DEMO-002",
    }).returning();

    await db.insert(studentsTable).values({
      userId: user.id,
      studentName: "Demo Student",
      fatherName: "Father",
      motherName: "Mother",
      className: "Class 10",
      rollNumber: "18",
      apaarId: "APAAR-123",
      admissionDate: new Date().toISOString(),
      dateOfBirth: "2010-01-01",
      bloodGroup: "O+",
    });

    return NextResponse.json({ success: true, message: "Created demostudent / student123" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
