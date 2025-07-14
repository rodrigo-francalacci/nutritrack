
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false, // Use false for real-time updates
  apiVersion: '2023-05-03', // Use current date for the API version
})

// Helper function to upload image as Sanity asset
export const uploadImageAsset = async (file: File): Promise<any> => {
  try {
    const asset = await sanityClient.assets.upload('image', file, {
      filename: file.name,
    })
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      }
    }
  } catch (error) {
    console.error('Error uploading image asset:', error)
    throw error
  }
}

// Helper function to upload image from base64 as Sanity asset
export const uploadBase64ImageAsset = async (base64: string, filename: string = 'image.jpg'): Promise<any> => {
  try {
    // Convert base64 to blob
    const response = await fetch(base64)
    const blob = await response.blob()
    
    const asset = await sanityClient.assets.upload('image', blob, {
      filename,
    })
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      }
    }
  } catch (error) {
    console.error('Error uploading base64 image asset:', error)
    throw error
  }
}

// Helper function to get image URL from Sanity asset
export const getImageUrl = (imageAsset: any): string | null => {
  if (!imageAsset?.asset?._ref) return null
  
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
  
  // Extract asset ID from reference
  const assetId = imageAsset.asset._ref
  
  // Sanity asset URLs follow the format: 
  // https://cdn.sanity.io/images/{projectId}/{dataset}/{hash}-{dimensions}.{format}
  // The assetId already contains dimensions and format info (e.g., image-hash-1x1-png)
  // We need to extract the hash part and reconstruct the URL properly
  
  // Extract the hash, dimensions, and format from the asset ID
  // Format: image-{hash}-{width}x{height}-{format}
  const assetParts = assetId.replace('image-', '').split('-')
  if (assetParts.length >= 3) {
    const hash = assetParts.slice(0, -2).join('-')
    const dimensions = assetParts[assetParts.length - 2]
    const format = assetParts[assetParts.length - 1]
    
    // Construct the proper URL
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${hash}-${dimensions}.${format}`
  }
  
  // Fallback: try to use the asset ID as-is (shouldn't happen with proper asset IDs)
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId.replace('image-', '')}`
}

// Helper function to generate unique IDs
export const generateSanityId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to convert dates to ISO strings for Sanity
export const formatDateForSanity = (date: Date | string) => {
  if (typeof date === 'string') {
    return new Date(date).toISOString()
  }
  return date.toISOString()
}

// Helper function to convert Sanity dates back to JS dates
export const parseSanityDate = (dateString: string) => {
  return new Date(dateString)
}
