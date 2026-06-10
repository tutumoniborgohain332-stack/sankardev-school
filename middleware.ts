import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_SECRET = process.env.AUTH_SECRET;
const DEV_SECRET = SESSION_SECRET || "default_dev_secret_key_1234567890";

async function verifyToken(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signatureHex] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(DEV_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const payloadData = encoder.encode(payload);
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadData);
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignatureHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (computedSignatureHex.length !== signatureHex.length) return null;
    
    let mismatch = 0;
    for (let i = 0; i < computedSignatureHex.length; i++) {
      mismatch |= computedSignatureHex.charCodeAt(i) ^ signatureHex.charCodeAt(i);
    }

    if (mismatch !== 0) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("school_session")?.value;
  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isStaffRoute = path.startsWith("/portal/staff");
  const isStudentRoute = path.startsWith("/portal/student");

  if (isAdminRoute || isStaffRoute || isStudentRoute) {
    if (!token) {
      if (isStudentRoute) return NextResponse.redirect(new URL("/login/student", request.url));
      return NextResponse.redirect(new URL("/login/staff", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (isStudentRoute) return NextResponse.redirect(new URL("/login/student", request.url));
      return NextResponse.redirect(new URL("/login/staff", request.url));
    }

    try {
      const [, role] = payload.split(":");
      
      const isPrivileged = ["admin", "principal", "vice_principal"].includes(role);
      const isStaff = isPrivileged || role === "staff";

      if (isAdminRoute && !isPrivileged) {
        return NextResponse.redirect(new URL(isStaff ? "/portal/staff" : "/login/staff", request.url));
      }

      if (isStaffRoute && !isStaff) {
        return NextResponse.redirect(new URL("/login/staff", request.url));
      }

      if (isStudentRoute && role !== "student") {
        return NextResponse.redirect(new URL("/login/student", request.url));
      }
    } catch (e) {
      if (isStudentRoute) return NextResponse.redirect(new URL("/login/student", request.url));
      return NextResponse.redirect(new URL("/login/staff", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/staff/:path*", "/portal/student/:path*"],
};
