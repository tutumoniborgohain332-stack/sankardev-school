export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentsTable, staffTable, admissionsTable, galleryTable, newsTable } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  const [
    [studentCount],
    [staffCount],
    [pendingAdm],
    [approvedAdm],
    [rejectedAdm],
    [galleryCount],
    [newsCount],
  ] = await Promise.all([
    db.select({ count: count() }).from(studentsTable),
    db.select({ count: count() }).from(staffTable),
    db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "pending")),
    db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "approved")),
    db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "rejected")),
    db.select({ count: count() }).from(galleryTable),
    db.select({ count: count() }).from(newsTable),
  ]);

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
