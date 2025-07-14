
// Sanity schema for Recipe model - for future migration to Vercel/Sanity
export const recipe = {
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Recipe Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'instructions',
      title: 'Instructions',
      type: 'text',
      rows: 5,
    },
    {
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'scalingFactor',
      title: 'Scaling Factor',
      type: 'number',
      validation: (Rule: any) => Rule.min(0.1),
      initialValue: 1,
    },
    {
      name: 'ingredients',
      title: 'Recipe Ingredients',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'recipeIngredient' }] }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'photos.0.image',
      ingredients: 'ingredients',
    },
    prepare(selection: any) {
      const { title, media, ingredients } = selection
      return {
        title,
        subtitle: ingredients ? `${ingredients.length} ingredients` : 'No ingredients',
        media,
      }
    },
  },
}
