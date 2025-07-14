
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Play, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Exercise } from '@/lib/types/database'
import { ExerciseEditor } from './exercise-editor'

interface ExerciseLibraryProps {
  exercises: Exercise[]
  onRefresh: () => void
}

export function ExerciseLibrary({ exercises, onRefresh }: ExerciseLibraryProps) {
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exercises)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    filterExercises()
  }, [exercises, searchTerm])

  const filterExercises = () => {
    const filtered = exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.musclesInvolved.some(muscle => 
        muscle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredExercises(filtered)
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete exercise')

      onRefresh()
      toast({
        title: 'Success',
        description: 'Exercise deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting exercise:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete exercise',
        variant: 'destructive',
      })
    }
  }

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsEditorOpen(true)
  }

  const createNewExercise = () => {
    setSelectedExercise(null)
    setIsEditorOpen(true)
  }

  const handleSaveExercise = async (exerciseData: Partial<Exercise>) => {
    try {
      const url = selectedExercise ? `/api/exercises/${selectedExercise.id}` : '/api/exercises'
      const method = selectedExercise ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exerciseData),
      })

      if (!response.ok) throw new Error('Failed to save exercise')

      onRefresh()
      setIsEditorOpen(false)
      setSelectedExercise(null)
      
      toast({
        title: 'Success',
        description: `Exercise ${selectedExercise ? 'updated' : 'created'} successfully`,
      })
    } catch (error) {
      console.error('Error saving exercise:', error)
      toast({
        title: 'Error',
        description: 'Failed to save exercise',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="win98-container">
      {/* Search and Controls */}
      <div className="win98-panel">
        <div className="win98-form-container">
          <div className="win98-form-row-inline">
            <button
              onClick={createNewExercise}
              className="win98-button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Exercise
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="win98-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          Exercises ({filteredExercises.length})
        </div>
        
        <div className="win98-exercises-grid">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="win98-exercise-card">
              <div className="win98-exercise-header">
                <div className="win98-exercise-name">{exercise.name}</div>
                <div className="win98-exercise-actions">
                  <button
                    onClick={() => handleEditExercise(exercise)}
                    className="win98-button"
                    title="Edit exercise"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="win98-button"
                    title="Delete exercise"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="win98-exercise-details">
                {exercise.description && (
                  <div className="win98-exercise-description">
                    {exercise.description.length > 100 
                      ? `${exercise.description.substring(0, 100)}...`
                      : exercise.description
                    }
                  </div>
                )}
                
                <div className="win98-exercise-muscles">
                  <strong>Muscles:</strong> {exercise.musclesInvolved.join(', ')}
                </div>
              </div>
              
              <div className="win98-recipe-footer">
                <div className="win98-text-xs win98-gray-text">
                  Updated: {new Date(exercise.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          
          {filteredExercises.length === 0 && (
            <div className="win98-empty-state">
              {searchTerm ? 'No exercises found matching your search.' : 'No exercises added yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Editor Modal */}
      {isEditorOpen && (
        <div className="win98-modal-overlay">
          <div className="win98-modal">
            <div className="win98-title-bar">
              <div className="win98-title">
                {selectedExercise ? 'Edit Exercise' : 'Add Exercise'}
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="win98-close-button"
              >
                ×
              </button>
            </div>
            
            <ExerciseEditor
              exercise={selectedExercise}
              onSave={handleSaveExercise}
              onCancel={() => setIsEditorOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
