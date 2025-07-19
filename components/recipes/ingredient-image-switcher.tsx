// components/recipe/ingredient-image-switcher.tsx
'use client'

import { useState } from 'react'

interface IngredientImageSwitcherProps {
  image1: string | null
  image2: string | null
  alt: string
}

export function IngredientImageSwitcher({
  image1,
  image2,
  alt,
}: IngredientImageSwitcherProps) {
  const [activeImage, setActiveImage] = useState<'image1' | 'image2'>('image1')

  const handleSwitchImage = () => {
    if (image2) {
      setActiveImage(prev => (prev === 'image1' ? 'image2' : 'image1'))
    }
  }

  const mobileImageSrc = activeImage === 'image1' ? image1 : image2

  if (!image1) return null

  return (
    <div
      // ADDED justify-center to center the image on mobile
      className="flex justify-center gap-2"
      onDoubleClick={handleSwitchImage}
      title="Double-tap to switch image"
    >
      {/* Mobile-first image */}
      <img
        src={mobileImageSrc!}
        alt={alt}
        // INCREASED size from w-16 h-16 to w-48 h-48 for a better look
        className="w-48 h-48 object-cover rounded-md border md:hidden"
      />

      {/* Desktop images (no change here) */}
      <img
        src={image1}
        alt={alt}
        className="hidden md:block w-24 h-24 object-cover rounded-md border"
      />
      {image2 && (
        <img
          src={image2}
          alt={alt}
          className="hidden md:block w-24 h-24 object-cover rounded-md border"
        />
      )}
    </div>
  )
}
