
// Sanity schema for WorkoutExercise model - for future migration to Vercel/Sanity
export const workoutExercise = {
  name: 'workoutExercise',
  title: 'Workout Exercise',
  type: 'document',
  fields: [
    {
      name: 'exercise',
      title: 'Exercise',
      type: 'reference',
      to: [{ type: 'exercise' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'reps',
      title: 'Repetitions',
      type: 'number',
      validation: (Rule: any) => Rule.min(1),
    },
    {
      name: 'series',
      title: 'Sets',
      type: 'number',
      validation: (Rule: any) => Rule.min(1),
    },
    {
      name: 'weight',
      title: 'Weight (kg)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'workoutPlan',
      title: 'Workout Plan',
      type: 'reference',
      to: [{ type: 'workoutPlan' }],
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      exerciseName: 'exercise.name',
      reps: 'reps',
      series: 'series',
      weight: 'weight',
    },
    prepare(selection: any) {
      const { exerciseName, reps, series, weight } = selection
      const details = []
      if (series) details.push(`${series} sets`)
      if (reps) details.push(`${reps} reps`)
      if (weight) details.push(`${weight}kg`)
      
      return {
        title: exerciseName || 'Unknown exercise',
        subtitle: details.join(' • ') || 'No details',
      }
    },
  },
}
