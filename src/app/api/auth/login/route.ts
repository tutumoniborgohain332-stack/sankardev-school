import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    if (typeof username !== "string" || typeof password !== "string" || username.length > 100 || password.length > 100) {
      return NextResponse.json({ error: "Invalid payload format or length exceeded" }, { status: 400 });
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

    // Strict Role Enforcement
    if (role) {
      if (role === "student" && user.role !== "student") {
        return NextResponse.json({ error: "Access denied. Please use the Staff Login portal." }, { status: 403 });
      }
      if (role === "staff" && user.role === "student") {
        return NextResponse.json({ error: "Access denied. Please use the Student Login portal." }, { status: 403 });
      }
    }

    await setSession(user.id, user.role);

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
