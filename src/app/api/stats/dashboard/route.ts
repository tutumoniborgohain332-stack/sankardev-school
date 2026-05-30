import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentsTable, staffTable, admissionsTable, galleryTable, newsTable } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  const [studentCount] = await db.select({ count: count() }).from(studentsTable);
  const [staffCount] = await db.select({ count: count() }).from(staffTable);
  const [pendingAdm] = await db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "pending"));
  const [approvedAdm] = await db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "approved"));
  const [rejectedAdm] = await db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "rejected"));
  const [galleryCount] = await db.select({ count: count() }).from(galleryTable);
  const [newsCount] = await db.select({ count: count() }).from(newsTable);

  return NextResponse.json({
    totalStudents: studentCount?.count ?? 0,
    totalStaff: staffCount?.count ?? 0,
    pendingAdmissions: pendingAdm?.count ?? 0,
    totalGalleryItems: galleryCount?.count ?? 0,
    recentNewsCount: newsCount?.count ?? 0,
    maleStudents: 0,
    femaleStudents: 0,
    approvedAdmissions: approvedAdm?.count ?? 0,
    rejectedAdmissions: rejectedAdm?.count ?? 0,
  });
}
