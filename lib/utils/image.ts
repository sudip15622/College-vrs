/**
 * Image utility functions for handling uploads and conversions
 */

/**
 * Convert a File object to base64 string
 * @param file - The file to convert
 * @returns Promise resolving to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get image dimensions from a file
 * @param file - The image file
 * @returns Promise resolving to {width, height}
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.width,
        height: img.height,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Compress image file if it exceeds a certain size
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum size in KB (default: 500KB)
 * @param quality - Compression quality 0-1 (default: 0.8)
 * @returns Promise resolving to compressed file or original if already small enough
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  quality: number = 0.8
): Promise<File> {
  // If file is already small enough, return it
  if (file.size <= maxSizeKB * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height
        const maxDimension = 1920

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}

/**
 * TODO: Upload image to cloud storage (Cloudinary, AWS S3, etc.)
 * This is a placeholder for future implementation
 * 
 * @param file - The image file to upload
 * @returns Promise resolving to {url, publicId}
 */
export async function uploadToCloudStorage(
  file: File
): Promise<{ url: string; publicId: string }> {
  // TODO: Implement actual cloud storage upload
  // For now, return base64 as a temporary solution
  const base64 = await fileToBase64(file)
  
  return {
    url: base64,
    publicId: '', // Would be provided by cloud storage service
  }
}
