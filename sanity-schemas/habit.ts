
// Sanity schema for Habit model - for future migration to Vercel/Sanity
export const habit = {
  name: 'habit',
  title: 'Habit',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Habit Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    },
    {
      name: 'completions',
      title: 'Completions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'habitCompletion' }] }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      description: 'description',
      completions: 'completions',
    },
    prepare(selection: any) {
      const { title, description, completions } = selection
      const completionCount = completions ? completions.length : 0
      return {
        title,
        subtitle: description || `${completionCount} completions`,
      }
    },
  },
}
