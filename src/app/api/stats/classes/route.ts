import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentsTable } from "@/lib/db/schema";
import { count } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      className: studentsTable.className,
      count: count(),
    })
    .from(studentsTable)
    .groupBy(studentsTable.className);

  return NextResponse.json(rows.map(r => ({ className: r.className, count: r.count })));
}
