import imageCompression from "browser-image-compression";

export async function uploadImageWithCompression(file: File, bucketName: string = "assets"): Promise<string | null> {
  try {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      throw new Error("Only image and video files are allowed.");
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "mp4", "webm", "ogg"];
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error(`Invalid file extension: ${fileExt}. Allowed: jpg, jpeg, png, webp, mp4, webm, ogg.`);
    }

    let fileToUpload = file;

    if (isImage) {
      const options = {
        maxSizeMB: 1, // Max size 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload, file.name);
    formData.append("bucketName", bucketName);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Upload failed");
    }

    const { url } = await res.json();
    return url;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteImageFromSupabase(publicUrl: string, bucketName: string = "assets"): Promise<boolean> {
  try {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicUrl, bucketName }),
    });

    return res.ok;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}
