export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { staffTable, usersTable, insertStaffSchema } from "@/lib/db/schema";
import { getSession, isPrivilegedRole, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const staffMembers = await db.select().from(staffTable);
  return NextResponse.json(staffMembers);
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isPrivilegedRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rawData = await request.json();
    const { password, ...staffData } = rawData;
    
    // Privilege Escalation Prevention
    if (staffData.isHeadmaster && user.role !== "principal" && user.role !== "admin") {
      return NextResponse.json({ error: "Only the Principal or Admin can create a Headmaster" }, { status: 403 });
    }

    if (staffData.username && !password) {
      return NextResponse.json({ error: "Password is required when a username is provided to create a login." }, { status: 400 });
    }
    
    // Server-side validation
    const parsedData = insertStaffSchema.parse(staffData);

    const result = await db.transaction(async (tx) => {
      let userId = null;
      
      if (parsedData.username && password) {
        const [newUser] = await tx.insert(usersTable).values({
          username: parsedData.username,
          passwordHash: await hashPassword(password),
          role: parsedData.isHeadmaster ? "principal" : "staff",
          name: parsedData.name,
        }).returning({ id: usersTable.id });
        userId = newUser.id;
      }

      const [staff] = await tx.insert(staffTable).values({
        ...parsedData,
        userId: userId,
      }).returning();
      
      if (userId) {
        await tx.update(usersTable).set({ referenceId: staff.id.toString() }).where(eq(usersTable.id, userId));
      }
      
      return staff;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

