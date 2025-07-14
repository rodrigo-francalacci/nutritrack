
'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Ingredient, CustomUnit } from '@/lib/types/database'

interface CustomUnitsModalProps {
  isOpen: boolean
  onClose: () => void
  ingredientId: string | null
  ingredients: Ingredient[]
  onUpdate: () => void
}

export function CustomUnitsModal({
  isOpen,
  onClose,
  ingredientId,
  ingredients,
  onUpdate,
}: CustomUnitsModalProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('')
  const [unitName, setUnitName] = useState('')
  const [gramsEquivalent, setGramsEquivalent] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (ingredientId) {
      setSelectedIngredientId(ingredientId)
    } else if (ingredients.length > 0) {
      setSelectedIngredientId(ingredients[0].id)
    }
  }, [ingredientId, ingredients])

  const selectedIngredient = ingredients.find(ing => ing.id === selectedIngredientId)

  const handleAddUnit = async () => {
    if (!selectedIngredientId || !unitName.trim() || !gramsEquivalent) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/custom-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: selectedIngredientId,
          unitName: unitName.trim(),
          gramsEquivalent: parseFloat(gramsEquivalent),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add unit')
      }

      setUnitName('')
      setGramsEquivalent('')
      onUpdate()
      
      toast({
        title: 'Success',
        description: 'Custom unit added',
      })
    } catch (error: any) {
      console.error('Error adding custom unit:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add custom unit',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const response = await fetch(`/api/custom-units/${unitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete unit')

      onUpdate()
      
      toast({
        title: 'Success',
        description: 'Custom unit deleted',
      })
    } catch (error) {
      console.error('Error deleting custom unit:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete custom unit',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    setUnitName('')
    setGramsEquivalent('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Custom Units</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ingredient Selection */}
          <div>
            <Label htmlFor="ingredient-select">Select Ingredient</Label>
            <Select
              value={selectedIngredientId}
              onValueChange={setSelectedIngredientId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an ingredient" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ingredient) => (
                  <SelectItem key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add New Unit */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Add Custom Unit</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="unit-name">Unit Name</Label>
                <Input
                  id="unit-name"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g., cup, tablespoon"
                />
              </div>
              <div>
                <Label htmlFor="grams-equivalent">Grams Equivalent</Label>
                <Input
                  id="grams-equivalent"
                  type="number"
                  value={gramsEquivalent}
                  onChange={(e) => setGramsEquivalent(e.target.value)}
                  placeholder="e.g., 240"
                />
              </div>
            </div>
            <Button
              onClick={handleAddUnit}
              disabled={loading}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
          </div>

          {/* Existing Units */}
          {selectedIngredient && selectedIngredient.customUnits.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium">
                Custom Units for {selectedIngredient.name}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedIngredient.customUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="text-sm">
                      <span className="font-medium">1 {unit.unitName}</span>
                      <span className="text-gray-500"> = {unit.gramsEquivalent}g</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="text-red-500 hover:text-red-700 p-1 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedIngredient && selectedIngredient.customUnits.length === 0 && (
            <div className="text-center text-gray-500 py-4 border-t">
              No custom units defined for {selectedIngredient.name}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
