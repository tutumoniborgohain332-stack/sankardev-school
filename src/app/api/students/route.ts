import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentsTable } from "@/lib/db/schema";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const className = searchParams.get("class");
  const search = searchParams.get("search");

  const conditions: SQL[] = [];
  if (className) conditions.push(eq(studentsTable.className, className));
  if (search) conditions.push(ilike(studentsTable.studentName, `%${search}%`));

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
    const data = await request.json();
    const [student] = await db.insert(studentsTable).values({
      ...data,
      password: undefined,
    }).returning();

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
