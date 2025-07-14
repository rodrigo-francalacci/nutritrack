
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const query = `*[_type == "recipe"] | order(_createdAt desc) {
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
          image2
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

    const recipes = await sanityClient.fetch(query)

    // Calculate nutritional totals for each recipe
    const recipesWithNutrition = recipes.map((recipe: any) => {
      let totalCalories = 0
      let totalProtein = 0
      let totalCarbs = 0
      let totalFats = 0
      let totalFiber = 0

      recipe.ingredients?.forEach((recipeIngredient: any) => {
        const ingredient = recipeIngredient.ingredient
        if (!ingredient) return

        let quantityInGrams = recipeIngredient.quantity

        // Convert to grams if using custom unit
        if (recipeIngredient.unit) {
          quantityInGrams = recipeIngredient.quantity * recipeIngredient.unit.gramsEquivalent
        }

        // Apply scaling factor
        quantityInGrams *= recipe.scalingFactor || 1

        // Calculate nutritional values
        totalCalories += (ingredient.calories || 0) * quantityInGrams
        totalProtein += (ingredient.protein || 0) * quantityInGrams
        totalCarbs += (ingredient.carbs || 0) * quantityInGrams
        totalFats += (ingredient.fats || 0) * quantityInGrams
        totalFiber += (ingredient.fiber || 0) * quantityInGrams
      })

      // Transform to match expected format
      return {
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
            image1: recipeIngredient.ingredient.image1 || null,
            image2: recipeIngredient.ingredient.image2 || null,
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
        nutrition: {
          calories: Math.round(totalCalories * 100) / 100,
          protein: Math.round(totalProtein * 100) / 100,
          carbs: Math.round(totalCarbs * 100) / 100,
          fats: Math.round(totalFats * 100) / 100,
          fiber: Math.round(totalFiber * 100) / 100,
        },
      }
    })

    return NextResponse.json(recipesWithNutrition)
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, instructions, photos, scalingFactor = 1 } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const recipeId = generateSanityId()
    const now = new Date().toISOString()

    const recipe = await sanityClient.create({
      _type: 'recipe',
      _id: recipeId,
      _createdAt: now,
      _updatedAt: now,
      name: name.trim(),
      instructions: instructions?.trim() || null,
      photos: photos || null,
      scalingFactor: parseFloat(scalingFactor) || 1,
    })

    // Transform to match expected format
    const transformedRecipe = {
      id: recipe._id,
      createdAt: new Date(recipe._createdAt),
      updatedAt: new Date(recipe._updatedAt),
      name: recipe.name,
      instructions: recipe.instructions || null,
      photos: recipe.photos || null,
      scalingFactor: recipe.scalingFactor || 1,
      ingredients: [],
    }

    return NextResponse.json(transformedRecipe)
  } catch (error) {
    console.error('Failed to create recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
