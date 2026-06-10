import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const [user] = await db
      .select({ id: usersTable.id, passwordHash: usersTable.passwordHash, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    const isValid = await verifyPassword(password, user?.passwordHash || "");
    if (!user || !isValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    await setSession(user.id, user.role);

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
