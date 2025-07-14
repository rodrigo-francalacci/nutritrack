
import Link from 'next/link'
import { Carrot, BookOpenText, Dumbbell, CheckSquare, Activity, Target } from 'lucide-react'

export default function HomePage() {
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

      {/* Feature Cards */}
      <div className="win98-home-grid">
        <Link href="/ingredients" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon">
              <Carrot className="w-4 h-4" />
            </div>
            <div className="win98-home-card-title">Ingredients</div>
          </div>
          <div className="win98-home-card-content">
            Track nutritional information for all your ingredients with custom units
          </div>
        </Link>

        <Link href="/recipes" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon">
              <BookOpenText className="w-4 h-4" />
            </div>
            <div className="win98-home-card-title">Recipes</div>
          </div>
          <div className="win98-home-card-content">
            Create and manage recipes with automatic nutritional calculations
          </div>
        </Link>

        <Link href="/exercises" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="win98-home-card-title">Exercises</div>
          </div>
          <div className="win98-home-card-content">
            Build your exercise library and plan weekly workouts
          </div>
        </Link>

        <Link href="/habits" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="win98-home-card-title">Habits</div>
          </div>
          <div className="win98-home-card-content">
            Track daily habits with a visual completion matrix
          </div>
        </Link>

        <Link href="/daily-tracking" className="win98-home-card">
          <div className="win98-home-card-header">
            <div className="win98-home-card-icon">
              <Activity className="w-4 h-4" />
            </div>
            <div className="win98-home-card-title">Daily Tracking</div>
          </div>
          <div className="win98-home-card-content">
            Record daily nutrition and body metrics with historical tracking
          </div>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Activity className="w-3 h-3 mr-1" />
          Quick Overview
        </div>
        <div className="win98-stats-grid">
          <div className="win98-stat-item">
            <div className="win98-stat-value">0</div>
            <div className="win98-stat-label">Ingredients</div>
          </div>
          <div className="win98-stat-item">
            <div className="win98-stat-value">0</div>
            <div className="win98-stat-label">Recipes</div>
          </div>
          <div className="win98-stat-item">
            <div className="win98-stat-value">0</div>
            <div className="win98-stat-label">Exercises</div>
          </div>
          <div className="win98-stat-item">
            <div className="win98-stat-value">0</div>
            <div className="win98-stat-label">Habits</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <Target className="w-3 h-3 mr-1" />
          Getting Started
        </div>
        <div className="win98-getting-started">
          <div className="win98-getting-started-text">
            Start by adding some ingredients to build your database, then create recipes and plan your workouts.
          </div>
          <div className="win98-getting-started-actions">
            <Link href="/ingredients">
              <button className="win98-button">
                <Carrot className="w-3 h-3 mr-1" />
                Add Your First Ingredient
              </button>
            </Link>
            <Link href="/recipes">
              <button className="win98-button">
                <BookOpenText className="w-3 h-3 mr-1" />
                Create Your First Recipe
              </button>
            </Link>
            <Link href="/exercises">
              <button className="win98-button">
                <Dumbbell className="w-3 h-3 mr-1" />
                Build Exercise Library
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
