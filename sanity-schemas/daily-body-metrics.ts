
// Sanity schema for DailyBodyMetrics model
export const dailyBodyMetrics = {
  name: 'dailyBodyMetrics',
  title: 'Daily Body Metrics',
  type: 'document',
  fields: [
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'weight',
      title: 'Weight (kg)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'bodyFat',
      title: 'Body Fat (%)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'muscleMass',
      title: 'Muscle Mass (kg)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'visceralFat',
      title: 'Visceral Fat (%)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'bmi',
      title: 'BMI',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'bodyWater',
      title: 'Body Water (%)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'boneMass',
      title: 'Bone Mass (kg)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'basalMetabolism',
      title: 'Basal Metabolism (kcal)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
    },
  ],
  preview: {
    select: {
      date: 'date',
      weight: 'weight',
      bodyFat: 'bodyFat',
    },
    prepare(selection: any) {
      const { date, weight, bodyFat } = selection
      return {
        title: date ? new Date(date).toLocaleDateString() : 'No date',
        subtitle: `${weight || 0}kg, ${bodyFat || 0}% body fat`,
      }
    },
  },
}
