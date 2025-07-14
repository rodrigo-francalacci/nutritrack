
// Image handling utilities for Sanity assets and clipboard pasting

// Handle clipboard paste and return File object for Sanity asset upload
export const handleClipboardPaste = async (
  event: ClipboardEvent
): Promise<File | null> => {
  const items = event.clipboardData?.items
  if (!items) return null

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        return file
      }
    }
  }
  return null
}

// Convert file to base64 (kept for backward compatibility)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Image compression utility optimized for product photos
export const compressImage = async (
  file: File,
  options: {
    maxSizeKB?: number
    maxWidth?: number
    maxHeight?: number
    quality?: number
    maintainAspectRatio?: boolean
  } = {}
): Promise<File> => {
  const {
    maxSizeKB = 500, // Target max 500KB for mobile photos
    maxWidth = 1200, // Max width for product photos (good for label readability)
    maxHeight = 1200, // Max height for product photos
    quality = 0.85, // Start with high quality for product identification
    maintainAspectRatio = true
  } = options

  // If file is already small enough, return as-is
  if (file.size <= maxSizeKB * 1024) {
    return file
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate optimal dimensions
        let { width, height } = calculateOptimalDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        )

        canvas.width = width
        canvas.height = height

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw the compressed image
        ctx.drawImage(img, 0, 0, width, height)

        // Try different quality levels to meet size requirements
        let currentQuality = quality
        let attempts = 0
        const maxAttempts = 5

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create compressed image'))
                return
              }

              // Check if we've achieved the target size or tried enough
              if (blob.size <= maxSizeKB * 1024 || attempts >= maxAttempts || currentQuality <= 0.3) {
                // Convert blob to File
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                // Reduce quality and try again
                attempts++
                currentQuality = Math.max(0.3, currentQuality - 0.1) // Don't go below 30% for product photos
                tryCompress()
              }
            },
            file.type,
            currentQuality
          )
        }

        tryCompress()
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Calculate optimal dimensions while maintaining aspect ratio
const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean
): { width: number; height: number } => {
  if (!maintainAspectRatio) {
    return { width: maxWidth, height: maxHeight }
  }

  const aspectRatio = originalWidth / originalHeight
  let width = originalWidth
  let height = originalHeight

  // Scale down if larger than max dimensions
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  }
}

// Get optimal compression settings based on file size and type
export const getCompressionSettings = (file: File) => {
  const sizeInMB = file.size / (1024 * 1024)
  
  // For very large files (>5MB), be more aggressive
  if (sizeInMB > 5) {
    return {
      maxSizeKB: 400,
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.75
    }
  }
  
  // For medium files (1-5MB), moderate compression
  if (sizeInMB > 1) {
    return {
      maxSizeKB: 500,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8
    }
  }
  
  // For smaller files, minimal compression (preserve quality for product photos)
  return {
    maxSizeKB: 600,
    maxWidth: 1400,
    maxHeight: 1400,
    quality: 0.9
  }
}

// Upload image file as Sanity asset via API with compression
export const uploadImageToSanity = async (file: File, showProgress?: (progress: string) => void): Promise<any> => {
  try {
    // Show compression progress
    showProgress?.('Compressing image...')
    
    // Get optimal compression settings
    const compressionSettings = getCompressionSettings(file)
    
    // Compress the image before upload
    const compressedFile = await compressImage(file, compressionSettings)
    
    // Log compression results
    const originalSizeKB = Math.round(file.size / 1024)
    const compressedSizeKB = Math.round(compressedFile.size / 1024)
    const compressionRatio = Math.round((1 - compressedFile.size / file.size) * 100)
    
    console.log(`Image compression: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction)`)
    
    // Show upload progress
    showProgress?.('Uploading image...')
    
    const formData = new FormData()
    formData.append('image', compressedFile)
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    return response.json()
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export const generateUniqueId = (): string => {
  // Generate unique ID from timestamp converted to base36
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const isValidImageUrl = (url: string): boolean => {
  return url.startsWith('data:image/') || url.startsWith('http') || url.startsWith('https://cdn.sanity.io')
}

// Check if value is a Sanity asset object
export const isSanityAsset = (value: any): boolean => {
  return value?._type === 'image' && value?.asset?._ref
}
