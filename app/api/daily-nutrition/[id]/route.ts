
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = `*[_type == "dailyNutrition" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      date,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      water,
      notes
    }`

    const entry = await sanityClient.fetch(query, { id: params.id })

    if (!entry) {
      return NextResponse.json(
        { error: 'Daily nutrition entry not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedEntry = {
      id: entry._id,
      createdAt: new Date(entry._createdAt),
      updatedAt: new Date(entry._updatedAt),
      date: new Date(entry.date),
      calories: entry.calories || null,
      protein: entry.protein || null,
      carbs: entry.carbs || null,
      fats: entry.fats || null,
      fiber: entry.fiber || null,
      water: entry.water || null,
      notes: entry.notes || null,
    }

    return NextResponse.json(transformedEntry)
  } catch (error) {
    console.error('Failed to fetch daily nutrition entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily nutrition entry' },
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
    const {
      date,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      water,
      notes,
    } = body

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (date) updateData.date = new Date(date).toISOString().split('T')[0]
    if (calories !== undefined) updateData.calories = parseFloat(calories) || null
    if (protein !== undefined) updateData.protein = parseFloat(protein) || null
    if (carbs !== undefined) updateData.carbs = parseFloat(carbs) || null
    if (fats !== undefined) updateData.fats = parseFloat(fats) || null
    if (fiber !== undefined) updateData.fiber = parseFloat(fiber) || null
    if (water !== undefined) updateData.water = parseFloat(water) || null
    if (notes !== undefined) updateData.notes = notes?.trim() || null

    const entry = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated entry
    const query = `*[_type == "dailyNutrition" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      date,
      calories,
      protein,
      carbs,
      fats,
      fiber,
      water,
      notes
    }`

    const updatedEntry = await sanityClient.fetch(query, { id: params.id })

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Daily nutrition entry not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedEntry = {
      id: updatedEntry._id,
      createdAt: new Date(updatedEntry._createdAt),
      updatedAt: new Date(updatedEntry._updatedAt),
      date: new Date(updatedEntry.date),
      calories: updatedEntry.calories || null,
      protein: updatedEntry.protein || null,
      carbs: updatedEntry.carbs || null,
      fats: updatedEntry.fats || null,
      fiber: updatedEntry.fiber || null,
      water: updatedEntry.water || null,
      notes: updatedEntry.notes || null,
    }

    return NextResponse.json(transformedEntry)
  } catch (error) {
    console.error('Failed to update daily nutrition entry:', error)
    return NextResponse.json(
      { error: 'Failed to update daily nutrition entry' },
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
    console.error('Failed to delete daily nutrition entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete daily nutrition entry' },
      { status: 500 }
    )
  }
}
