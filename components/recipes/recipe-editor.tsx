'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Ingredient,
  CustomUnit,
  Recipe,
  RecipeIngredient,
} from '@/lib/types/database'
import Link from 'next/link'
import { IngredientSearchModal } from './ingredient-search-modal'
import { IngredientImageSwitcher } from './ingredient-image-switcher'

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
  const [allIngredients, setAllIngredients] = useState<
    (Ingredient & { customUnits: CustomUnit[] })[]
  >([])
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

  const handleSaveChanges = async () => {
    if (!recipe) return
    setSaving(true)
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipe.name,
          instructions: recipe.instructions,
          scalingFactor: recipe.scalingFactor,
          ingredients: recipe.ingredients.map(ing => ({
            id: ing.id,
            quantity: ing.quantity,
            unitId: ing.unitId,
          })),
        }),
      })
      if (!response.ok) throw new Error('Failed to save recipe')
      const updatedRecipe = await response.json()
      setRecipe(updatedRecipe)
      toast({
        title: 'Success',
        description: 'All changes saved!',
      })
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const addIngredient = async (ingredientId: string) => {
    try {
      if (!ingredientId || !recipeId) {
        throw new Error('Missing required data')
      }

      const response = await fetch('/api/recipe-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          ingredientId,
          quantity: 100,
          unitId: null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to add ingredient')
      }

      await fetchRecipe()

      toast({
        title: 'Success',
        description: 'Ingredient added to recipe',
      })
    } catch (error) {
      console.error('Error adding ingredient:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add ingredient',
        variant: 'destructive',
      })
    }
  }

  const getAddedIngredientIds = () => {
    return recipe?.ingredients?.map(ri => ri.ingredientId) || []
  }

  const removeRecipeIngredient = async (recipeIngredientId: string) => {
    try {
      const response = await fetch(
        `/api/recipe-ingredients/${recipeIngredientId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) throw new Error('Failed to remove ingredient')

      await fetchRecipe()

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

      if (recipeIngredient.unit) {
        quantityInGrams =
          recipeIngredient.quantity * recipeIngredient.unit.gramsEquivalent
      }

      quantityInGrams *= recipe.scalingFactor

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

    if (recipeIngredient.unit) {
      quantityInGrams =
        recipeIngredient.quantity * recipeIngredient.unit.gramsEquivalent
    }

    quantityInGrams *= recipe?.scalingFactor || 1

    return {
      calories: Math.round(ingredient.calories * quantityInGrams * 100) / 100,
      protein: Math.round(ingredient.protein * quantityInGrams * 100) / 100,
      carbs: Math.round(ingredient.carbs * quantityInGrams * 100) / 100,
      fats: Math.round(ingredient.fats * quantityInGrams * 100) / 100,
    }
  }

  // UPDATED: handleIngredientChange function with the bug fix
  const handleIngredientChange = (
    recipeIngredientId: string,
    updates: { quantity?: number; unitId?: string | null }
  ) => {
    setRecipe(prevRecipe => {
      if (!prevRecipe) return null
      const updatedIngredients = prevRecipe.ingredients.map(ingredient => {
        if (ingredient.id === recipeIngredientId) {
          // This block contains the corrected logic
          const newUnit =
            updates.unitId !== undefined // Check if a unitId was passed in the update
              ? updates.unitId === null // Check if the new unit is 'grams' (represented by null)
                ? null // If yes, the new unit object is explicitly null
                : ingredient.ingredient.customUnits.find( // Otherwise, find the matching custom unit
                    u => u.id === updates.unitId
                  )
              : ingredient.unit // If no unitId was passed, keep the existing unit object

          return {
            ...ingredient,
            quantity:
              updates.quantity !== undefined
                ? updates.quantity
                : ingredient.quantity,
            unitId:
              updates.unitId !== undefined
                ? updates.unitId
                : ingredient.unitId,
            unit: newUnit === undefined ? ingredient.unit : newUnit || null,
          }
        }
        return ingredient
      })
      return { ...prevRecipe, ingredients: updatedIngredients }
    })
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
      <div className="flex items-center justify-between mb-2">
        <Link href="/recipes">
          <button className="win98-button">
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Recipes
          </button>
        </Link>
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="win98-button"
        >
          <Save className="w-3 h-3 mr-1" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="win98-panel mb-2">
        <div className="win98-title-bar mb-1">Recipe Details</div>
        <div className="win98-form-container">
          <div className="win98-form-row">
            <label htmlFor="recipe-name" className="win98-label">
              Recipe Name
            </label>
            <input
              id="recipe-name"
              value={recipe.name}
              onChange={e =>
                setRecipe(prev => (prev ? { ...prev, name: e.target.value } : null))
              }
              placeholder="Enter recipe name"
              className="win98-input"
            />
          </div>
          <div className="win98-form-row">
            <label htmlFor="scaling-factor" className="win98-label">
              Scaling Factor
            </label>
            <input
              id="scaling-factor"
              type="number"
              step="0.1"
              min="0"
              value={recipe.scalingFactor}
              onChange={e =>
                setRecipe(prev =>
                  prev
                    ? { ...prev, scalingFactor: parseFloat(e.target.value) || 1 }
                    : null
                )
              }
              placeholder="1.0"
              className="win98-input"
            />
          </div>
          <div className="win98-form-row">
            <label htmlFor="instructions" className="win98-label">
              Instructions
            </label>
            <textarea
              id="instructions"
              value={recipe.instructions || ''}
              onChange={e =>
                setRecipe(prev =>
                  prev ? { ...prev, instructions: e.target.value } : null
                )
              }
              placeholder="Enter cooking instructions..."
              className="win98-input win98-textarea"
              rows={6}
            />
          </div>
        </div>
      </div>

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

      <div className="win98-panel">
        <div className="win98-title-bar mb-1">Ingredients</div>
        <div className="win98-ingredients-container">
          <div className="win98-form-row">
            <label className="win98-label">Add Ingredient</label>
            <button
              onClick={() => setIsIngredientSearchOpen(true)}
              className="win98-button win98-add-ingredient-button"
              disabled={
                allIngredients.length === 0 ||
                getAddedIngredientIds().length === allIngredients.length
              }
            >
              <Plus className="w-3 h-3 mr-1" />
              {allIngredients.length === 0
                ? 'No ingredients available'
                : getAddedIngredientIds().length === allIngredients.length
                ? 'All ingredients added'
                : `Search ingredients (${
                    allIngredients.length - getAddedIngredientIds().length
                  } available)`}
            </button>
          </div>

          <div className="win98-ingredients-list space-y-4">
            {recipe.ingredients.map(recipeIngredient => {
              const contribution =
                calculateIngredientContribution(recipeIngredient)
              return (
                <div
                  key={recipeIngredient.id}
                  className="win98-ingredient-row flex flex-col md:flex-row md:items-start gap-3"
                >
                  <div className="flex-grow w-full md:order-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="win98-ingredient-name font-semibold text-lg">
                        {recipeIngredient.ingredient.name}
                      </div>
                      <div className="win98-ingredient-controls flex-shrink-0 flex items-center gap-1">
                        <input
                          type="number"
                          value={recipeIngredient.quantity}
                          onChange={e =>
                            handleIngredientChange(recipeIngredient.id, {
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Qty"
                          className="win98-input win98-quantity-input w-20"
                        />
                        <Select
                          value={recipeIngredient.unitId || 'grams'}
                          onValueChange={value =>
                            handleIngredientChange(recipeIngredient.id, {
                              unitId: value === 'grams' ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="win98-select win98-unit-select w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grams">grams</SelectItem>
                            {recipeIngredient.ingredient.customUnits?.map(
                              unit => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.unitName}
                                </SelectItem>
                              )
                            ) || []}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() =>
                            removeRecipeIngredient(recipeIngredient.id)
                          }
                          className="win98-button win98-delete-button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="win98-nutrition-contribution flex items-center justify-between mt-2">
                      <div className="win98-contribution-item">
                        <span className="win98-contribution-value">
                          {contribution.calories}
                        </span>
                        <span className="win98-contribution-label ml-1">
                          cal
                        </span>
                      </div>
                      <div className="win98-contribution-item">
                        <span className="win98-contribution-value">
                          {contribution.protein}g
                        </span>
                        <span className="win98-contribution-label ml-1">
                          protein
                        </span>
                      </div>
                      <div className="win98-contribution-item">
                        <span className="win98-contribution-value">
                          {contribution.carbs}g
                        </span>
                        <span className="win98-contribution-label ml-1">
                          carbs
                        </span>
                      </div>
                      <div className="win98-contribution-item">
                        <span className="win98-contribution-value">
                          {contribution.fats}g
                        </span>
                        <span className="win98-contribution-label ml-1">
                          fats
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto md:order-1">
                    <IngredientImageSwitcher
                      image1={recipeIngredient.ingredient.image1 as string}
                      image2={recipeIngredient.ingredient.image2 as string}
                      alt={recipeIngredient.ingredient.name}
                    />
                  </div>
                </div>
              )
            })}
            {recipe.ingredients.length === 0 && (
              <div className="win98-empty-state">
                No ingredients added yet. Click the search button above to add
                ingredients.
              </div>
            )}
          </div>
        </div>
      </div>

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
