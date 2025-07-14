
'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Save, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { DailyNutrition, DailyBodyMetrics } from '@/lib/types/database'
import { DailyNutritionForm } from './daily-nutrition-form'
import { DailyBodyMetricsForm } from './daily-body-metrics-form'
import { DailyTrackingHistory } from './daily-tracking-history'

export function DailyTrackingPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null)
  const [dailyMetrics, setDailyMetrics] = useState<DailyBodyMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDailyData()
  }, [selectedDate])

  const fetchDailyData = async () => {
    try {
      setLoading(true)
      
      // Fetch nutrition data
      const nutritionResponse = await fetch(`/api/daily-nutrition?date=${selectedDate}`)
      if (nutritionResponse.ok) {
        const nutritionData = await nutritionResponse.json()
        setDailyNutrition(Array.isArray(nutritionData) ? nutritionData[0] || null : nutritionData)
      } else {
        setDailyNutrition(null)
      }

      // Fetch body metrics data
      const metricsResponse = await fetch(`/api/daily-body-metrics?date=${selectedDate}`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setDailyMetrics(Array.isArray(metricsData) ? metricsData[0] || null : metricsData)
      } else {
        setDailyMetrics(null)
      }
    } catch (error) {
      console.error('Error fetching daily data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load daily data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNutritionSave = async (data: Partial<DailyNutrition>) => {
    try {
      const response = await fetch('/api/daily-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: selectedDate,
        }),
      })

      if (!response.ok) throw new Error('Failed to save nutrition data')

      await fetchDailyData()
      toast({
        title: 'Success',
        description: 'Nutrition data saved successfully',
      })
    } catch (error) {
      console.error('Error saving nutrition data:', error)
      toast({
        title: 'Error',
        description: 'Failed to save nutrition data',
        variant: 'destructive',
      })
    }
  }

  const handleMetricsSave = async (data: Partial<DailyBodyMetrics>) => {
    try {
      const response = await fetch('/api/daily-body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: selectedDate,
        }),
      })

      if (!response.ok) throw new Error('Failed to save body metrics')

      await fetchDailyData()
      toast({
        title: 'Success',
        description: 'Body metrics saved successfully',
      })
    } catch (error) {
      console.error('Error saving body metrics:', error)
      toast({
        title: 'Error',
        description: 'Failed to save body metrics',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="win98-container">
        <div className="win98-panel">
          <div className="win98-text-sm">Loading daily data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="win98-container">
      {/* Header */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          <TrendingUp className="w-3 h-3 mr-1" />
          Daily Tracking
        </div>
        
        <div className="win98-tabs">
          <button
            onClick={() => setActiveTab('today')}
            className={`win98-tab ${activeTab === 'today' ? 'active' : ''}`}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Today's Data
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`win98-tab ${activeTab === 'history' ? 'active' : ''}`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="win98-tab-content">
        {activeTab === 'today' && (
          <div className="win98-container">
            {/* Date Selection */}
            <div className="win98-panel">
              <div className="win98-form-row-inline">
                <label className="win98-label">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="win98-date-input"
                />
              </div>
            </div>

            {/* Nutrition Form */}
            <div className="win98-panel">
              <div className="win98-title-bar">
                Nutrition Tracking
              </div>
              <DailyNutritionForm
                data={dailyNutrition}
                onSave={handleNutritionSave}
              />
            </div>

            {/* Body Metrics Form */}
            <div className="win98-panel">
              <div className="win98-title-bar">
                Body Metrics Tracking
              </div>
              <DailyBodyMetricsForm
                data={dailyMetrics}
                onSave={handleMetricsSave}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <DailyTrackingHistory />
        )}
      </div>
    </div>
  )
}
