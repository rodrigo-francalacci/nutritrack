'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ImageIcon, Upload, Settings2, Divide } from 'lucide-react'
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
import {
  handleClipboardPaste,
  uploadImageToSanity,
  isSanityAsset,
} from '@/lib/utils/image-utils'
import Image from 'next/image'
import { Ingredient } from '@/lib/types/database'

// The type for our form data, using strings for numeric fields
type IngredientFormData = Omit<
  Partial<Ingredient>,
  'protein' | 'carbs' | 'fats' | 'calories' | 'fiber'
> & {
  protein: string
  carbs: string
  fats: string
  calories: string
  fiber: string
}

// A specific type for the keys of numeric fields in the form
type NumericFormKey = 'protein' | 'carbs' | 'fats' | 'calories' | 'fiber'

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
  onManageUnits,
}: IngredientEditorModalProps) {
  const [formData, setFormData] = useState<IngredientFormData>(
    {} as IngredientFormData
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [divider, setDivider] = useState('')
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({})
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      if (ingredient) {
        setFormData({
          name: ingredient.name || '',
          protein: String(ingredient.protein || 0),
          carbs: String(ingredient.carbs || 0),
          fats: String(ingredient.fats || 0),
          calories: String(ingredient.calories || 0),
          fiber: String(ingredient.fiber || 0),
          notes: ingredient.notes || '',
          image1: ingredient.image1,
          image2: ingredient.image2,
        })
      } else {
        setFormData({
          name: '',
          protein: '0',
          carbs: '0',
          fats: '0',
          calories: '0',
          fiber: '0',
          notes: '',
          image1: null,
          image2: null,
        })
      }
      setDivider('')
      setUploadProgress({})
    }
  }, [ingredient, isOpen])

  // FIX 1: The 'field' parameter is now strongly typed to only allow numeric form keys.
  const handleNumericChange = (field: NumericFormKey, value: string) => {
    const isValid = /^[0-9]*\.?[0-9]*$/.test(value)
    if (isValid) {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleScaleValues = () => {
    const divisor = parseFloat(divider)
    if (isNaN(divisor) || divisor === 0) {
      toast({
        title: 'Invalid Serving Size',
        description: 'Please enter a valid, non-zero number to divide by.',
        variant: 'destructive',
      })
      return
    }

    const fieldsToScale: NumericFormKey[] = ['calories', 'protein', 'carbs', 'fats', 'fiber']
    const scaledData = { ...formData }
    fieldsToScale.forEach(field => {
      const currentValue = parseFloat(formData[field]) || 0
      scaledData[field] = (currentValue / divisor).toFixed(4)
    })

    setFormData(scaledData)
    toast({
      title: 'Values Scaled',
      description: `Nutrition facts have been divided by ${divisor}.`,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dataToSave: Partial<Ingredient> = {
        ...formData,
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fats: parseFloat(formData.fats) || 0,
        calories: parseFloat(formData.calories) || 0,
        fiber: parseFloat(formData.fiber) || 0,
      }
      await onSave(ingredient?.id || null, dataToSave)
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${ingredient ? 'update' : 'create'} ingredient.`,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }
  
  // ... (handleDelete, handleImageUpload, handleImagePaste, removeImage, and ImageSlot functions remain the same)
  const handleDelete = async () => {
    if (!ingredient) return

    setDeleting(true)
    try {
      await onDelete(ingredient.id)
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

  const handleImageUpload = async (
    file: File,
    imageSlot: 'image1' | 'image2'
  ) => {
    try {
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > 10) {
        toast({
          title: 'Large File',
          description: `File is ${fileSizeMB.toFixed(
            1
          )}MB. This may take a moment to compress and upload.`,
        })
      }
      const imageAsset = await uploadImageToSanity(file, progress => {
        setUploadProgress(prev => ({ ...prev, [imageSlot]: progress }))
      })
      setFormData(prev => ({ ...prev, [imageSlot]: imageAsset }))
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

  const handleImagePaste = async (
    event: ClipboardEvent,
    imageSlot: 'image1' | 'image2'
  ) => {
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
    label,
  }: {
    image?: string | any | null
    imageSlot: 'image1' | 'image2'
    label: string
  }) => {
    const getDisplayUrl = (imageData: any): string | null => {
      if (!imageData) return null
      if (typeof imageData === 'string') {
        return imageData
      }
      if (isSanityAsset(imageData)) {
        return null
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
          className="relative w-full h-72 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer group"
          onClick={() => {
            if (imageSlot === 'image1') {
              fileInput1Ref.current?.click()
            } else {
              fileInput2Ref.current?.click()
            }
          }}
          onPaste={e => handleImagePaste(e as any, imageSlot)}
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
                onClick={e => {
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
          onChange={e => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none flex flex-col">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
        </DialogHeader>

        <div className="flex-grow space-y-6 overflow-y-auto pr-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Ingredient Name</Label>
              <Input id="name" value={formData.name || ''} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter ingredient name" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="protein">Protein</Label><Input id="protein" type="text" inputMode="decimal" value={formData.protein} onChange={e => handleNumericChange('protein', e.target.value)} placeholder="0.00" className="mt-1" /></div>
              <div><Label htmlFor="carbs">Carbs</Label><Input id="carbs" type="text" inputMode="decimal" value={formData.carbs} onChange={e => handleNumericChange('carbs', e.target.value)} placeholder="0.00" className="mt-1" /></div>
              <div><Label htmlFor="fats">Fats</Label><Input id="fats" type="text" inputMode="decimal" value={formData.fats} onChange={e => handleNumericChange('fats', e.target.value)} placeholder="0.00" className="mt-1" /></div>
              <div><Label htmlFor="calories">Calories</Label><Input id="calories" type="text" inputMode="decimal" value={formData.calories} onChange={e => handleNumericChange('calories', e.target.value)} placeholder="0.00" className="mt-1" /></div>
            </div>
            <div>
              <Label htmlFor="fiber">Fiber</Label>
              <Input id="fiber" type="text" inputMode="decimal" value={formData.fiber} onChange={e => handleNumericChange('fiber', e.target.value)} placeholder="0.00" className="mt-1" />
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Nutrition Scaler</Label>
            <p className="text-xs text-gray-500 mb-2">Enter values from the label above, then use this tool to calculate per-gram facts.</p>
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <Label htmlFor="divider" className="text-xs">Serving Size (g)</Label>
                <Input id="divider" type="text" inputMode="decimal" value={divider} onChange={e => setDivider(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="e.g., 60" className="mt-1" />
              </div>
              <Button variant="outline" onClick={handleScaleValues} className="flex-shrink-0">
                <Divide className="w-4 h-4 mr-2" />Calculate per Gram
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ImageSlot image={formData.image1} imageSlot="image1" label="Image 1" />
            <ImageSlot image={formData.image2} imageSlot="image2" label="Image 2" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes || ''} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} placeholder="Add notes..." className="mt-1" rows={3} />
          </div>

          {/* FIX 2: Use optional chaining (?.) for safe access */}
          {ingredient?.customUnits && ingredient.customUnits.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Custom Units</Label>
                <Button variant="outline" size="sm" onClick={() => onManageUnits(ingredient.id)}>
                  <Settings2 className="w-4 h-4 mr-1" />Manage
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredient.customUnits.map(unit => (
                  <Badge key={unit.id} variant="outline">
                    1 {unit.unitName} = {unit.gramsEquivalent}g
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center justify-between pt-6 border-t">
          {ingredient ? <Button variant="destructive" onClick={handleDelete} disabled={deleting || saving}>{deleting ? 'Deleting...' : 'Delete'}</Button> : <div></div>}
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || deleting}>{saving ? 'Saving...' : ingredient ? 'Save Changes' : 'Create Ingredient'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
