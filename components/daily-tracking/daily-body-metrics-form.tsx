
'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { DailyBodyMetrics } from '@/lib/types/database'

interface DailyBodyMetricsFormProps {
  data: DailyBodyMetrics | null
  onSave: (data: Partial<DailyBodyMetrics>) => void
}

export function DailyBodyMetricsForm({ data, onSave }: DailyBodyMetricsFormProps) {
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    visceralFat: '',
    bmi: '',
    bodyWater: '',
    boneMass: '',
    basalMetabolism: '',
    notes: '',
  })

  useEffect(() => {
    if (data) {
      setFormData({
        weight: data.weight?.toString() || '',
        bodyFat: data.bodyFat?.toString() || '',
        muscleMass: data.muscleMass?.toString() || '',
        visceralFat: data.visceralFat?.toString() || '',
        bmi: data.bmi?.toString() || '',
        bodyWater: data.bodyWater?.toString() || '',
        boneMass: data.boneMass?.toString() || '',
        basalMetabolism: data.basalMetabolism?.toString() || '',
        notes: data.notes || '',
      })
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const metricsData = {
      weight: formData.weight ? parseFloat(formData.weight) : null,
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
      muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : null,
      visceralFat: formData.visceralFat ? parseFloat(formData.visceralFat) : null,
      bmi: formData.bmi ? parseFloat(formData.bmi) : null,
      bodyWater: formData.bodyWater ? parseFloat(formData.bodyWater) : null,
      boneMass: formData.boneMass ? parseFloat(formData.boneMass) : null,
      basalMetabolism: formData.basalMetabolism ? parseFloat(formData.basalMetabolism) : null,
      notes: formData.notes || null,
    }

    onSave(metricsData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="win98-form-container">
      <div className="win98-metrics-grid">
        <div className="win98-metric-item">
          <label className="win98-label">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">Body Fat (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) => handleChange('bodyFat', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">Muscle Mass (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.muscleMass}
            onChange={(e) => handleChange('muscleMass', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">Visceral Fat (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.visceralFat}
            onChange={(e) => handleChange('visceralFat', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">BMI</label>
          <input
            type="number"
            step="0.1"
            value={formData.bmi}
            onChange={(e) => handleChange('bmi', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">Body Water (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyWater}
            onChange={(e) => handleChange('bodyWater', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">Bone Mass (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.boneMass}
            onChange={(e) => handleChange('boneMass', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
        
        <div className="win98-metric-item">
          <label className="win98-label">Basal Metabolism (kcal)</label>
          <input
            type="number"
            step="1"
            value={formData.basalMetabolism}
            onChange={(e) => handleChange('basalMetabolism', e.target.value)}
            placeholder="0"
            className="win98-input"
          />
        </div>
      </div>
      
      <div className="win98-form-row">
        <label className="win98-label">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any notes about your body metrics..."
          className="win98-input win98-textarea"
          rows={3}
        />
      </div>
      
      <div className="win98-form-row">
        <button type="submit" className="win98-button">
          <Save className="w-3 h-3 mr-1" />
          Save Body Metrics
        </button>
      </div>
    </form>
  )
}
