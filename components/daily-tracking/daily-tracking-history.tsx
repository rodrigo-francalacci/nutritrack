
'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { DailyNutrition, DailyBodyMetrics } from '@/lib/types/database'

interface HistoryData {
  date: string
  nutrition: DailyNutrition | null
  metrics: DailyBodyMetrics | null
}

export function DailyTrackingHistory() {
  const [historyData, setHistoryData] = useState<HistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const { toast } = useToast()

  useEffect(() => {
    fetchHistoryData()
  }, [selectedMonth])

  const fetchHistoryData = async () => {
    try {
      setLoading(true)
      
      const [nutritionResponse, metricsResponse] = await Promise.all([
        fetch(`/api/daily-nutrition?month=${selectedMonth}`),
        fetch(`/api/daily-body-metrics?month=${selectedMonth}`)
      ])

      const nutritionData = nutritionResponse.ok ? await nutritionResponse.json() : []
      const metricsData = metricsResponse.ok ? await metricsResponse.json() : []

      // Combine data by date
      const dateMap = new Map<string, HistoryData>()
      
      nutritionData.forEach((item: DailyNutrition) => {
        const date = item.date.toString().split('T')[0]
        dateMap.set(date, {
          date,
          nutrition: item,
          metrics: null,
        })
      })

      metricsData.forEach((item: DailyBodyMetrics) => {
        const date = item.date.toString().split('T')[0]
        const existing = dateMap.get(date)
        if (existing) {
          existing.metrics = item
        } else {
          dateMap.set(date, {
            date,
            nutrition: null,
            metrics: item,
          })
        }
      })

      const sortedData = Array.from(dateMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setHistoryData(sortedData)
    } catch (error) {
      console.error('Error fetching history data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load history data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="win98-container">
        <div className="win98-panel">
          <div className="win98-text-sm">Loading history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="win98-container">
      {/* Month Selection */}
      <div className="win98-panel">
        <div className="win98-form-row-inline">
          <label className="win98-label">Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="win98-date-input"
          />
        </div>
      </div>

      {/* History List */}
      <div className="win98-panel">
        <div className="win98-title-bar">
          History for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        
        <div className="win98-history-list">
          {historyData.map((item) => (
            <div key={item.date} className="win98-history-item">
              <div className="win98-history-header">
                <div className="win98-history-date">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
              
              <div className="win98-history-content">
                {item.nutrition && (
                  <div className="win98-history-section">
                    <div className="win98-history-section-title">Nutrition</div>
                    <div className="win98-history-metrics">
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Calories:</span>
                        <span className="win98-history-metric-value">{item.nutrition.calories || 0}</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Protein:</span>
                        <span className="win98-history-metric-value">{item.nutrition.protein || 0}g</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Carbs:</span>
                        <span className="win98-history-metric-value">{item.nutrition.carbs || 0}g</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Fats:</span>
                        <span className="win98-history-metric-value">{item.nutrition.fats || 0}g</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Water:</span>
                        <span className="win98-history-metric-value">{item.nutrition.water || 0}L</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {item.metrics && (
                  <div className="win98-history-section">
                    <div className="win98-history-section-title">Body Metrics</div>
                    <div className="win98-history-metrics">
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Weight:</span>
                        <span className="win98-history-metric-value">{item.metrics.weight || 0}kg</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Body Fat:</span>
                        <span className="win98-history-metric-value">{item.metrics.bodyFat || 0}%</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">Muscle Mass:</span>
                        <span className="win98-history-metric-value">{item.metrics.muscleMass || 0}kg</span>
                      </div>
                      <div className="win98-history-metric">
                        <span className="win98-history-metric-label">BMI:</span>
                        <span className="win98-history-metric-value">{item.metrics.bmi || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {!item.nutrition && !item.metrics && (
                  <div className="win98-empty-state">
                    No data recorded for this date.
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {historyData.length === 0 && (
            <div className="win98-empty-state">
              No data recorded for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
