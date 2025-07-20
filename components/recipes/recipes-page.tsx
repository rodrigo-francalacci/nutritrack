'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, ChefHat, PlusCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Recipe, DailyNutrition } from '@/lib/types/database'
import Link from 'next/link'

// --- Helper Component: RecipeCard ---
// This component encapsulates the logic for a single recipe card, including nutrition calculation.

interface RecipeCardProps {
  recipe: Recipe
  onDelete: (recipeId: string) => void
  onAddToToday: (recipe: Recipe) => void
}

function RecipeCard({ recipe, onDelete, onAddToToday }: RecipeCardProps) {
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
  })

  useEffect(() => {
    const calculateNutrition = () => {
      let totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }

      if (!recipe.ingredients) return totals

      recipe.ingredients.forEach(item => {
        const { ingredient, quantity, unit } = item
        if (!ingredient) return

        // Determine the gram equivalent for the ingredient's quantity
        const gramsEquivalent = unit
          ? quantity * unit.gramsEquivalent
          : quantity // Assume grams if no unit

        // Add the scaled nutrition to the totals
        totals.calories += ingredient.calories * gramsEquivalent
        totals.protein += ingredient.protein * gramsEquivalent
        totals.carbs += ingredient.carbs * gramsEquivalent
        totals.fats += ingredient.fats * gramsEquivalent
        totals.fiber += ingredient.fiber * gramsEquivalent
      })

      // Apply the recipe's overall scaling factor
      const factor = recipe.scalingFactor || 1
      totals = {
        calories: totals.calories * factor,
        protein: totals.protein * factor,
        carbs: totals.carbs * factor,
        fats: totals.fats * factor,
        fiber: totals.fiber * factor,
      }

      return totals
    }

    setNutrition(calculateNutrition())
  }, [recipe])

  return (
    <div className="win98-recipe-card">
      <div className="win98-recipe-header">
        <div className="win98-recipe-name">{recipe.name}</div>
        <div className="win98-recipe-actions">
          <button
            onClick={() => onAddToToday(recipe)}
            className="win98-button"
            title="Add to Today's Nutrition"
          >
            <PlusCircle className="w-3 h-3" />
          </button>
          <Link href={`/recipes/${recipe.id}`}>
            <button className="win98-button" title="Edit recipe">
              <Edit3 className="w-3 h-3" />
            </button>
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="win98-button"
            title="Delete recipe"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Nutrition Facts Display */}
      <div className="win98-nutrition-grid my-2">
        <div className="win98-nutrition-item"><span className="win98-nutrition-value">{nutrition.calories.toFixed(0)}</span><span className="win98-nutrition-label">Calories</span></div>
        <div className="win98-nutrition-item"><span className="win98-nutrition-value">{nutrition.protein.toFixed(1)}</span><span className="win98-nutrition-label">Protein</span></div>
        <div className="win98-nutrition-item"><span className="win98-nutrition-value">{nutrition.carbs.toFixed(1)}</span><span className="win98-nutrition-label">Carbs</span></div>
        <div className="win98-nutrition-item"><span className="win98-nutrition-value">{nutrition.fats.toFixed(1)}</span><span className="win98-nutrition-label">Fats</span></div>
        <div className="win98-nutrition-item"><span className="win98-nutrition-value">{nutrition.fiber.toFixed(1)}</span><span className="win98-nutrition-label">Fiber</span></div>
      </div>
      
      <div className="win98-recipe-details">
        {recipe.instructions && (
          <div className="win98-recipe-instructions">
            {recipe.instructions.length > 100
              ? `${recipe.instructions.substring(0, 100)}...`
              : recipe.instructions
            }
          </div>
        )}
      </div>
      
      <div className="win98-recipe-footer">
        <div className="win98-text-xs win98-gray-text">
          Updated: {new Date(recipe.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}


// --- Main Page Component ---

export function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    const filtered = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredRecipes(filtered)
  }, [recipes, searchTerm])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const data = await response.json()
      setRecipes(data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      toast({ title: 'Error', description: 'Failed to load recipes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete recipe')
      await fetchRecipes()
      toast({ title: 'Success', description: 'Recipe deleted successfully' })
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast({ title: 'Error', description: 'Failed to delete recipe', variant: 'destructive' })
    }
  }

  const handleAddRecipeToToday = async (recipe: Recipe) => {
    try {
      // 1. Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0]

      // 2. Fetch today's existing nutrition data
      const nutritionResponse = await fetch(`/api/daily-nutrition?date=${today}`)
      let currentNutrition: Partial<DailyNutrition> = {}
      if (nutritionResponse.ok) {
        const data = await nutritionResponse.json()
        currentNutrition = Array.isArray(data) ? data[0] || {} : data || {}
      }

      // 3. Calculate the recipe's nutrition contribution
      const recipeNutrition = calculateRecipeNutrition(recipe)

      // 4. Add the recipe's nutrition to the current daily totals
      const updatedNutrition: Partial<DailyNutrition> = {
        date: today,
        calories: (currentNutrition.calories || 0) + recipeNutrition.calories,
        protein: (currentNutrition.protein || 0) + recipeNutrition.protein,
        carbs: (currentNutrition.carbs || 0) + recipeNutrition.carbs,
        fats: (currentNutrition.fats || 0) + recipeNutrition.fats,
        fiber: (currentNutrition.fiber || 0) + recipeNutrition.fiber,
        water: currentNutrition.water || 0, // Water is not in recipes, so we preserve it
      }

      // 5. Save the updated data
      const saveResponse = await fetch('/api/daily-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNutrition),
      })

      if (!saveResponse.ok) throw new Error('Failed to update daily nutrition')

      toast({
        title: 'Success!',
        description: `"${recipe.name}" has been added to today's nutrition.`,
      })

    } catch (error) {
      console.error("Error adding recipe to today's nutrition:", error)
      toast({ title: 'Error', description: 'Could not add recipe to today.', variant: 'destructive' })
    }
  }

  // Helper function to be used by the "Add to Today" feature
  const calculateRecipeNutrition = (recipe: Recipe) => {
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    if (!recipe.ingredients) return totals
    recipe.ingredients.forEach(item => {
      const { ingredient, quantity, unit } = item
      if (!ingredient) return
      const gramsEquivalent = unit ? quantity * unit.gramsEquivalent : quantity
      totals.calories += ingredient.calories * gramsEquivalent
      totals.protein += ingredient.protein * gramsEquivalent
      totals.carbs += ingredient.carbs * gramsEquivalent
      totals.fats += ingredient.fats * gramsEquivalent
      totals.fiber += ingredient.fiber * gramsEquivalent
    })
    const factor = recipe.scalingFactor || 1
    return {
      calories: totals.calories * factor,
      protein: totals.protein * factor,
      carbs: totals.carbs * factor,
      fats: totals.fats * factor,
      fiber: totals.fiber * factor,
    }
  }

  const createNewRecipe = async () => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Recipe', instructions: '', scalingFactor: 1 }),
      })
      if (!response.ok) throw new Error('Failed to create recipe')
      const newRecipe = await response.json()
      window.location.href = `/recipes/${newRecipe.id}`
    } catch (error) {
      console.error('Error creating recipe:', error)
      toast({ title: 'Error', description: 'Failed to create recipe', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="win98-container"><div className="win98-panel"><div className="win98-text-sm">Loading recipes...</div></div></div>
    )
  }

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="win98-panel">
        <div className="win98-title-bar"><ChefHat className="w-3 h-3 mr-1" />Recipe Management</div>
        <div className="win98-form-container">
          <div className="win98-form-row-inline">
            <button onClick={createNewRecipe} className="win98-button"><Plus className="w-3 h-3 mr-1" />New Recipe</button>
            <div className="flex-1">
              <input type="text" placeholder="Search recipes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="win98-input w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="win98-panel">
        <div className="win98-title-bar">Recipes ({filteredRecipes.length})</div>
        <div className="win98-recipes-grid">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={handleDeleteRecipe}
              onAddToToday={handleAddRecipeToToday}
            />
          ))}
          {filteredRecipes.length === 0 && (
            <div className="win98-empty-state">
              {searchTerm ? 'No recipes found.' : 'No recipes created yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
