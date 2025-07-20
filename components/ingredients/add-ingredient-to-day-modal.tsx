// add-ingredient-to-day-modal.tsx

'use client'

import { useState, useEffect } from 'react'
import { PlusCircle } from 'lucide-react'
import { Ingredient } from '@/lib/types/database'

interface AddIngredientToDayModalProps {
  isOpen: boolean
  onClose: () => void
  ingredient: Ingredient | null
  onAdd: (ingredient: Ingredient, quantity: number, unitId: string) => void
}

export function AddIngredientToDayModal({
  isOpen,
  onClose,
  ingredient,
  onAdd,
}: AddIngredientToDayModalProps) {
  const [quantity, setQuantity] = useState('1')
  const [unitId, setUnitId] = useState('grams')

  // Reset form when the modal opens with a new ingredient
  useEffect(() => {
    if (isOpen) {
      setQuantity('1')
      setUnitId('grams')
    }
  }, [isOpen])

  if (!isOpen || !ingredient) return null

  const handleAddClick = () => {
    const quantityNum = parseFloat(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      // Basic validation, you could add a toast here if you like
      alert('Please enter a valid quantity.')
      return
    }
    onAdd(ingredient, quantityNum, unitId)
  }

  return (
    <div className="win98-modal-overlay">
      <div className="win98-modal">
        <div className="win98-title-bar">
          <div className="flex-1 font-bold">Add "{ingredient.name}" to Today</div>
          <button className="win98-close-button" onClick={onClose}>X</button>
        </div>
        <div className="p-4">
          <div className="win98-form-container">
            <div className="win98-form-row-inline items-end gap-2">
              <div className="flex-grow">
                <label htmlFor="quantity" className="win98-label">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="win98-input w-full"
                />
              </div>
              <div className="flex-grow">
                <label htmlFor="unit" className="win98-label">Unit</label>
                <select
                  id="unit"
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="win98-select w-full"
                >
                  <option value="grams">grams</option>
                  {ingredient.customUnits?.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleAddClick} className="win98-button">
                <PlusCircle className="w-3 h-3 mr-1" />
                Add to Daily Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
