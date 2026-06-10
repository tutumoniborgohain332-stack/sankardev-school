export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { galleryTable } from "@/lib/db/schema";

export async function GET() {
  try {
    await db.insert(galleryTable).values([
      {
        title: "School Campus Front",
        type: "photo",
        url: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200&q=80",
        category: "Infrastructure",
        description: "Our beautiful school campus.",
        isHero: false,
      },
      {
        title: "Annual Sports Day",
        type: "photo",
        url: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=1200&q=80",
        category: "Sports",
        description: "Students participating in sports.",
        isHero: false,
      }
    ]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

