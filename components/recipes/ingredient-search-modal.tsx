
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, X, Calculator } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Ingredient, CustomUnit } from '@/lib/types/database'

interface IngredientSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectIngredient: (ingredientId: string) => void
  excludeIngredientIds?: string[] // Already added ingredients to filter out
  allIngredients: (Ingredient & { customUnits: CustomUnit[] })[]
}

export function IngredientSearchModal({
  isOpen,
  onClose,
  onSelectIngredient,
  excludeIngredientIds = [],
  allIngredients
}: IngredientSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Clear search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedCategory('all')
    }
  }, [isOpen])

  // Filter and search ingredients
  const filteredIngredients = useMemo(() => {
    let filtered = allIngredients.filter(
      ingredient => !excludeIngredientIds.includes(ingredient.id)
    )

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(search) ||
        ingredient.notes?.toLowerCase().includes(search)
      )
    }

    // Sort by name for consistent ordering
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [allIngredients, excludeIngredientIds, searchTerm])

  // Get ingredient categories for filtering (based on first word or common patterns)
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    allIngredients.forEach(ingredient => {
      const words = ingredient.name.toLowerCase().split(' ')
      if (words.length > 1) {
        // Check for common category words
        const categoryWords = ['chicken', 'beef', 'fish', 'rice', 'pasta', 'bread', 'cheese', 'milk', 'oil', 'sauce']
        const foundCategory = categoryWords.find(cat => ingredient.name.toLowerCase().includes(cat))
        if (foundCategory) {
          categorySet.add(foundCategory)
        }
      }
    })
    return Array.from(categorySet).sort()
  }, [allIngredients])

  const handleSelectIngredient = (ingredientId: string) => {
    onSelectIngredient(ingredientId)
    onClose()
  }

  const IngredientCard = ({ ingredient }: { ingredient: Ingredient & { customUnits: CustomUnit[] } }) => (
    <div 
      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group"
      onClick={() => handleSelectIngredient(ingredient.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
            {ingredient.name}
          </h3>
          {ingredient.notes && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {ingredient.notes}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            handleSelectIngredient(ingredient.id)
          }}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Nutritional info */}
      <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
        <div className="text-center p-1 bg-gray-50 rounded">
          <div className="font-medium">{ingredient.calories.toFixed(1)}</div>
          <div className="text-gray-600">cal/g</div>
        </div>
        <div className="text-center p-1 bg-gray-50 rounded">
          <div className="font-medium">{ingredient.protein.toFixed(1)}g</div>
          <div className="text-gray-600">protein</div>
        </div>
        <div className="text-center p-1 bg-gray-50 rounded">
          <div className="font-medium">{ingredient.carbs.toFixed(1)}g</div>
          <div className="text-gray-600">carbs</div>
        </div>
        <div className="text-center p-1 bg-gray-50 rounded">
          <div className="font-medium">{ingredient.fats.toFixed(1)}g</div>
          <div className="text-gray-600">fats</div>
        </div>
      </div>

      {/* Custom units */}
      {ingredient.customUnits && ingredient.customUnits.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">Available units:</div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">grams</Badge>
            {ingredient.customUnits.map((unit) => (
              <Badge key={unit.id} variant="outline" className="text-xs">
                {unit.unitName}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Add Ingredient to Recipe
          </DialogTitle>
        </DialogHeader>

        {/* Search Controls */}
        <div className="space-y-3 border-b pb-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ingredients by name or notes..."
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? 's' : ''} found
            {excludeIngredientIds.length > 0 && (
              <span className="ml-2 text-gray-500">
                ({excludeIngredientIds.length} already added)
              </span>
            )}
          </div>
        </div>

        {/* Ingredients List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ingredient) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? (
                  <div>
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No ingredients found matching "{searchTerm}"</p>
                    <p className="text-sm mt-1">Try adjusting your search terms</p>
                  </div>
                ) : excludeIngredientIds.length === allIngredients.length ? (
                  <div>
                    <Calculator className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>All available ingredients have been added</p>
                    <p className="text-sm mt-1">Create new ingredients if needed</p>
                  </div>
                ) : (
                  <div>
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No ingredients available</p>
                    <p className="text-sm mt-1">Add some ingredients first</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Click on any ingredient to add it to your recipe
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
