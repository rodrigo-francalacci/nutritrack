
// Sanity schema for Exercise model - for future migration to Vercel/Sanity
export const exercise = {
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Exercise Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'video',
      title: 'Video',
      type: 'url',
      description: 'Video URL or upload',
    },
    {
      name: 'musclesInvolved',
      title: 'Muscles Involved',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Chest', value: 'chest' },
          { title: 'Back', value: 'back' },
          { title: 'Shoulders', value: 'shoulders' },
          { title: 'Arms', value: 'arms' },
          { title: 'Biceps', value: 'biceps' },
          { title: 'Triceps', value: 'triceps' },
          { title: 'Legs', value: 'legs' },
          { title: 'Quads', value: 'quads' },
          { title: 'Hamstrings', value: 'hamstrings' },
          { title: 'Glutes', value: 'glutes' },
          { title: 'Calves', value: 'calves' },
          { title: 'Core', value: 'core' },
          { title: 'Abs', value: 'abs' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'photo',
      muscles: 'musclesInvolved',
    },
    prepare(selection: any) {
      const { title, media, muscles } = selection
      return {
        title,
        subtitle: muscles ? muscles.join(', ') : 'No muscles specified',
        media,
      }
    },
  },
}
