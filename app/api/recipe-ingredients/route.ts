
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipeId, ingredientId, quantity, unitId } = body

    if (!recipeId || !ingredientId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the highest order value for this recipe to add the new ingredient at the end
    const maxOrderQuery = `*[_type == "recipeIngredient" && recipeId == $recipeId] | order(order desc)[0].order`
    const maxOrder = await sanityClient.fetch(maxOrderQuery, { recipeId })

    const nextOrder = (maxOrder ?? -1) + 1

    const recipeIngredientId = generateSanityId()
    const now = new Date().toISOString()

    const recipeIngredient = await sanityClient.create({
      _type: 'recipeIngredient',
      _id: recipeIngredientId,
      _createdAt: now,
      _updatedAt: now,
      recipeId,
      ingredientId,
      quantity: parseFloat(quantity),
      unitId: unitId || null,
      order: nextOrder,
    })

    // Fetch the ingredient details to include in the response
    const ingredientQuery = `*[_type == "ingredient" && _id == $ingredientId][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      protein,
      carbs,
      fats,
      calories,
      fiber,
      notes,
      image1,
      image2,
      "customUnits": *[_type == "customUnit" && ingredientId == ^._id] {
        _id,
        _createdAt,
        _updatedAt,
        ingredientId,
        unitName,
        gramsEquivalent
      }
    }`

    const ingredient = await sanityClient.fetch(ingredientQuery, { ingredientId })

    // Fetch the unit details if unitId is provided
    let unit = null
    if (unitId) {
      const unitQuery = `*[_type == "customUnit" && _id == $unitId][0] {
        _id,
        _createdAt,
        _updatedAt,
        ingredientId,
        unitName,
        gramsEquivalent
      }`

      unit = await sanityClient.fetch(unitQuery, { unitId })
    }

    // Transform to match expected format
    const transformedRecipeIngredient = {
      id: recipeIngredient._id,
      createdAt: new Date(recipeIngredient._createdAt),
      updatedAt: new Date(recipeIngredient._updatedAt),
      recipeId: recipeIngredient.recipeId,
      ingredientId: recipeIngredient.ingredientId,
      quantity: recipeIngredient.quantity,
      unitId: recipeIngredient.unitId || null,
      order: recipeIngredient.order,
      ingredient: ingredient ? {
        id: ingredient._id,
        createdAt: new Date(ingredient._createdAt),
        updatedAt: new Date(ingredient._updatedAt),
        name: ingredient.name,
        protein: ingredient.protein || 0,
        carbs: ingredient.carbs || 0,
        fats: ingredient.fats || 0,
        calories: ingredient.calories || 0,
        fiber: ingredient.fiber || 0,
        notes: ingredient.notes || null,
        image1: ingredient.image1 || null,
        image2: ingredient.image2 || null,
        customUnits: ingredient.customUnits?.map((unit: any) => ({
          id: unit._id,
          createdAt: new Date(unit._createdAt),
          updatedAt: new Date(unit._updatedAt),
          ingredientId: unit.ingredientId,
          unitName: unit.unitName,
          gramsEquivalent: unit.gramsEquivalent,
        })) || [],
      } : null,
      unit: unit ? {
        id: unit._id,
        createdAt: new Date(unit._createdAt),
        updatedAt: new Date(unit._updatedAt),
        ingredientId: unit.ingredientId,
        unitName: unit.unitName,
        gramsEquivalent: unit.gramsEquivalent,
      } : null,
    }

    return NextResponse.json(transformedRecipeIngredient)
  } catch (error) {
    console.error('Failed to add recipe ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to add recipe ingredient' },
      { status: 500 }
    )
  }
}
