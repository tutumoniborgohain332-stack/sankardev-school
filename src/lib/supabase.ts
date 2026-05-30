import { createClient } from "@supabase/supabase-js";
import imageCompression from "browser-image-compression";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImageWithCompression(file: File, bucketName: string = "assets"): Promise<string | null> {
  try {
    const isImage = file.type.startsWith("image/");
    let fileToUpload = file;

    // Compress if it's an image
    if (isImage) {
      const options = {
        maxSizeMB: 1, // Max size 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

export async function deleteImageFromSupabase(publicUrl: string, bucketName: string = "assets"): Promise<boolean> {
  try {
    // Extract file path from public URL
    // Public URL format: https://[project].supabase.co/storage/v1/object/public/[bucketName]/[filePath]
    const urlParts = publicUrl.split(`/public/${bucketName}/`);
    if (urlParts.length !== 2) return false;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}
