'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Carrot, BookOpenText, Dumbbell, CheckSquare, Activity, Target } from 'lucide-react'
import { DailyNutrition } from '@/lib/types/database' // Make sure this path is correct

export default function HomePage() {
  const [dailyFacts, setDailyFacts] = useState<DailyNutrition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodaysFacts = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await fetch(`/api/daily-nutrition?date=${today}`)
        
        if (response.ok) {
          const data = await response.json()
          // The API might return an array, so we handle that case
          setDailyFacts(Array.isArray(data) ? data[0] || null : data)
        } else {
          // If no data for today, set to null
          setDailyFacts(null)
        }
      } catch (error) {
        console.error("Failed to fetch today's nutrition facts:", error)
        setDailyFacts(null) // Set to null on error
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysFacts()
  }, [])

  return (
    <div className="win98-container">
      {/* Hero Section */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Activity className="w-3 h-3 mr-1" />
          Welcome to NutriTrack
        </div>
        <div className="text-center">
          <div className="win98-text-lg font-bold mb-2">
            Your comprehensive nutrition and fitness tracking companion
          </div>
          <div className="win98-text-sm win98-gray-text">
            Track ingredients, create recipes, plan workouts, and build healthy habits
          </div>
        </div>
      </div>

      {/* Today's Nutrition Stats */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Target className="w-3 h-3 mr-1" />
          Today's Nutrition
        </div>
        {loading ? (
          <div className="p-4 text-center win98-text-sm">Loading today's stats...</div>
        ) : (
          <div className="win98-stats-grid">
            <div className="win98-stat-item">
              <div className="win98-stat-value">{(dailyFacts?.calories ?? 0).toFixed(0)}</div>
              <div className="win98-stat-label">Calories</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">{(dailyFacts?.protein ?? 0).toFixed(1)}g</div>
              <div className="win98-stat-label">Protein</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">{(dailyFacts?.carbs ?? 0).toFixed(1)}g</div>
              <div className="win98-stat-label">Carbs</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">{(dailyFacts?.fats ?? 0).toFixed(1)}g</div>
              <div className="win98-stat-label">Fats</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">{(dailyFacts?.fiber ?? 0).toFixed(1)}g</div>
              <div className="win98-stat-label">Fiber</div>
            </div>
            <div className="win98-stat-item">
              <div className="win98-stat-value">{(dailyFacts?.water ?? 0).toFixed(2)}L</div>
              <div className="win98-stat-label">Water</div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="win98-home-grid">
        <Link href="/ingredients" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon"><Carrot className="w-4 h-4" /></div>
            <div className="win98-home-card-title">Ingredients</div>
          </div>
          <div className="win98-home-card-content">
            Track nutritional information for all your ingredients
          </div>
        </Link>
        <Link href="/recipes" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon"><BookOpenText className="w-4 h-4" /></div>
            <div className="win98-home-card-title">Recipes</div>
          </div>
          <div className="win98-home-card-content">
            Create recipes with automatic nutritional calculations
          </div>
        </Link>
        <Link href="/exercises" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon"><Dumbbell className="w-4 h-4" /></div>
            <div className="win98-home-card-title">Exercises</div>
          </div>
          <div className="win98-home-card-content">
            Build your exercise library and plan weekly workouts
          </div>
        </Link>
        <Link href="/habits" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon"><CheckSquare className="w-4 h-4" /></div>
            <div className="win98-home-card-title">Habits</div>
          </div>
          <div className="win98-home-card-content">
            Track daily habits with a visual completion matrix
          </div>
        </Link>
        <Link href="/daily-tracking" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon"><Activity className="w-4 h-4" /></div>
            <div className="win98-home-card-title">Daily Tracking</div>
          </div>
          <div className="win98-home-card-content">
            Record daily nutrition and body metrics with historical data
          </div>
        </Link>
      </div>

      {/* Getting Started */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Target className="w-3 h-3 mr-1" />
          Getting Started
        </div>
        <div className="win98-getting-started">
          <div className="win98-getting-started-text">
            Start by adding some ingredients, then create recipes and plan your workouts.
          </div>
          <div className="win98-getting-started-actions">
            <Link href="/ingredients">
              <button className="win98-button"><Carrot className="w-3 h-3 mr-1" />Add Your First Ingredient</button>
            </Link>
            <Link href="/recipes">
              <button className="win98-button"><BookOpenText className="w-3 h-3 mr-1" />Create Your First Recipe</button>
            </Link>
            <Link href="/exercises">
              <button className="win98-button"><Dumbbell className="w-3 h-3 mr-1" />Build Exercise Library</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
