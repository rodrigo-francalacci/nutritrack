
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Trash2, Save, ImageIcon, X, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Ingredient, CustomUnit, Recipe, RecipeIngredient } from '@/lib/types/database'
import Link from 'next/link'
import { fileToBase64 } from '@/lib/utils/image-utils'
import Image from 'next/image'
import { IngredientSearchModal } from './ingredient-search-modal'

interface RecipeEditorProps {
  recipeId: string
}

interface ExtendedRecipe extends Recipe {
  ingredients: (RecipeIngredient & {
    ingredient: Ingredient & { customUnits: CustomUnit[] }
    unit?: CustomUnit | null
    order: number
  })[]
}

export function RecipeEditor({ recipeId }: RecipeEditorProps) {
  const [recipe, setRecipe] = useState<ExtendedRecipe | null>(null)
  const [allIngredients, setAllIngredients] = useState<(Ingredient & { customUnits: CustomUnit[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isIngredientSearchOpen, setIsIngredientSearchOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipe()
    fetchIngredients()
  }, [recipeId])

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`)
      if (!response.ok) throw new Error('Failed to fetch recipe')
      const data = await response.json()
      setRecipe(data)
    } catch (error) {
      console.error('Error fetching recipe:', error)
      toast({
        title: 'Error',
        description: 'Failed to load recipe',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (!response.ok) throw new Error('Failed to fetch ingredients')
      const data = await response.json()
      setAllIngredients(data)
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  const updateRecipe = async (updates: Partial<Recipe>) => {
    if (!recipe) return

    setSaving(true)
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update recipe')
      
      const updatedRecipe = await response.json()
      setRecipe(updatedRecipe)
      
      toast({
        title: 'Success',
        description: 'Recipe updated',
      })
    } catch (error) {
      console.error('Error updating recipe:', error)
      toast({
        title: 'Error',
        description: 'Failed to update recipe',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const addIngredient = async (ingredientId: string) => {
    try {
      // Validate inputs
      if (!ingredientId || !recipeId) {
        throw new Error('Missing required data')
      }

      const response = await fetch('/api/recipe-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          ingredientId,
          quantity: 100, // Default 100g
          unitId: null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to add ingredient')
      }
      
      const newIngredient = await response.json()
      console.log('Added ingredient:', newIngredient)
      
      await fetchRecipe() // Refresh recipe data
      
      toast({
        title: 'Success',
        description: 'Ingredient added to recipe',
      })
    } catch (error) {
      console.error('Error adding ingredient:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add ingredient',
        variant: 'destructive',
      })
    }
  }

  // Get IDs of ingredients already added to recipe
  const getAddedIngredientIds = () => {
    return recipe?.ingredients?.map(ri => ri.ingredientId) || []
  }

  // FIXED: Update ingredient without refetching entire recipe to preserve order
  const updateRecipeIngredient = async (recipeIngredientId: string, updates: { quantity?: number; unitId?: string | null }) => {
    try {
      const response = await fetch(`/api/recipe-ingredients/${recipeIngredientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update ingredient')
      
      const updatedIngredient = await response.json()
      
      // FIXED: Update the state directly instead of refetching to preserve order
      setRecipe(prevRecipe => {
        if (!prevRecipe) return null
        
        const updatedIngredients = prevRecipe.ingredients.map(ingredient => 
          ingredient.id === recipeIngredientId 
            ? { ...ingredient, ...updatedIngredient }
            : ingredient
        )
        
        return {
          ...prevRecipe,
          ingredients: updatedIngredients
        }
      })

    } catch (error) {
      console.error('Error updating recipe ingredient:', error)
      toast({
        title: 'Error',
        description: 'Failed to update ingredient',
        variant: 'destructive',
      })
    }
  }

  const removeRecipeIngredient = async (recipeIngredientId: string) => {
    try {
      const response = await fetch(`/api/recipe-ingredients/${recipeIngredientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove ingredient')
      
      await fetchRecipe() // Refresh recipe data
      
      toast({
        title: 'Success',
        description: 'Ingredient removed from recipe',
      })
    } catch (error) {
      console.error('Error removing ingredient:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove ingredient',
        variant: 'destructive',
      })
    }
  }

  const calculateNutrition = () => {
    if (!recipe) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }

    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFats = 0
    let totalFiber = 0

    recipe.ingredients.forEach(recipeIngredient => {
      const ingredient = recipeIngredient.ingredient
      let quantityInGrams = recipeIngredient.quantity

      // Convert to grams if using custom unit
      if (recipeIngredient.unit) {
        quantityInGrams = recipeIngredient.quantity * recipeIngredient.unit.gramsEquivalent
      }

      // Apply scaling factor
      quantityInGrams *= recipe.scalingFactor

      // Calculate nutritional values
      totalCalories += ingredient.calories * quantityInGrams
      totalProtein += ingredient.protein * quantityInGrams
      totalCarbs += ingredient.carbs * quantityInGrams
      totalFats += ingredient.fats * quantityInGrams
      totalFiber += ingredient.fiber * quantityInGrams
    })

    return {
      calories: Math.round(totalCalories * 100) / 100,
      protein: Math.round(totalProtein * 100) / 100,
      carbs: Math.round(totalCarbs * 100) / 100,
      fats: Math.round(totalFats * 100) / 100,
      fiber: Math.round(totalFiber * 100) / 100,
    }
  }

  const calculateIngredientContribution = (recipeIngredient: any) => {
    const ingredient = recipeIngredient.ingredient
    let quantityInGrams = recipeIngredient.quantity

    // Convert to grams if using custom unit
    if (recipeIngredient.unit) {
      quantityInGrams = recipeIngredient.quantity * recipeIngredient.unit.gramsEquivalent
    }

    // Apply scaling factor
    quantityInGrams *= recipe?.scalingFactor || 1

    return {
      calories: Math.round(ingredient.calories * quantityInGrams * 100) / 100,
      protein: Math.round(ingredient.protein * quantityInGrams * 100) / 100,
      carbs: Math.round(ingredient.carbs * quantityInGrams * 100) / 100,
      fats: Math.round(ingredient.fats * quantityInGrams * 100) / 100,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="win98-text-sm">Loading recipe...</div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-4 win98-panel">
        <div className="win98-text-sm mb-1">Recipe not found</div>
        <Link href="/recipes">
          <button className="win98-button">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Recipes
          </button>
        </Link>
      </div>
    )
  }

  const nutrition = calculateNutrition()

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Link href="/recipes">
          <button className="win98-button">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Recipes
          </button>
        </Link>
        <button 
          onClick={() => updateRecipe({ 
            name: recipe.name, 
            instructions: recipe.instructions,
            scalingFactor: recipe.scalingFactor 
          })}
          disabled={saving}
          className="win98-button"
        >
          <Save className="w-3 h-3 mr-1" />
          {saving ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>

      {/* Recipe Details */}
      <div className="win98-panel mb-2">
        <div className="win98-title-bar mb-1">
          Recipe Details
        </div>
        <div className="win98-form-container">
          <div className="win98-form-row">
            <label htmlFor="recipe-name" className="win98-label">Recipe Name</label>
            <input
              id="recipe-name"
              value={recipe.name}
              onChange={(e) => setRecipe(prev => prev ? { ...prev, name: e.target.value } : null)}
              onBlur={() => updateRecipe({ name: recipe.name })}
              placeholder="Enter recipe name"
              className="win98-input"
            />
          </div>

          <div className="win98-form-row">
            <label htmlFor="scaling-factor" className="win98-label">Scaling Factor</label>
            <input
              id="scaling-factor"
              type="number"
              step="0.1"
              min="0.1"
              value={recipe.scalingFactor}
              onChange={(e) => setRecipe(prev => prev ? { ...prev, scalingFactor: parseFloat(e.target.value) || 1 } : null)}
              onBlur={() => updateRecipe({ scalingFactor: recipe.scalingFactor })}
              placeholder="1.0"
              className="win98-input"
            />
          </div>

          <div className="win98-form-row">
            <label htmlFor="instructions" className="win98-label">Instructions</label>
            <textarea
              id="instructions"
              value={recipe.instructions || ''}
              onChange={(e) => setRecipe(prev => prev ? { ...prev, instructions: e.target.value } : null)}
              onBlur={() => updateRecipe({ instructions: recipe.instructions })}
              placeholder="Enter cooking instructions..."
              className="win98-input win98-textarea"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Nutritional Summary */}
      <div className="win98-panel mb-2">
        <div className="win98-title-bar mb-1">
          <Calculator className="w-3 h-3 mr-1" />
          Nutritional Information
        </div>
        <div className="win98-nutrition-grid">
          <div className="win98-nutrition-item">
            <div className="win98-nutrition-value">{nutrition.calories}</div>
            <div className="win98-nutrition-label">Calories</div>
          </div>
          <div className="win98-nutrition-item">
            <div className="win98-nutrition-value">{nutrition.protein}g</div>
            <div className="win98-nutrition-label">Protein</div>
          </div>
          <div className="win98-nutrition-item">
            <div className="win98-nutrition-value">{nutrition.carbs}g</div>
            <div className="win98-nutrition-label">Carbs</div>
          </div>
          <div className="win98-nutrition-item">
            <div className="win98-nutrition-value">{nutrition.fats}g</div>
            <div className="win98-nutrition-label">Fats</div>
          </div>
          <div className="win98-nutrition-item">
            <div className="win98-nutrition-value">{nutrition.fiber}g</div>
            <div className="win98-nutrition-label">Fiber</div>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="win98-panel">
        <div className="win98-title-bar mb-1">
          Ingredients
        </div>
        <div className="win98-ingredients-container">
          {/* Add Ingredient */}
          <div className="win98-form-row">
            <label className="win98-label">Add Ingredient</label>
            <button
              onClick={() => setIsIngredientSearchOpen(true)}
              className="win98-button win98-add-ingredient-button"
              disabled={allIngredients.length === 0 || getAddedIngredientIds().length === allIngredients.length}
            >
              <Plus className="w-3 h-3 mr-1" />
              {allIngredients.length === 0 
                ? 'No ingredients available'
                : getAddedIngredientIds().length === allIngredients.length
                ? 'All ingredients added'
                : `Search ingredients (${allIngredients.length - getAddedIngredientIds().length} available)`
              }
            </button>
          </div>

          {/* Ingredient List - FIXED: Using stable keys based on ID and order */}
          <div className="win98-ingredients-list">
            {recipe.ingredients.map((recipeIngredient) => {
              const contribution = calculateIngredientContribution(recipeIngredient)
              return (
                <div key={`${recipeIngredient.id}-${recipeIngredient.order}`} className="win98-ingredient-row">
                  <div className="win98-ingredient-main">
                    <div className="win98-ingredient-name">
                      {recipeIngredient.ingredient.name}
                    </div>
                    
                    <div className="win98-ingredient-controls">
                      <input
                        type="number"
                        value={recipeIngredient.quantity}
                        onChange={(e) => updateRecipeIngredient(recipeIngredient.id, { 
                          quantity: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="Qty"
                        className="win98-input win98-quantity-input"
                      />

                      <Select
                        value={recipeIngredient.unitId || 'grams'}
                        onValueChange={(value) => updateRecipeIngredient(recipeIngredient.id, { 
                          unitId: value === 'grams' ? null : value 
                        })}
                      >
                        <SelectTrigger className="win98-select win98-unit-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grams">grams</SelectItem>
                          {recipeIngredient.ingredient.customUnits?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.unitName}
                            </SelectItem>
                          )) || []}
                        </SelectContent>
                      </Select>

                      <button
                        onClick={() => removeRecipeIngredient(recipeIngredient.id)}
                        className="win98-button win98-delete-button"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Nutritional Contribution */}
                  <div className="win98-nutrition-contribution">
                    <div className="win98-contribution-item">
                      <span className="win98-contribution-value">{contribution.calories}</span>
                      <span className="win98-contribution-label">cal</span>
                    </div>
                    <div className="win98-contribution-item">
                      <span className="win98-contribution-value">{contribution.protein}g</span>
                      <span className="win98-contribution-label">protein</span>
                    </div>
                    <div className="win98-contribution-item">
                      <span className="win98-contribution-value">{contribution.carbs}g</span>
                      <span className="win98-contribution-label">carbs</span>
                    </div>
                    <div className="win98-contribution-item">
                      <span className="win98-contribution-value">{contribution.fats}g</span>
                      <span className="win98-contribution-label">fats</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {recipe.ingredients.length === 0 && (
              <div className="win98-empty-state">
                No ingredients added yet. Click the search button above to add ingredients.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ingredient Search Modal */}
      <IngredientSearchModal
        isOpen={isIngredientSearchOpen}
        onClose={() => setIsIngredientSearchOpen(false)}
        onSelectIngredient={addIngredient}
        excludeIngredientIds={getAddedIngredientIds()}
        allIngredients={allIngredients}
      />
    </div>
  )
}
