import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic"; // Ensure it runs every time

export async function GET(req: Request) {
  // Security Check: Ensure the request comes from Vercel Cron
  // You need to set CRON_SECRET in Vercel Environment Variables
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized - Invalid Cron Secret', { status: 401 });
  }

  try {
    // Ping the Supabase database with a lightweight query
    // This tells Supabase the project is active and prevents auto-pausing
    await db.execute(sql`SELECT 1`);
    
    // Auto-delete complaints older than 7 days
    await db.execute(sql`DELETE FROM complaints WHERE created_at < NOW() - INTERVAL '7 days'`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Keepalive Ping Successful! Cleaned up old complaints." 
    });
  } catch (error) {
    console.error("Keepalive DB ping failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to ping database" }, 
      { status: 500 }
    );
  }
}
