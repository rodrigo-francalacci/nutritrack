
import { Suspense } from 'react'
import { RecipesPage } from '@/components/recipes/recipes-page'

export default function Recipes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-600 mt-1">
            Create and manage recipes with automatic nutritional calculations
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }>
        <RecipesPage />
      </Suspense>
    </div>
  )
}
