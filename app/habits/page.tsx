
import { Suspense } from 'react'
import { HabitsPage } from '@/components/habits/habits-page'

export default function Habits() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-600 mt-1">
            Track daily habits with a visual completion matrix
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      }>
        <HabitsPage />
      </Suspense>
    </div>
  )
}
