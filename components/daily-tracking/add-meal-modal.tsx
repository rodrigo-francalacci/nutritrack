// add-meal-modal.tsx
'use client'

import { useState } from 'react'
import { DailyNutrition } from '@/lib/types/database'
import { Plus } from 'lucide-react'

interface AddMealModalProps {
  onAdd: (data: Partial<DailyNutrition>) => void
  onClose: () => void
}

export function AddMealModal({ onAdd, onClose }: AddMealModalProps) {
  const [mealData, setMealData] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    water: '',
  })

  const handleChange = (field: string, value: string) => {
    setMealData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddClick = () => {
    const mealNutrition = {
      calories: mealData.calories ? parseFloat(mealData.calories) : 0,
      protein: mealData.protein ? parseFloat(mealData.protein) : 0,
      carbs: mealData.carbs ? parseFloat(mealData.carbs) : 0,
      fats: mealData.fats ? parseFloat(mealData.fats) : 0,
      fiber: mealData.fiber ? parseFloat(mealData.fiber) : 0,
      water: mealData.water ? parseFloat(mealData.water) : 0,
    }
    onAdd(mealNutrition)
  }

  return (
    <div className="win98-modal-overlay">
      <div className="win98-modal">
        <div className="win98-title-bar">
          <div className="flex-1 font-bold">Add Meal</div>
          <button className="win98-close-button" onClick={onClose}>X</button>
        </div>
        <div className="p-1">
            <div className="win98-metrics-grid">
              {/* Calories */}
              <div className="win98-metric-item">
                <label className="win98-label">Calories</label>
                <input
                  type="number"
                  step="0.1"
                  value={mealData.calories}
                  onChange={(e) => handleChange('calories', e.target.value)}
                  placeholder="0"
                  className="win98-input"
                />
              </div>
              {/* Protein */}
              <div className="win98-metric-item">
                <label className="win98-label">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mealData.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                  placeholder="0"
                  className="win98-input"
                />
              </div>
              {/* Carbs */}
              <div className="win98-metric-item">
                <label className="win98-label">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mealData.carbs}
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  placeholder="0"
                  className="win98-input"
                />
              </div>
              {/* Fats */}
              <div className="win98-metric-item">
                <label className="win98-label">Fats (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mealData.fats}
                  onChange={(e) => handleChange('fats', e.target.value)}
                  placeholder="0"
                  className="win98-input"
                />
              </div>
              {/* Fiber */}
              <div className="win98-metric-item">
                <label className="win98-label">Fiber (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mealData.fiber}
                  onChange={(e) => handleChange('fiber', e.target.value)}
                  placeholder="0"
                  className="win98-input"
                />
              </div>
              {/* Water */}
              <div className="win98-metric-item">
                <label className="win98-label">Water (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mealData.water}
                  onChange={(e) => handleChange('water', e.target.value)}
                  placeholder="0"
                  className="win98-input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="win98-button" onClick={handleAddClick}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
              <button className="win98-button" onClick={onClose}>
                Cancel
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}
