
'use client'

import { useState, useEffect } from 'react'
import { Save, X, Plus, Trash2 } from 'lucide-react'
import { Exercise } from '@/lib/types/database'

interface ExerciseEditorProps {
  exercise: Exercise | null
  onSave: (data: Partial<Exercise>) => void
  onCancel: () => void
}

export function ExerciseEditor({ exercise, onSave, onCancel }: ExerciseEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    musclesInvolved: [] as string[],
    photo: '',
    video: '',
  })

  const [newMuscle, setNewMuscle] = useState('')

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        description: exercise.description || '',
        musclesInvolved: exercise.musclesInvolved || [],
        photo: exercise.photo || '',
        video: exercise.video || '',
      })
    }
  }, [exercise])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      photo: formData.photo.trim() || null,
      video: formData.video.trim() || null,
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const addMuscle = () => {
    if (newMuscle.trim() && !formData.musclesInvolved.includes(newMuscle.trim())) {
      setFormData(prev => ({
        ...prev,
        musclesInvolved: [...prev.musclesInvolved, newMuscle.trim()],
      }))
      setNewMuscle('')
    }
  }

  const removeMuscle = (muscle: string) => {
    setFormData(prev => ({
      ...prev,
      musclesInvolved: prev.musclesInvolved.filter(m => m !== muscle),
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addMuscle()
    }
  }

  return (
    <div className="win98-modal-content">
      <form onSubmit={handleSubmit} className="win98-form-container">
        <div className="win98-form-row">
          <label className="win98-label">Exercise Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter exercise name..."
            className="win98-input"
            required
          />
        </div>

        <div className="win98-form-row">
          <label className="win98-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the exercise..."
            className="win98-input win98-textarea"
            rows={3}
          />
        </div>

        <div className="win98-form-row">
          <label className="win98-label">Photo URL</label>
          <input
            type="url"
            value={formData.photo}
            onChange={(e) => handleChange('photo', e.target.value)}
            placeholder="Exercise photo URL (optional)"
            className="win98-input"
          />
        </div>

        <div className="win98-form-row">
          <label className="win98-label">Video URL</label>
          <input
            type="url"
            value={formData.video}
            onChange={(e) => handleChange('video', e.target.value)}
            placeholder="Exercise video URL (optional)"
            className="win98-input"
          />
        </div>

        <div className="win98-form-row">
          <label className="win98-label">Muscles Involved</label>
          <div className="win98-form-row-inline">
            <input
              type="text"
              value={newMuscle}
              onChange={(e) => setNewMuscle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add muscle group..."
              className="win98-input flex-1"
            />
            <button
              type="button"
              onClick={addMuscle}
              className="win98-button"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          {formData.musclesInvolved.length > 0 && (
            <div className="win98-muscle-tags">
              {formData.musclesInvolved.map((muscle) => (
                <div key={muscle} className="win98-muscle-tag">
                  <span>{muscle}</span>
                  <button
                    type="button"
                    onClick={() => removeMuscle(muscle)}
                    className="win98-muscle-tag-remove"
                  >
                    <Trash2 className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>



        <div className="win98-form-row-inline">
          <button type="submit" className="win98-button">
            <Save className="w-3 h-3 mr-1" />
            {exercise ? 'Update Exercise' : 'Create Exercise'}
          </button>
          <button type="button" onClick={onCancel} className="win98-button">
            <X className="w-3 h-3 mr-1" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
