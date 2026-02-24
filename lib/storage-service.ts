/**
 * Upload an image to Vercel Blob storage
 * @param file - The file to upload
 * @param folder - The folder path (e.g., "rewards", "products")
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(file: File, folder = "rewards"): Promise<string> {
  try {
    // Create form data for the API
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folder)

    // Call the upload API
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Upload failed")
    }

    const result = await response.json()
    console.log("[v0] Image uploaded to Blob:", result.url)

    return result.url
  } catch (error) {
    console.error("[v0] Error uploading image:", error)
    throw error
  }
}

/**
 * Delete an image from Vercel Blob storage
 * @param imageUrl - The full download URL of the image
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const response = await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imageUrl }),
    })

    if (!response.ok) {
      console.error("[v0] Failed to delete image")
    } else {
      console.log("[v0] Image deleted:", imageUrl)
    }
  } catch (error) {
    console.error("[v0] Error deleting image:", error)
    // Don't throw - image might not exist
  }
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "نوع الملف غير مدعوم. يرجى استخدام JPG, PNG, GIF, أو WebP",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "حجم الملف كبير جداً. الحد الأقصى 5MB",
    }
  }

  return { valid: true }
}
