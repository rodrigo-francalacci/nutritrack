
// Sanity schema for DailyNutrition model
export const dailyNutrition = {
  name: 'dailyNutrition',
  title: 'Daily Nutrition',
  type: 'document',
  fields: [
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'calories',
      title: 'Calories',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'protein',
      title: 'Protein (g)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'carbs',
      title: 'Carbohydrates (g)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'fats',
      title: 'Fats (g)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'fiber',
      title: 'Fiber (g)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'water',
      title: 'Water (liters)',
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
      calories: 'calories',
      protein: 'protein',
    },
    prepare(selection: any) {
      const { date, calories, protein } = selection
      return {
        title: date ? new Date(date).toLocaleDateString() : 'No date',
        subtitle: `${calories || 0} cal, ${protein || 0}g protein`,
      }
    },
  },
}
