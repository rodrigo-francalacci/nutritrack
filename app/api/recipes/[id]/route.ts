
import { NextResponse } from 'next/server'
import { sanityClient, getImageUrl } from '@/lib/sanity'; // <-- ADD getImageUrl HERE

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = `*[_type == "recipe" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      instructions,
      photos,
      scalingFactor,
      "ingredients": *[_type == "recipeIngredient" && recipeId == ^._id] | order(order asc) {
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
      }
    }`

    const recipe = await sanityClient.fetch(query, { id: params.id })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedRecipe = {
      id: recipe._id,
      createdAt: new Date(recipe._createdAt),
      updatedAt: new Date(recipe._updatedAt),
      name: recipe.name,
      instructions: recipe.instructions || null,
      photos: recipe.photos || null,
      scalingFactor: recipe.scalingFactor || 1,
      ingredients: recipe.ingredients?.map((recipeIngredient: any) => ({
        id: recipeIngredient._id,
        createdAt: new Date(recipeIngredient._createdAt),
        updatedAt: new Date(recipeIngredient._updatedAt),
        recipeId: recipeIngredient.recipeId,
        ingredientId: recipeIngredient.ingredientId,
        quantity: recipeIngredient.quantity,
        unitId: recipeIngredient.unitId || null,
        order: recipeIngredient.order || 0,
        ingredient: recipeIngredient.ingredient ? {
          id: recipeIngredient.ingredient._id,
          createdAt: new Date(recipeIngredient.ingredient._createdAt),
          updatedAt: new Date(recipeIngredient.ingredient._updatedAt),
          name: recipeIngredient.ingredient.name,
          protein: recipeIngredient.ingredient.protein || 0,
          carbs: recipeIngredient.ingredient.carbs || 0,
          fats: recipeIngredient.ingredient.fats || 0,
          calories: recipeIngredient.ingredient.calories || 0,
          fiber: recipeIngredient.ingredient.fiber || 0,
          notes: recipeIngredient.ingredient.notes || null,
          image1: recipeIngredient.ingredient.image1
            ? getImageUrl(recipeIngredient.ingredient.image1)
            : null,
          image2: recipeIngredient.ingredient.image2
            ? getImageUrl(recipeIngredient.ingredient.image2)
            : null,
          customUnits: recipeIngredient.ingredient.customUnits?.map((unit: any) => ({
            id: unit._id,
            createdAt: new Date(unit._createdAt),
            updatedAt: new Date(unit._updatedAt),
            ingredientId: unit.ingredientId,
            unitName: unit.unitName,
            gramsEquivalent: unit.gramsEquivalent,
          })) || [],
        } : null,
        unit: recipeIngredient.unit ? {
          id: recipeIngredient.unit._id,
          createdAt: new Date(recipeIngredient.unit._createdAt),
          updatedAt: new Date(recipeIngredient.unit._updatedAt),
          ingredientId: recipeIngredient.unit.ingredientId,
          unitName: recipeIngredient.unit.unitName,
          gramsEquivalent: recipeIngredient.unit.gramsEquivalent,
        } : null,
      })) || [],
    }

    return NextResponse.json(transformedRecipe)
  } catch (error) {
    console.error('Failed to fetch recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, instructions, scalingFactor, ingredients } = body

    // Use a transaction to update the main recipe and all ingredients
    let transaction = sanityClient.transaction()

    // CORRECTED: Added the ': any' type to allow dynamic properties
    const recipeUpdateData: any = { _updatedAt: new Date().toISOString() }
    if (name !== undefined) recipeUpdateData.name = name.trim()
    if (instructions !== undefined)
      recipeUpdateData.instructions = instructions?.trim() || null
    if (scalingFactor !== undefined)
      recipeUpdateData.scalingFactor = parseFloat(scalingFactor) || 1

    transaction = transaction.patch(params.id, p => p.set(recipeUpdateData))

    if (ingredients && Array.isArray(ingredients)) {
      ingredients.forEach(ing => {
        if (ing.id) {
          transaction = transaction.patch(ing.id, p =>
            p.set({
              quantity: ing.quantity,
              unitId: ing.unitId,
            })
          )
        }
      })
    }

    await transaction.commit()

    // Fetch the fully updated recipe data from Sanity
    const query = `*[_type == "recipe" && _id == $id][0] {
      _id, _createdAt, _updatedAt, name, instructions, photos, scalingFactor,
      "ingredients": *[_type == "recipeIngredient" && recipeId == ^._id] | order(order asc) {
        _id, _createdAt, _updatedAt, recipeId, ingredientId, quantity, unitId, order,
        "ingredient": *[_type == "ingredient" && _id == ^.ingredientId][0] {
          ...,
          "customUnits": *[_type == "customUnit" && ingredientId == ^._id]
        },
        "unit": *[_type == "customUnit" && _id == ^.unitId][0]
      }
    }`
    const updatedRecipe = await sanityClient.fetch(query, { id: params.id })

    if (!updatedRecipe) {
        return NextResponse.json({ error: 'Recipe not found after update' }, { status: 404 });
    }

    // Transformation block to clean the data for the frontend
    const transformedRecipe = {
      id: updatedRecipe._id,
      createdAt: new Date(updatedRecipe._createdAt),
      updatedAt: new Date(updatedRecipe._updatedAt),
      name: updatedRecipe.name,
      instructions: updatedRecipe.instructions || null,
      photos: updatedRecipe.photos || null,
      scalingFactor: updatedRecipe.scalingFactor || 1,
      ingredients: updatedRecipe.ingredients?.map((recipeIngredient: any) => ({
        id: recipeIngredient._id,
        createdAt: new Date(recipeIngredient._createdAt),
        updatedAt: new Date(recipeIngredient._updatedAt),
        recipeId: recipeIngredient.recipeId,
        ingredientId: recipeIngredient.ingredientId,
        quantity: recipeIngredient.quantity,
        unitId: recipeIngredient.unitId || null,
        order: recipeIngredient.order || 0,
        ingredient: recipeIngredient.ingredient ? {
          id: recipeIngredient.ingredient._id,
          createdAt: new Date(recipeIngredient.ingredient._createdAt),
          updatedAt: new Date(recipeIngredient.ingredient._updatedAt),
          name: recipeIngredient.ingredient.name,
          protein: recipeIngredient.ingredient.protein || 0,
          carbs: recipeIngredient.ingredient.carbs || 0,
          fats: recipeIngredient.ingredient.fats || 0,
          calories: recipeIngredient.ingredient.calories || 0,
          fiber: recipeIngredient.ingredient.fiber || 0,
          notes: recipeIngredient.ingredient.notes || null,
          image1: recipeIngredient.ingredient.image1 ? getImageUrl(recipeIngredient.ingredient.image1) : null,
          image2: recipeIngredient.ingredient.image2 ? getImageUrl(recipeIngredient.ingredient.image2) : null,
          customUnits: recipeIngredient.ingredient.customUnits?.map((unit: any) => ({
            id: unit._id,
            createdAt: new Date(unit._createdAt),
            updatedAt: new Date(unit._updatedAt),
            ingredientId: unit.ingredientId,
            unitName: unit.unitName,
            gramsEquivalent: unit.gramsEquivalent,
          })) || [],
        } : null,
        unit: recipeIngredient.unit ? {
          id: recipeIngredient.unit._id,
          createdAt: new Date(recipeIngredient.unit._createdAt),
          updatedAt: new Date(recipeIngredient.unit._updatedAt),
          ingredientId: recipeIngredient.unit.ingredientId,
          unitName: recipeIngredient.unit.unitName,
          gramsEquivalent: recipeIngredient.unit.gramsEquivalent,
        } : null,
      })) || [],
    }

    return NextResponse.json(transformedRecipe)

  } catch (error) {
    console.error('Failed to update recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all associated recipe ingredients
    const recipeIngredientsQuery = `*[_type == "recipeIngredient" && recipeId == $id]._id`
    const recipeIngredientIds = await sanityClient.fetch(recipeIngredientsQuery, { id: params.id })
    
    // Delete all associated recipe ingredients
    if (recipeIngredientIds.length > 0) {
      await Promise.all(recipeIngredientIds.map((ingredientId: string) => sanityClient.delete(ingredientId)))
    }

    // Then delete the recipe itself
    await sanityClient.delete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
