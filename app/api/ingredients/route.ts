
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId, getImageUrl } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const query = `*[_type == "ingredient"] | order(_createdAt desc) {
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
        unitName,
        gramsEquivalent,
        ingredientId
      }
    }`

    const ingredients = await sanityClient.fetch(query)
    
    // Transform to match expected format with image URL resolution
    const transformedIngredients = ingredients.map((ingredient: any) => ({
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
    }))

    return NextResponse.json(transformedIngredients)
  } catch (error) {
    console.error('Failed to fetch ingredients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const ingredientId = generateSanityId()
    const now = new Date().toISOString()

    // Prepare the document with image assets
    const documentData: any = {
      _type: 'ingredient',
      _id: ingredientId,
      _createdAt: now,
      _updatedAt: now,
      name: name.trim(),
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fats: parseFloat(fats) || 0,
      calories: parseFloat(calories) || 0,
      fiber: parseFloat(fiber) || 0,
      notes: notes?.trim() || null,
    }

    // Add image assets if provided
    if (image1) {
      documentData.image1 = image1
    }
    if (image2) {
      documentData.image2 = image2
    }

    const ingredient = await sanityClient.create(documentData)

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
      customUnits: [],
    }

    return NextResponse.json(transformedIngredient)
  } catch (error) {
    console.error('Failed to create ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}
