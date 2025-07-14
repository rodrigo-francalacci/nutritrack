
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Dumbbell, Play, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Exercise, WorkoutPlan } from '@/lib/types/database'
import { WorkoutPlanner } from './workout-planner'
import { ExerciseLibrary } from './exercise-library'

export function ExercisesPage() {
  const [activeTab, setActiveTab] = useState<'library' | 'planner'>('library')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([fetchExercises(), fetchWorkoutPlans()])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises')
      if (!response.ok) throw new Error('Failed to fetch exercises')
      const data = await response.json()
      setExercises(data)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      toast({
        title: 'Error',
        description: 'Failed to load exercises',
        variant: 'destructive',
      })
    }
  }

  const fetchWorkoutPlans = async () => {
    try {
      const response = await fetch('/api/workout-plans')
      if (!response.ok) throw new Error('Failed to fetch workout plans')
      const data = await response.json()
      setWorkoutPlans(data)
    } catch (error) {
      console.error('Error fetching workout plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load workout plans',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="win98-container">
        <div className="win98-panel">
          <div className="win98-text-sm">Loading exercises...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Dumbbell className="w-3 h-3 mr-1" />
          Exercise Management
        </div>
        
        <div className="win98-tabs">
          <button
            onClick={() => setActiveTab('library')}
            className={`win98-tab ${activeTab === 'library' ? 'active' : ''}`}
          >
            <Dumbbell className="w-3 h-3 mr-1" />
            Exercise Library
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`win98-tab ${activeTab === 'planner' ? 'active' : ''}`}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Workout Planner
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="win98-tab-content">
        {activeTab === 'library' && (
          <ExerciseLibrary 
            exercises={exercises}
            onRefresh={fetchExercises}
          />
        )}
        {activeTab === 'planner' && (
          <WorkoutPlanner 
            exercises={exercises}
            workoutPlans={workoutPlans}
            onRefresh={fetchWorkoutPlans}
          />
        )}
      </div>
    </div>
  )
}
