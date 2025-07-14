
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, ChefHat, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Recipe } from '@/lib/types/database'
import Link from 'next/link'

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
    filterRecipes()
  }, [recipes, searchTerm])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const data = await response.json()
      setRecipes(data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      toast({
        title: 'Error',
        description: 'Failed to load recipes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRecipes = () => {
    const filtered = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredRecipes(filtered)
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete recipe')

      await fetchRecipes()
      toast({
        title: 'Success',
        description: 'Recipe deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        variant: 'destructive',
      })
    }
  }

  const createNewRecipe = async () => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Recipe',
          instructions: '',
          scalingFactor: 1,
        }),
      })

      if (!response.ok) throw new Error('Failed to create recipe')

      const newRecipe = await response.json()
      window.location.href = `/recipes/${newRecipe.id}`
    } catch (error) {
      console.error('Error creating recipe:', error)
      toast({
        title: 'Error',
        description: 'Failed to create recipe',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="win98-container">
        <div className="win98-panel">
          <div className="win98-text-sm">Loading recipes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <ChefHat className="w-3 h-3 mr-1" />
          Recipe Management
        </div>
        
        <div className="win98-form-container">
          <div className="win98-form-row-inline">
            <button
              onClick={createNewRecipe}
              className="win98-button"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Recipe
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="win98-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          Recipes ({filteredRecipes.length})
        </div>
        
        <div className="win98-recipes-grid">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="win98-recipe-card">
              <div className="win98-recipe-header">
                <div className="win98-recipe-name">{recipe.name}</div>
                <div className="win98-recipe-actions">
                  <Link href={`/recipes/${recipe.id}`}>
                    <button className="win98-button" title="Edit recipe">
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="win98-button"
                    title="Delete recipe"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="win98-recipe-details">
                <div className="win98-recipe-scaling">
                  <span className="win98-text-xs">Scaling: {recipe.scalingFactor}x</span>
                </div>
                
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
          ))}
          
          {filteredRecipes.length === 0 && (
            <div className="win98-empty-state">
              {searchTerm ? 'No recipes found matching your search.' : 'No recipes created yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
