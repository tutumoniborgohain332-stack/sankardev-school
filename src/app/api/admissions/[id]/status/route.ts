import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admissionsTable, studentsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, isPrivilegedRole } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { status } = await request.json();
    const [admission] = await db.select().from(admissionsTable).where(eq(admissionsTable.id, Number((await params).id))).limit(1);
    
    if (!admission) return NextResponse.json({ error: "Admission not found" }, { status: 404 });

    // Update status
    const [updated] = await db.update(admissionsTable)
      .set({ status })
      .where(eq(admissionsTable.id, Number((await params).id)))
      .returning();

    // If approved, create a student record automatically
    if (status === "approved" && admission.status !== "approved") {
      await db.insert(studentsTable).values({
        studentName: admission.studentName,
        fatherName: admission.fatherName,
        motherName: admission.motherName,
        permanentAddress: admission.permanentAddress,
        presentAddress: admission.presentAddress,
        dateOfBirth: admission.dateOfBirth,
        caste: admission.caste,
        religion: admission.religion,
        className: admission.appliedForClass,
        bloodGroup: admission.bloodGroup,
        nationality: admission.nationality,
        guardianName: admission.guardianName,
        guardianRelation: admission.guardianRelation,
        guardianPhone: admission.fatherPhone,
        previousSchool: admission.previousSchoolName,
        admissionDate: new Date().toISOString().split("T")[0],
        rollNumber: `TEMP-${Date.now()}`,
        apaarId: `T-APAAR-${Date.now()}`
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
