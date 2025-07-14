
// Sanity schema for CustomUnit model - for future migration to Vercel/Sanity
export const customUnit = {
  name: 'customUnit',
  title: 'Custom Unit',
  type: 'document',
  fields: [
    {
      name: 'unitName',
      title: 'Unit Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
      description: 'e.g., tablespoon, cup, teaspoon',
    },
    {
      name: 'gramsEquivalent',
      title: 'Grams Equivalent',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0.001),
      description: 'How many grams this unit represents',
    },
    {
      name: 'ingredient',
      title: 'Ingredient',
      type: 'reference',
      to: [{ type: 'ingredient' }],
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      unitName: 'unitName',
      gramsEquivalent: 'gramsEquivalent',
      ingredientName: 'ingredient.name',
    },
    prepare(selection: any) {
      const { unitName, gramsEquivalent, ingredientName } = selection
      return {
        title: `1 ${unitName} = ${gramsEquivalent}g`,
        subtitle: ingredientName || 'No ingredient',
      }
    },
  },
}
