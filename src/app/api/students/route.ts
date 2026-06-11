export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentsTable, usersTable, insertStudentSchema } from "@/lib/db/schema";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { getSession, isPrivilegedRole, hashPassword } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const className = searchParams.get("class");
  const search = searchParams.get("search");

  const conditions: SQL[] = [];
  
  // If the user is a student, restrict to their own records.
  if (user.role === "student") {
    conditions.push(eq(studentsTable.userId, user.userId));
  } else {
    if (className) conditions.push(eq(studentsTable.className, className));
    if (search) conditions.push(ilike(studentsTable.studentName, `%${search}%`));
  }

  const students = conditions.length
    ? await db.select().from(studentsTable).where(and(...conditions))
    : await db.select().from(studentsTable);

  return NextResponse.json(
    students.map((s) => ({
      ...s,
      admissionDate: s.admissionDate ?? new Date().toISOString().split("T")[0],
    }))
  );
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rawData = await request.json();
    const { password, ...studentData } = rawData;

    if (studentData.username && !password) {
      return NextResponse.json({ error: "Password is required when a username is provided to create a login." }, { status: 400 });
    }
    
    // Server-side validation
    const parsedData = insertStudentSchema.parse(studentData);

    const result = await db.transaction(async (tx) => {
      let userId = null;
      
      if (parsedData.username && password) {
        const [newUser] = await tx.insert(usersTable).values({
          username: parsedData.username,
          passwordHash: await hashPassword(password),
          role: "student",
          name: parsedData.studentName,
        }).returning({ id: usersTable.id });
        userId = newUser.id;
      }

      const [student] = await tx.insert(studentsTable).values({
        ...parsedData,
        userId: userId,
      }).returning();
      
      if (userId) {
        await tx.update(usersTable).set({ referenceId: student.id.toString() }).where(eq(usersTable.id, userId));
      }
      
      return student;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
