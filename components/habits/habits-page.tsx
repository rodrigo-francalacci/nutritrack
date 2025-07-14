
'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckSquare, X, Trash2, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Habit, HabitCompletion } from '@/lib/types/database'

interface ExtendedHabit extends Habit {
  completions: HabitCompletion[]
}

export function HabitsPage() {
  const [habits, setHabits] = useState<ExtendedHabit[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchHabits()
  }, [selectedMonth])

  const fetchHabits = async () => {
    try {
      const response = await fetch(`/api/habits?month=${selectedMonth}`)
      if (!response.ok) throw new Error('Failed to fetch habits')
      const data = await response.json()
      setHabits(data)
    } catch (error) {
      console.error('Error fetching habits:', error)
      toast({
        title: 'Error',
        description: 'Failed to load habits',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const createHabit = async () => {
    if (!newHabitName.trim()) return

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHabitName.trim(),
          description: newHabitDescription.trim() || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create habit')

      setNewHabitName('')
      setNewHabitDescription('')
      setIsAddingHabit(false)
      await fetchHabits()
      
      toast({
        title: 'Success',
        description: 'Habit created successfully',
      })
    } catch (error) {
      console.error('Error creating habit:', error)
      toast({
        title: 'Error',
        description: 'Failed to create habit',
        variant: 'destructive',
      })
    }
  }

  const deleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete habit')

      await fetchHabits()
      toast({
        title: 'Success',
        description: 'Habit deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting habit:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete habit',
        variant: 'destructive',
      })
    }
  }

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const response = await fetch('/api/habit-completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          date,
        }),
      })

      if (!response.ok) throw new Error('Failed to toggle habit completion')

      await fetchHabits()
    } catch (error) {
      console.error('Error toggling habit completion:', error)
      toast({
        title: 'Error',
        description: 'Failed to update habit completion',
        variant: 'destructive',
      })
    }
  }

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      return { day, date }
    })
  }

  const isHabitCompletedOnDate = (habit: ExtendedHabit, date: string) => {
    return habit.completions.some(completion => 
      completion.date.toString().startsWith(date) && completion.completed
    )
  }

  const getHabitCompletionCount = (habit: ExtendedHabit) => {
    return habit.completions.filter(c => c.completed).length
  }

  const getHabitCompletionPercentage = (habit: ExtendedHabit, totalDays: number) => {
    const completedDays = getHabitCompletionCount(habit)
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  }

  const days = getDaysInMonth(selectedMonth)

  if (loading) {
    return (
      <div className="win98-container">
        <div className="win98-panel">
          <div className="win98-text-sm">Loading habits...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <CheckSquare className="w-3 h-3 mr-1" />
          Habit Tracker Matrix
        </div>
        
        <div className="win98-form-container">
          <div className="win98-form-row-inline">
            <button
              onClick={() => setIsAddingHabit(true)}
              className="win98-button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Habit
            </button>
            
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="win98-date-input"
            />
          </div>
          
          {isAddingHabit && (
            <div className="win98-form-container">
              <div className="win98-form-row">
                <label className="win98-label">Habit Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Enter habit name..."
                  className="win98-input"
                />
              </div>
              <div className="win98-form-row">
                <label className="win98-label">Description (Optional)</label>
                <input
                  type="text"
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  placeholder="Enter description..."
                  className="win98-input"
                />
              </div>
              <div className="win98-form-row-inline">
                <button onClick={createHabit} className="win98-button">
                  <CheckSquare className="w-3 h-3 mr-1" />
                  Create Habit
                </button>
                <button onClick={() => setIsAddingHabit(false)} className="win98-button">
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Habit Matrix */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <BarChart3 className="w-3 h-3 mr-1" />
          {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {days.length} Days
        </div>
        
        {habits.length === 0 ? (
          <div className="win98-empty-state">
            No habits created yet. Add a habit to start tracking!
          </div>
        ) : (
          <div className="win98-habit-matrix-container">
            <div className="win98-habit-matrix">
              {/* Header */}
              <div className="win98-habit-matrix-header">
                <div className="win98-habit-matrix-header-row">
                  <div className="win98-habit-matrix-header-cell">Habit</div>
                  {days.map(({ day, date }) => (
                    <div key={date} className="win98-habit-matrix-header-cell">
                      {day}
                    </div>
                  ))}
                  <div className="win98-habit-matrix-header-cell">%</div>
                  <div className="win98-habit-matrix-header-cell">Actions</div>
                </div>
              </div>
              
              {/* Body */}
              <div className="win98-habit-matrix-body">
                {habits.map((habit) => (
                  <div key={habit.id} className="win98-habit-matrix-row">
                    <div 
                      className="win98-habit-matrix-name-cell"
                      title={habit.description || habit.name}
                    >
                      {habit.name}
                    </div>
                    
                    {days.map(({ day, date }) => (
                      <div
                        key={date}
                        className={`win98-habit-matrix-day-cell ${
                          isHabitCompletedOnDate(habit, date) ? 'completed' : ''
                        }`}
                        onClick={() => toggleHabitCompletion(habit.id, date)}
                        title={`${habit.name} - Day ${day} (${date})`}
                      >
                        {/* Checkmark will be added via CSS ::after */}
                      </div>
                    ))}
                    
                    <div className="win98-habit-matrix-stats">
                      {getHabitCompletionPercentage(habit, days.length)}%
                    </div>
                    
                    <div className="win98-habit-actions-cell">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="win98-button"
                        title="Delete habit"
                        style={{ padding: '0 2px', minHeight: '16px' }}
                      >
                        <Trash2 className="w-2 h-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {habits.length > 0 && (
        <div className="win98-panel">
          <div className="win98-title-bar">
            <BarChart3 className="w-3 h-3 mr-1" />
            Monthly Summary
          </div>
          
          <div className="win98-stats-grid">
            <div className="win98-stat-item">
              <div className="win98-stat-value">{habits.length}</div>
              <div className="win98-stat-label">Habits</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">{days.length}</div>
              <div className="win98-stat-label">Days</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">
                {habits.reduce((sum, habit) => sum + getHabitCompletionCount(habit), 0)}
              </div>
              <div className="win98-stat-label">Completions</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">
                {habits.length > 0 ? Math.round(
                  habits.reduce((sum, habit) => sum + getHabitCompletionPercentage(habit, days.length), 0) / habits.length
                ) : 0}%
              </div>
              <div className="win98-stat-label">Avg Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
