
import { Suspense } from 'react'
import { IngredientsPage } from '@/components/ingredients/ingredients-page'

export default function Ingredients() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    }>
      <IngredientsPage />
    </Suspense>
  )
}
