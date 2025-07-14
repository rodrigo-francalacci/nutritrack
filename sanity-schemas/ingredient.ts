
// Sanity schema for Ingredient model - for future migration to Vercel/Sanity
export const ingredient = {
  name: 'ingredient',
  title: 'Ingredient',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'protein',
      title: 'Protein (per gram)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
      initialValue: 0,
    },
    {
      name: 'carbs',
      title: 'Carbohydrates (per gram)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
      initialValue: 0,
    },
    {
      name: 'fats',
      title: 'Fats (per gram)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
      initialValue: 0,
    },
    {
      name: 'calories',
      title: 'Calories (per gram)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
      initialValue: 0,
    },
    {
      name: 'fiber',
      title: 'Fiber (per gram)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
      initialValue: 0,
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
    },
    {
      name: 'image1',
      title: 'Primary Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'image2',
      title: 'Secondary Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'customUnits',
      title: 'Custom Units',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'customUnit' }] }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image1',
      subtitle: 'calories',
    },
    prepare(selection: any) {
      const { title, media, subtitle } = selection
      return {
        title,
        subtitle: subtitle ? `${subtitle} cal/g` : 'No calories info',
        media,
      }
    },
  },
}
