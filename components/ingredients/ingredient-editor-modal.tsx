
'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ImageIcon, Upload, Settings2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { handleClipboardPaste, uploadImageToSanity, isValidImageUrl, isSanityAsset } from '@/lib/utils/image-utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Ingredient } from '@/lib/types/database'

interface IngredientEditorModalProps {
  ingredient: Ingredient | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string | null, updates: Partial<Ingredient>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onManageUnits: (id: string) => void
}

export function IngredientEditorModal({
  ingredient,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onManageUnits
}: IngredientEditorModalProps) {
  const [formData, setFormData] = useState<Partial<Ingredient>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: string}>({})
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name || '',
        protein: ingredient.protein || 0,
        carbs: ingredient.carbs || 0,
        fats: ingredient.fats || 0,
        calories: ingredient.calories || 0,
        fiber: ingredient.fiber || 0,
        notes: ingredient.notes || '',
        image1: ingredient.image1,
        image2: ingredient.image2,
      })
    } else {
      // Clear form for new ingredient
      setFormData({
        name: '',
        protein: 0,
        carbs: 0,
        fats: 0,
        calories: 0,
        fiber: 0,
        notes: '',
        image1: null,
        image2: null,
      })
    }
    // Clear any previous upload progress
    setUploadProgress({})
  }, [ingredient])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(ingredient?.id || null, formData)
      toast({
        title: 'Success',
        description: ingredient ? 'Ingredient updated successfully' : 'Ingredient created successfully',
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${ingredient ? 'update' : 'create'} ingredient`,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!ingredient) return

    setDeleting(true)
    try {
      await onDelete(ingredient.id)
      toast({
        title: 'Success',
        description: 'Ingredient deleted successfully',
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete ingredient',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleImageUpload = async (file: File, imageSlot: 'image1' | 'image2') => {
    try {
      // Validate file size (warn if very large)
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > 10) {
        toast({
          title: 'Large File',
          description: `File is ${fileSizeMB.toFixed(1)}MB. This may take a moment to compress and upload.`,
        })
      }

      // Upload with progress tracking
      const imageAsset = await uploadImageToSanity(file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [imageSlot]: progress }))
      })
      
      setFormData(prev => ({ ...prev, [imageSlot]: imageAsset }))
      
      // Clear progress and show success
      setUploadProgress(prev => ({ ...prev, [imageSlot]: '' }))
      toast({
        title: 'Success',
        description: 'Image compressed and uploaded successfully',
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadProgress(prev => ({ ...prev, [imageSlot]: '' }))
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      })
    }
  }

  const handleImagePaste = async (event: ClipboardEvent, imageSlot: 'image1' | 'image2') => {
    event.preventDefault()
    const file = await handleClipboardPaste(event)
    if (file) {
      await handleImageUpload(file, imageSlot)
    }
  }

  const removeImage = (imageSlot: 'image1' | 'image2') => {
    setFormData(prev => ({ ...prev, [imageSlot]: null }))
  }

  const ImageSlot = ({ 
    image, 
    imageSlot, 
    label 
  }: { 
    image?: string | any | null
    imageSlot: 'image1' | 'image2'
    label: string 
  }) => {
    // Determine the display URL
    const getDisplayUrl = (imageData: any): string | null => {
      if (!imageData) return null
      
      // If it's already a string URL (from API response)
      if (typeof imageData === 'string') {
        return imageData
      }
      
      // If it's a Sanity asset object, we'll show a placeholder
      // since we don't have URL resolution in the frontend
      if (isSanityAsset(imageData)) {
        return null // Will show as "uploading" or success state
      }
      
      return null
    }

    const displayUrl = getDisplayUrl(image)
    const hasImage = displayUrl || isSanityAsset(image)
    const isUploading = uploadProgress[imageSlot]

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div
          className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer group"
          onClick={() => {
            if (imageSlot === 'image1') {
              fileInput1Ref.current?.click()
            } else {
              fileInput2Ref.current?.click()
            }
          }}
          onPaste={(e) => handleImagePaste(e as any, imageSlot)}
          tabIndex={0}
        >
          {isUploading ? (
            <div className="flex items-center justify-center h-full bg-blue-50 text-blue-600 rounded-lg">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <div className="text-xs">{isUploading}</div>
              </div>
            </div>
          ) : hasImage ? (
            <>
              <div className="relative w-full h-full">
                {displayUrl ? (
                  <Image
                    src={displayUrl}
                    alt={`${formData.name} ${label}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-green-50 text-green-600 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-xs">Image uploaded</div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(imageSlot)
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-xs">Click or paste image</div>
              </div>
            </div>
          )}
        </div>
        <input
          ref={imageSlot === 'image1' ? fileInput1Ref : fileInput2Ref}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleImageUpload(file, imageSlot)
            }
          }}
          className="hidden"
        />
      </div>
    )
  }

  // Allow modal to open for both editing and creating

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ingredient Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter ingredient name"
                className="mt-1"
              />
            </div>

            {/* Nutritional Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="protein">Protein (g/g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.01"
                  value={formData.protein || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g/g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.01"
                  value={formData.carbs || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fats">Fats (g/g)</Label>
                <Input
                  id="fats"
                  type="number"
                  step="0.01"
                  value={formData.fats || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fats: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories (kcal/g)</Label>
                <Input
                  id="calories"
                  type="number"
                  step="0.01"
                  value={formData.calories || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fiber">Fiber (g/g)</Label>
              <Input
                id="fiber"
                type="number"
                step="0.01"
                value={formData.fiber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fiber: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <ImageSlot 
              image={formData.image1} 
              imageSlot="image1" 
              label="Image 1" 
            />
            <ImageSlot 
              image={formData.image2} 
              imageSlot="image2" 
              label="Image 2" 
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add notes about this ingredient..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Custom Units - Only show for existing ingredients */}
          {ingredient && ingredient.customUnits && ingredient.customUnits.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Custom Units</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageUnits(ingredient.id)}
                >
                  <Settings2 className="w-4 h-4 mr-1" />
                  Manage
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredient.customUnits.map((unit) => (
                  <Badge key={unit.id} variant="outline">
                    1 {unit.unitName} = {unit.gramsEquivalent}g
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          {ingredient && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? 'Deleting...' : 'Delete Ingredient'}
            </Button>
          )}
          {!ingredient && <div></div>}
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || deleting}
            >
              {saving ? 'Saving...' : (ingredient ? 'Save Changes' : 'Create Ingredient')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
