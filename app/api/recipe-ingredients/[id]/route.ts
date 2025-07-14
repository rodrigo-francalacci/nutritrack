
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { quantity, unitId } = body

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (quantity !== undefined) updateData.quantity = parseFloat(quantity)
    if (unitId !== undefined) updateData.unitId = unitId || null

    const recipeIngredient = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated recipe ingredient with all relationships
    const query = `*[_type == "recipeIngredient" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      recipeId,
      ingredientId,
      quantity,
      unitId,
      order,
      "ingredient": *[_type == "ingredient" && _id == ^.ingredientId][0] {
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
      },
      "unit": *[_type == "customUnit" && _id == ^.unitId][0] {
        _id,
        _createdAt,
        _updatedAt,
        ingredientId,
        unitName,
        gramsEquivalent
      }
    }`

    const updatedRecipeIngredient = await sanityClient.fetch(query, { id: params.id })

    if (!updatedRecipeIngredient) {
      return NextResponse.json(
        { error: 'Recipe ingredient not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedRecipeIngredient = {
      id: updatedRecipeIngredient._id,
      createdAt: new Date(updatedRecipeIngredient._createdAt),
      updatedAt: new Date(updatedRecipeIngredient._updatedAt),
      recipeId: updatedRecipeIngredient.recipeId,
      ingredientId: updatedRecipeIngredient.ingredientId,
      quantity: updatedRecipeIngredient.quantity,
      unitId: updatedRecipeIngredient.unitId || null,
      order: updatedRecipeIngredient.order,
      ingredient: updatedRecipeIngredient.ingredient ? {
        id: updatedRecipeIngredient.ingredient._id,
        createdAt: new Date(updatedRecipeIngredient.ingredient._createdAt),
        updatedAt: new Date(updatedRecipeIngredient.ingredient._updatedAt),
        name: updatedRecipeIngredient.ingredient.name,
        protein: updatedRecipeIngredient.ingredient.protein || 0,
        carbs: updatedRecipeIngredient.ingredient.carbs || 0,
        fats: updatedRecipeIngredient.ingredient.fats || 0,
        calories: updatedRecipeIngredient.ingredient.calories || 0,
        fiber: updatedRecipeIngredient.ingredient.fiber || 0,
        notes: updatedRecipeIngredient.ingredient.notes || null,
        image1: updatedRecipeIngredient.ingredient.image1 || null,
        image2: updatedRecipeIngredient.ingredient.image2 || null,
        customUnits: updatedRecipeIngredient.ingredient.customUnits?.map((unit: any) => ({
          id: unit._id,
          createdAt: new Date(unit._createdAt),
          updatedAt: new Date(unit._updatedAt),
          ingredientId: unit.ingredientId,
          unitName: unit.unitName,
          gramsEquivalent: unit.gramsEquivalent,
        })) || [],
      } : null,
      unit: updatedRecipeIngredient.unit ? {
        id: updatedRecipeIngredient.unit._id,
        createdAt: new Date(updatedRecipeIngredient.unit._createdAt),
        updatedAt: new Date(updatedRecipeIngredient.unit._updatedAt),
        ingredientId: updatedRecipeIngredient.unit.ingredientId,
        unitName: updatedRecipeIngredient.unit.unitName,
        gramsEquivalent: updatedRecipeIngredient.unit.gramsEquivalent,
      } : null,
    }

    return NextResponse.json(transformedRecipeIngredient)
  } catch (error) {
    console.error('Failed to update recipe ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe ingredient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sanityClient.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recipe ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe ingredient' },
      { status: 500 }
    )
  }
}
