
import { NextRequest, NextResponse } from 'next/server'
import { sanityClient, getImageUrl } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      protein = 0,
      carbs = 0,
      fats = 0,
      calories = 0,
      fiber = 0,
      notes,
      image1,
      image2,
    } = body

    const { id } = params

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Prepare the update data
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
      name: name.trim(),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fats: parseFloat(fats) || 0,
      calories: parseFloat(calories) || 0,
      fiber: parseFloat(fiber) || 0,
      notes: notes?.trim() || null,
    }

    // Handle image updates
    if (image1 !== undefined) {
      updateData.image1 = image1
    }
    if (image2 !== undefined) {
      updateData.image2 = image2
    }

    const updatedIngredient = await sanityClient
      .patch(id)
      .set(updateData)
      .commit()

    // Fetch the updated ingredient to get complete data
    const query = `*[_type == "ingredient" && _id == $id][0] {
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
      "customUnits": *[_type == "customUnit" && references(^._id)] {
        _id,
        _createdAt,
        _updatedAt,
        unitName,
        gramsEquivalent,
        ingredientId
      }
    }`

    const ingredient = await sanityClient.fetch(query, { id })

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format with image URL resolution
    const transformedIngredient = {
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
      image1: ingredient.image1 ? getImageUrl(ingredient.image1) : null,
      image2: ingredient.image2 ? getImageUrl(ingredient.image2) : null,
      customUnits: ingredient.customUnits?.map((unit: any) => ({
        id: unit._id,
        createdAt: new Date(unit._createdAt),
        updatedAt: new Date(unit._updatedAt),
        unitName: unit.unitName,
        gramsEquivalent: unit.gramsEquivalent,
        ingredientId: unit.ingredientId,
      })) || [],
    }

    return NextResponse.json(transformedIngredient)
  } catch (error) {
    console.error('Failed to update ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Delete the ingredient
    await sanityClient.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    )
  }
}
