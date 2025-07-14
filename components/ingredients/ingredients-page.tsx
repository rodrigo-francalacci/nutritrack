
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit3, Trash2, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Ingredient, CustomUnit } from '@/lib/types/database'
import { IngredientEditorModal } from './ingredient-editor-modal'
import { CustomUnitsModal } from './custom-units-modal'

export function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isCustomUnitsOpen, setIsCustomUnitsOpen] = useState(false)
  const [selectedIngredientForUnits, setSelectedIngredientForUnits] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchIngredients()
  }, [])

  useEffect(() => {
    filterIngredients()
  }, [ingredients, searchTerm])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (!response.ok) throw new Error('Failed to fetch ingredients')
      const data = await response.json()
      setIngredients(data)
    } catch (error) {
      console.error('Error fetching ingredients:', error)
      toast({
        title: 'Error',
        description: 'Failed to load ingredients',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterIngredients = () => {
    const filtered = ingredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredIngredients(filtered)
  }

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setIsEditorOpen(true)
  }

  const handleDeleteIngredient = async (ingredientId: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return

    try {
      const response = await fetch(`/api/ingredients/${ingredientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete ingredient')

      await fetchIngredients()
      toast({
        title: 'Success',
        description: 'Ingredient deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete ingredient',
        variant: 'destructive',
      })
    }
  }

  const handleManageUnits = (ingredientId: string) => {
    setSelectedIngredientForUnits(ingredientId)
    setIsCustomUnitsOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setSelectedIngredient(null)
    fetchIngredients()
  }

  const handleCloseCustomUnits = () => {
    setIsCustomUnitsOpen(false)
    setSelectedIngredientForUnits(null)
    fetchIngredients()
  }

  const handleSaveIngredient = async (id: string | null, updates: Partial<Ingredient>) => {
    try {
      if (id) {
        // Update existing ingredient
        const response = await fetch(`/api/ingredients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) throw new Error('Failed to update ingredient')
      } else {
        // Create new ingredient
        const response = await fetch('/api/ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        
        if (!response.ok) throw new Error('Failed to create ingredient')
      }
      
      await fetchIngredients()
      toast({
        title: 'Success',
        description: id ? 'Ingredient updated successfully' : 'Ingredient created successfully',
      })
    } catch (error) {
      console.error('Error saving ingredient:', error)
      toast({
        title: 'Error',
        description: 'Failed to save ingredient',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="win98-container">
        <div className="win98-panel">
          <div className="win98-text-sm">Loading ingredients...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Utensils className="w-3 h-3 mr-1" />
          Ingredients Management
        </div>
        
        <div className="win98-form-container">
          <div className="win98-form-row-inline">
            <button
              onClick={() => {
                setSelectedIngredient(null)
                setIsEditorOpen(true)
              }}
              className="win98-button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Ingredient
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="win98-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          Ingredients ({filteredIngredients.length})
        </div>
        
        <div className="win98-table-container">
          <table className="win98-ingredients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cal/g</th>
                <th>Protein/g</th>
                <th>Carbs/g</th>
                <th>Fats/g</th>
                <th>Fiber/g</th>
                <th>Units</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>
                    <div className="win98-ingredient-name">{ingredient.name}</div>
                    {ingredient.notes && (
                      <div className="win98-ingredient-notes">{ingredient.notes}</div>
                    )}
                  </td>
                  <td>{ingredient.calories.toFixed(2)}</td>
                  <td>{ingredient.protein.toFixed(2)}</td>
                  <td>{ingredient.carbs.toFixed(2)}</td>
                  <td>{ingredient.fats.toFixed(2)}</td>
                  <td>{ingredient.fiber.toFixed(2)}</td>
                  <td>
                    <div className="win98-units-info">
                      {ingredient.customUnits.length > 0 ? (
                        <div className="win98-text-xs">
                          {ingredient.customUnits.map(unit => unit.unitName).join(', ')}
                        </div>
                      ) : (
                        <div className="win98-text-xs win98-gray-text">grams only</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="win98-actions">
                      <button
                        onClick={() => handleEditIngredient(ingredient)}
                        className="win98-button"
                        title="Edit ingredient"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleManageUnits(ingredient.id)}
                        className="win98-button"
                        title="Manage units"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                        className="win98-button"
                        title="Delete ingredient"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredIngredients.length === 0 && (
            <div className="win98-empty-state">
              {searchTerm ? 'No ingredients found matching your search.' : 'No ingredients added yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <IngredientEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        ingredient={selectedIngredient}
        onSave={handleSaveIngredient}
        onDelete={handleDeleteIngredient}
        onManageUnits={handleManageUnits}
      />
      
      <CustomUnitsModal
        isOpen={isCustomUnitsOpen}
        onClose={handleCloseCustomUnits}
        ingredientId={selectedIngredientForUnits}
        ingredients={ingredients}
        onUpdate={fetchIngredients}
      />
    </div>
  )
}
