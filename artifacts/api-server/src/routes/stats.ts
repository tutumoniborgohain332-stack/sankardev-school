import { Router } from "express";
import { db, studentsTable, staffTable, admissionsTable, galleryTable, newsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/stats/dashboard", async (req, res) => {
  const [studentCount] = await db.select({ count: count() }).from(studentsTable);
  const [staffCount] = await db.select({ count: count() }).from(staffTable);
  const [pendingAdm] = await db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "pending"));
  const [approvedAdm] = await db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "approved"));
  const [rejectedAdm] = await db.select({ count: count() }).from(admissionsTable).where(eq(admissionsTable.status, "rejected"));
  const [galleryCount] = await db.select({ count: count() }).from(galleryTable);
  const [newsCount] = await db.select({ count: count() }).from(newsTable);

  return res.json({
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
});

router.get("/stats/classes", async (req, res) => {
  const rows = await db
    .select({
      className: studentsTable.className,
      count: count(),
    })
    .from(studentsTable)
    .groupBy(studentsTable.className);

  return res.json(rows.map(r => ({ className: r.className, count: r.count })));
});

export default router;
