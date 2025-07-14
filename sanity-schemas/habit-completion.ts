
// Sanity schema for HabitCompletion model - for future migration to Vercel/Sanity
export const habitCompletion = {
  name: 'habitCompletion',
  title: 'Habit Completion',
  type: 'document',
  fields: [
    {
      name: 'habit',
      title: 'Habit',
      type: 'reference',
      to: [{ type: 'habit' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'completed',
      title: 'Completed',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      habitName: 'habit.name',
      date: 'date',
      completed: 'completed',
    },
    prepare(selection: any) {
      const { habitName, date, completed } = selection
      return {
        title: `${habitName || 'Unknown habit'} - ${new Date(date).toLocaleDateString()}`,
        subtitle: completed ? 'Completed ✅' : 'Not completed ❌',
      }
    },
  },
}
