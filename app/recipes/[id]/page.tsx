
import { Suspense } from 'react'
import { RecipeEditor } from '@/components/recipes/recipe-editor'

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }>
        <RecipeEditor recipeId={params.id} />
      </Suspense>
    </div>
  )
}
