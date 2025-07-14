
'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Play, Edit3, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Exercise, WorkoutPlan, WorkoutExercise } from '@/lib/types/database'

interface WorkoutPlannerProps {
  exercises: Exercise[]
  workoutPlans: WorkoutPlan[]
  onRefresh: () => void
}

interface ExtendedWorkoutPlan extends WorkoutPlan {
  exercises: (WorkoutExercise & { exercise: Exercise })[]
}

export function WorkoutPlanner({ exercises, workoutPlans, onRefresh }: WorkoutPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentWorkout, setCurrentWorkout] = useState<ExtendedWorkoutPlan | null>(null)
  const [workoutName, setWorkoutName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Safety check for exercises prop
  const safeExercises = exercises || []

  useEffect(() => {
    fetchWorkoutForDate(selectedDate)
  }, [selectedDate])

  const fetchWorkoutForDate = async (date: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/workout-plans?date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch workout')
      
      const data = await response.json()
      setCurrentWorkout(data)
      setWorkoutName(data?.name || '')
    } catch (error) {
      console.error('Error fetching workout:', error)
      setCurrentWorkout(null)
      setWorkoutName('')
    } finally {
      setLoading(false)
    }
  }

  const createWorkout = async () => {
    try {
      const response = await fetch('/api/workout-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workoutName || `Workout ${selectedDate}`,
          date: selectedDate,
        }),
      })

      if (!response.ok) throw new Error('Failed to create workout')

      await fetchWorkoutForDate(selectedDate)
      onRefresh()
      toast({
        title: 'Success',
        description: 'Workout created successfully',
      })
    } catch (error) {
      console.error('Error creating workout:', error)
      toast({
        title: 'Error',
        description: 'Failed to create workout',
        variant: 'destructive',
      })
    }
  }

  const deleteWorkout = async () => {
    if (!currentWorkout) return
    if (!confirm('Are you sure you want to delete this workout?')) return

    try {
      const response = await fetch(`/api/workout-plans/${currentWorkout.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete workout')

      await fetchWorkoutForDate(selectedDate)
      onRefresh()
      toast({
        title: 'Success',
        description: 'Workout deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting workout:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete workout',
        variant: 'destructive',
      })
    }
  }

  const addExerciseToWorkout = async (exerciseId: string) => {
    if (!currentWorkout) return

    try {
      const response = await fetch('/api/workout-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutPlanId: currentWorkout.id,
          exerciseId: exerciseId,
          reps: 10,
          series: 3,
          weight: 0,
        }),
      })

      if (!response.ok) throw new Error('Failed to add exercise')

      await fetchWorkoutForDate(selectedDate)
      toast({
        title: 'Success',
        description: 'Exercise added to workout',
      })
    } catch (error) {
      console.error('Error adding exercise:', error)
      toast({
        title: 'Error',
        description: 'Failed to add exercise',
        variant: 'destructive',
      })
    }
  }

  const updateWorkoutExercise = async (workoutExerciseId: string, updates: Partial<WorkoutExercise>) => {
    try {
      const response = await fetch(`/api/workout-exercises/${workoutExerciseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update exercise')

      await fetchWorkoutForDate(selectedDate)
    } catch (error) {
      console.error('Error updating exercise:', error)
      toast({
        title: 'Error',
        description: 'Failed to update exercise',
        variant: 'destructive',
      })
    }
  }

  const removeExerciseFromWorkout = async (workoutExerciseId: string) => {
    try {
      const response = await fetch(`/api/workout-exercises/${workoutExerciseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove exercise')

      await fetchWorkoutForDate(selectedDate)
      toast({
        title: 'Success',
        description: 'Exercise removed from workout',
      })
    } catch (error) {
      console.error('Error removing exercise:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove exercise',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="win98-container">
      {/* Date Selection */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Calendar className="w-3 h-3 mr-1" />
          Workout Planner
        </div>
        
        <div className="win98-workout-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="win98-date-input"
          />
          
          {!currentWorkout && (
            <>
              <input
                type="text"
                placeholder="Workout name..."
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="win98-input flex-1"
              />
              <button
                onClick={createWorkout}
                className="win98-button"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Workout
              </button>
            </>
          )}
          
          {currentWorkout && (
            <button
              onClick={deleteWorkout}
              className="win98-button"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Workout
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="win98-panel">
          <div className="win98-text-sm">Loading workout...</div>
        </div>
      )}

      {!loading && !currentWorkout && (
        <div className="win98-panel">
          <div className="win98-empty-state">
            No workout planned for {selectedDate}. Create one to get started!
          </div>
        </div>
      )}

      {!loading && currentWorkout && (
        <>
          {/* Current Workout */}
          <div className="win98-panel">
            <div className="win98-title-bar">
              {currentWorkout.name}
            </div>
            
            <div className="win98-workout-list">
              {(currentWorkout.exercises || []).map((workoutExercise) => (
                <div key={workoutExercise.id} className="win98-exercise-row">
                  <div className="win98-exercise-name">
                    {workoutExercise.exercise?.name || 'Unknown Exercise'}
                  </div>
                  
                  <div className="win98-exercise-controls">
                    <div className="win98-form-row-inline">
                      <label className="win98-text-xs">Reps:</label>
                      <input
                        type="number"
                        value={workoutExercise.reps || 0}
                        onChange={(e) => updateWorkoutExercise(workoutExercise.id, {
                          reps: parseInt(e.target.value) || 0
                        })}
                        className="win98-input win98-exercise-input"
                      />
                    </div>
                    
                    <div className="win98-form-row-inline">
                      <label className="win98-text-xs">Sets:</label>
                      <input
                        type="number"
                        value={workoutExercise.series || 0}
                        onChange={(e) => updateWorkoutExercise(workoutExercise.id, {
                          series: parseInt(e.target.value) || 0
                        })}
                        className="win98-input win98-exercise-input"
                      />
                    </div>
                    
                    <div className="win98-form-row-inline">
                      <label className="win98-text-xs">Weight:</label>
                      <input
                        type="number"
                        step="0.5"
                        value={workoutExercise.weight || 0}
                        onChange={(e) => updateWorkoutExercise(workoutExercise.id, {
                          weight: parseFloat(e.target.value) || 0
                        })}
                        className="win98-input win98-exercise-input"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeExerciseFromWorkout(workoutExercise.id)}
                      className="win98-button"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              {(currentWorkout.exercises || []).length === 0 && (
                <div className="win98-empty-state">
                  No exercises added yet. Add exercises from the list below.
                </div>
              )}
            </div>
          </div>

          {/* Add Exercises */}
          <div className="win98-panel">
            <div className="win98-title-bar">
              Add Exercises
            </div>
            
            <div className="win98-exercises-grid">
              {safeExercises
                .filter(exercise => !(currentWorkout.exercises || []).some(we => we.exerciseId === exercise.id))
                .map((exercise) => (
                  <div key={exercise.id} className="win98-exercise-card">
                    <div className="win98-exercise-header">
                      <div className="win98-exercise-name">{exercise.name}</div>
                      <button
                        onClick={() => addExerciseToWorkout(exercise.id)}
                        className="win98-button"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="win98-exercise-details">
                      {exercise.description && (
                        <div className="win98-exercise-description">
                          {exercise.description.length > 80 
                            ? `${exercise.description.substring(0, 80)}...`
                            : exercise.description
                          }
                        </div>
                      )}
                      
                      <div className="win98-exercise-muscles">
                        {exercise.musclesInvolved?.join(', ') || 'No muscles specified'}
                      </div>
                    </div>
                  </div>
                ))}
              
              {safeExercises.filter(exercise => !(currentWorkout.exercises || []).some(we => we.exerciseId === exercise.id)).length === 0 && (
                <div className="win98-empty-state">
                  All exercises have been added to this workout.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
