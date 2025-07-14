
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Trash2, Settings2, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { handleClipboardPaste, uploadImageToSanity, isValidImageUrl } from '@/lib/utils/image-utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Ingredient, CustomUnit } from '@/lib/types/database'

interface IngredientCardProps {
  ingredient: Ingredient
  onUpdate: (id: string, updates: Partial<Ingredient>) => void
  onDelete: (id: string) => void
  onManageUnits: (id: string) => void
}

export function IngredientCard({ ingredient, onUpdate, onDelete, onManageUnits }: IngredientCardProps) {
  const [localValues, setLocalValues] = useState(ingredient)
  const [saving, setSaving] = useState(false)
  const fileInput1Ref = useRef<HTMLInputElement>(null)
  const fileInput2Ref = useRef<HTMLInputElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const hasInitialized = useRef(false)

  // Only update localValues if ingredient ID changes or on initial load
  useEffect(() => {
    if (!hasInitialized.current || ingredient.id !== localValues.id) {
      setLocalValues(ingredient)
      hasInitialized.current = true
    }
  }, [ingredient.id, ingredient, localValues.id])

  // Optimized debounced save function
  const performSave = useCallback(async (updates: Partial<Ingredient>) => {
    if (saving) return // Prevent concurrent saves
    
    setSaving(true)
    try {
      await onUpdate(ingredient.id, updates)
    } catch (error) {
      console.error('Error saving ingredient:', error)
    } finally {
      setSaving(false)
    }
  }, [ingredient.id, onUpdate, saving])

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleFieldUpdate = (field: keyof Ingredient, value: any) => {
    const newValues = { ...localValues, [field]: value }
    setLocalValues(newValues)
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      performSave({ [field]: value })
    }, 1000) // Save after 1 second of inactivity
  }

  const handleBlur = (field: keyof Ingredient) => {
    // Immediate save on blur if value has changed
    if (localValues[field] !== ingredient[field]) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      performSave({ [field]: localValues[field] })
    }
  }

  const handleImageUpload = async (file: File, imageSlot: 'image1' | 'image2') => {
    try {
      const imageAsset = await uploadImageToSanity(file)
      handleFieldUpdate(imageSlot, imageAsset)
    } catch (error) {
      console.error('Error uploading image:', error)
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
    handleFieldUpdate(imageSlot, null)
  }

  const EditableField = ({ 
    value, 
    field, 
    type = 'text',
    placeholder,
    className = ''
  }: {
    value: any
    field: keyof Ingredient
    type?: string
    placeholder?: string
    className?: string
  }) => (
    <div className="relative">
      <input
        type={type}
        value={value || ''}
        onChange={(e) => {
          const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          handleFieldUpdate(field, newValue)
        }}
        onBlur={() => handleBlur(field)}
        placeholder={placeholder}
        className={cn(
          'w-full bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1',
          saving && 'opacity-50',
          className
        )}
        disabled={saving}
      />
      {saving && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )

  const ImageSlot = ({ 
    image, 
    imageSlot, 
    label 
  }: { 
    image?: string | any | null
    imageSlot: 'image1' | 'image2'
    label: string 
  }) => {
    // Get display URL - for ingredient card, we expect already resolved URLs from API
    const displayUrl = typeof image === 'string' ? image : null
    
    return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500">{label}</label>
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
        {displayUrl && isValidImageUrl(displayUrl) ? (
          <>
            <div className="relative w-full h-full">
              <Image
                src={displayUrl}
                alt={`${ingredient.name} ${label}`}
                fill
                className="object-cover rounded-lg"
              />
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <EditableField
            value={localValues.name}
            field="name"
            placeholder="Ingredient name"
            className="text-lg font-semibold flex-1 mr-2"
          />
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageUnits(ingredient.id)}
              className="p-1 h-8 w-8"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(ingredient.id)}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nutritional Information */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Protein (g/g)</label>
            <EditableField
              value={localValues.protein}
              field="protein"
              type="number"
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Carbs (g/g)</label>
            <EditableField
              value={localValues.carbs}
              field="carbs"
              type="number"
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Fats (g/g)</label>
            <EditableField
              value={localValues.fats}
              field="fats"
              type="number"
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Calories (kcal/g)</label>
            <EditableField
              value={localValues.calories}
              field="calories"
              type="number"
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-500">Fiber (g/g)</label>
            <EditableField
              value={localValues.fiber}
              field="fiber"
              type="number"
              placeholder="0"
              className="text-sm"
            />
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-2 gap-3">
          <ImageSlot 
            image={localValues.image1} 
            imageSlot="image1" 
            label="Image 1" 
          />
          <ImageSlot 
            image={localValues.image2} 
            imageSlot="image2" 
            label="Image 2" 
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-gray-500">Notes</label>
          <div className="relative">
            <textarea
              value={localValues.notes || ''}
              onChange={(e) => handleFieldUpdate('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              placeholder="Add notes about this ingredient..."
              className={cn(
                'w-full bg-transparent border border-gray-200 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
                saving && 'opacity-50'
              )}
              disabled={saving}
              rows={2}
            />
            {saving && (
              <div className="absolute right-2 top-2">
                <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Units Info */}
        {ingredient.customUnits.length > 0 && (
          <div className="border-t pt-3">
            <label className="text-xs font-medium text-gray-500 mb-2 block">Custom Units</label>
            <div className="flex flex-wrap gap-1">
              {ingredient.customUnits.map((unit) => (
                <span
                  key={unit.id}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                >
                  1 {unit.unitName} = {unit.gramsEquivalent}g
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
