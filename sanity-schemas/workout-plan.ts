
// Sanity schema for WorkoutPlan model - for future migration to Vercel/Sanity
export const workoutPlan = {
  name: 'workoutPlan',
  title: 'Workout Plan',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Workout Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'exercises',
      title: 'Exercises',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'workoutExercise' }] }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      date: 'date',
      exercises: 'exercises',
    },
    prepare(selection: any) {
      const { title, date, exercises } = selection
      const exerciseCount = exercises ? exercises.length : 0
      return {
        title,
        subtitle: `${new Date(date).toLocaleDateString()} - ${exerciseCount} exercises`,
      }
    },
  },
}
