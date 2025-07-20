// daily-nutrition-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { Save, Plus } from 'lucide-react'
import { DailyNutrition } from '@/lib/types/database'
import { AddMealModal } from './add-meal-modal'

interface DailyNutritionFormProps {
  data: DailyNutrition | null
  onSave: (data: Partial<DailyNutrition>) => void
}

export function DailyNutritionForm({ data, onSave }: DailyNutritionFormProps) {
  const [formData, setFormData] = useState({
    calories: '0',
    protein: '0',
    carbs: '0',
    fats: '0',
    fiber: '0',
    water: '0',
    notes: '',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData({
        calories: data.calories?.toString() || '0',
        protein: data.protein?.toString() || '0',
        carbs: data.carbs?.toString() || '0',
        fats: data.fats?.toString() || '0',
        fiber: data.fiber?.toString() || '0',
        water: data.water?.toString() || '0',
        notes: data.notes || '',
      })
    } else {
      // Reset form when there's no data for the selected date
      setFormData({
        calories: '0',
        protein: '0',
        carbs: '0',
        fats: '0',
        fiber: '0',
        water: '0',
        notes: '',
      })
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const nutritionData = {
      calories: formData.calories ? parseFloat(formData.calories) : null,
      protein: formData.protein ? parseFloat(formData.protein) : null,
      carbs: formData.carbs ? parseFloat(formData.carbs) : null,
      fats: formData.fats ? parseFloat(formData.fats) : null,
      fiber: formData.fiber ? parseFloat(formData.fiber) : null,
      water: formData.water ? parseFloat(formData.water) : null,
      notes: formData.notes || null,
    }

    onSave(nutritionData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddMeal = (mealData: Partial<DailyNutrition>) => {
    const newFormData = { ...formData };
    for (const key in mealData) {
      if (Object.prototype.hasOwnProperty.call(mealData, key) && key !== 'notes') {
        const mealValue = (mealData[key as keyof DailyNutrition] as number) || 0;
        const currentVal = newFormData[key as keyof typeof newFormData];
        const formValue = parseFloat(currentVal === '' || currentVal === null ? '0' : currentVal as string);
        
        if (typeof mealValue === 'number') {
          newFormData[key as keyof typeof newFormData] = (formValue + mealValue).toString();
        }
      }
    }
    setFormData(newFormData);
    setIsModalOpen(false);
  }

  return (
    <>
      {isModalOpen && <AddMealModal onAdd={handleAddMeal} onClose={() => setIsModalOpen(false)} />}
      <form onSubmit={handleSubmit} className="win98-form-container">
        <div className="win98-metrics-grid">
          <div className="win98-metric-item">
            <label className="win98-label">Calories</label>
            <input
              type="number"
              step="0.1"
              value={formData.calories}
              onChange={(e) => handleChange('calories', e.target.value)}
              placeholder="0"
              className="win98-input"
            />
          </div>
          
          <div className="win98-metric-item">
            <label className="win98-label">Protein (g)</label>
            <input
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={(e) => handleChange('protein', e.target.value)}
              placeholder="0"
              className="win98-input"
            />
          </div>
          
          <div className="win98-metric-item">
            <label className="win98-label">Carbs (g)</label>
            <input
              type="number"
              step="0.1"
              value={formData.carbs}
              onChange={(e) => handleChange('carbs', e.target.value)}
              placeholder="0"
              className="win98-input"
            />
          </div>
          
          <div className="win98-metric-item">
            <label className="win98-label">Fats (g)</label>
            <input
              type="number"
              step="0.1"
              value={formData.fats}
              onChange={(e) => handleChange('fats', e.target.value)}
              placeholder="0"
              className="win98-input"
            />
          </div>
          
          <div className="win98-metric-item">
            <label className="win98-label">Fiber (g)</label>
            <input
              type="number"
              step="0.1"
              value={formData.fiber}
              onChange={(e) => handleChange('fiber', e.target.value)}
              placeholder="0"
              className="win98-input"
            />
          </div>
          
          <div className="win98-metric-item">
            <label className="win98-label">Water (L)</label>
            <input
              type="number"
              step="0.1"
              value={formData.water}
              onChange={(e) => handleChange('water', e.target.value)}
              placeholder="0"
              className="win98-input"
            />
          </div>
        </div>
        
        <div className="win98-form-row">
          <label className="win98-label">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any notes about your nutrition..."
            className="win98-input win98-textarea"
            rows={3}
          />
        </div>
        
        <div className="flex justify-between pt-2">
          <button type="button" className="win98-button" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Add Meal
          </button>
          <button type="submit" className="win98-button">
            <Save className="w-3 h-3 mr-1" />
            Save Nutrition Data
          </button>
        </div>
      </form>
    </>
  )
}
