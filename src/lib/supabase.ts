import imageCompression from "browser-image-compression";

export async function uploadImageWithCompression(file: File, bucketName: string = "assets"): Promise<string | null> {
  try {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      throw new Error("Only image files are allowed.");
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error("Invalid image extension. Allowed: jpg, jpeg, png, webp.");
    }

    const options = {
      maxSizeMB: 1, // Max size 1MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const fileToUpload = await imageCompression(file, options);

    const formData = new FormData();
    formData.append("file", fileToUpload);
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
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
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
