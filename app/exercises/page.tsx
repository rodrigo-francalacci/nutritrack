
import { Suspense } from 'react'
import { ExercisesPage } from '@/components/exercises/exercises-page'

export default function Exercises() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercises</h1>
          <p className="text-gray-600 mt-1">
            Build your exercise library and plan weekly workouts
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }>
        <ExercisesPage />
      </Suspense>
    </div>
  )
}
