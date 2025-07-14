
// Sanity schema for RecipeIngredient model - for future migration to Vercel/Sanity
export const recipeIngredient = {
  name: 'recipeIngredient',
  title: 'Recipe Ingredient',
  type: 'document',
  fields: [
    {
      name: 'ingredient',
      title: 'Ingredient',
      type: 'reference',
      to: [{ type: 'ingredient' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'unit',
      title: 'Unit',
      type: 'reference',
      to: [{ type: 'customUnit' }],
      description: 'Leave empty for grams',
    },
    {
      name: 'recipe',
      title: 'Recipe',
      type: 'reference',
      to: [{ type: 'recipe' }],
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      ingredientName: 'ingredient.name',
      quantity: 'quantity',
      unitName: 'unit.unitName',
      recipeName: 'recipe.name',
    },
    prepare(selection: any) {
      const { ingredientName, quantity, unitName, recipeName } = selection
      const unit = unitName || 'g'
      return {
        title: `${quantity} ${unit} ${ingredientName || 'Unknown ingredient'}`,
        subtitle: recipeName || 'No recipe',
      }
    },
  },
}
