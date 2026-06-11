import { NextResponse } from "next/server";
import { getSession, isStaffRole } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucketName = formData.get("bucketName") as string || "assets";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const isImage = file.type.startsWith("image/");
    if (!isImage) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ error: "Invalid image extension." }, { status: 400 });
    }

    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user || !isStaffRole(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { publicUrl, bucketName = "assets" } = await request.json();
    
    const urlParts = publicUrl.split(`/public/${bucketName}/`);
    if (urlParts.length !== 2) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    
    const filePath = urlParts[1];

    // Prevent path traversal: only allow paths under the uploads/ directory
    if (!filePath.startsWith("uploads/") || filePath.includes("..") || filePath.includes("%2e")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
