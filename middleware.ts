import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("school_session")?.value;
  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isStaffRoute = path.startsWith("/portal/staff");

  if (isAdminRoute || isStaffRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login/staff", request.url));
    }

    try {
      const [payload] = token.split(".");
      if (!payload) throw new Error("Invalid token format");

      const [, role] = payload.split(":");
      
      const isPrivileged = ["admin", "principal", "vice_principal"].includes(role);
      const isStaff = isPrivileged || role === "staff";

      if (isAdminRoute && !isPrivileged) {
        return NextResponse.redirect(new URL(isStaff ? "/portal/staff" : "/login/staff", request.url));
      }

      if (isStaffRoute && !isStaff) {
        return NextResponse.redirect(new URL("/login/staff", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/login/staff", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/staff/:path*"],
};
