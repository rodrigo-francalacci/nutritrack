
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = `*[_type == "dailyNutrition"`
    
    if (startDate && endDate) {
      query += ` && date >= "${startDate}" && date <= "${endDate}"`
    }
    
    query += `] | order(date desc) {
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

    const entries = await sanityClient.fetch(query)
    
    // Transform to match expected format
    const transformedEntries = entries.map((entry: any) => ({
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
    }))

    return NextResponse.json(transformedEntries)
  } catch (error) {
    console.error('Failed to fetch daily nutrition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily nutrition' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    const dateString = new Date(date).toISOString().split('T')[0]
    
    // Check if entry already exists for this date
    const existingQuery = `*[_type == "dailyNutrition" && date == "${dateString}"][0]`
    const existingEntry = await sanityClient.fetch(existingQuery)

    let entry
    const now = new Date().toISOString()

    if (existingEntry) {
      // Update existing entry
      const updateData: any = {
        _updatedAt: now,
      }

      if (calories !== undefined) updateData.calories = parseFloat(calories) || null
      if (protein !== undefined) updateData.protein = parseFloat(protein) || null
      if (carbs !== undefined) updateData.carbs = parseFloat(carbs) || null
      if (fats !== undefined) updateData.fats = parseFloat(fats) || null
      if (fiber !== undefined) updateData.fiber = parseFloat(fiber) || null
      if (water !== undefined) updateData.water = parseFloat(water) || null
      if (notes !== undefined) updateData.notes = notes?.trim() || null

      entry = await sanityClient
        .patch(existingEntry._id)
        .set(updateData)
        .commit()

      // Fetch updated entry
      const updatedQuery = `*[_type == "dailyNutrition" && _id == "${existingEntry._id}"][0]`
      entry = await sanityClient.fetch(updatedQuery)
    } else {
      // Create new entry
      const entryId = generateSanityId()
      entry = await sanityClient.create({
        _type: 'dailyNutrition',
        _id: entryId,
        _createdAt: now,
        _updatedAt: now,
        date: dateString,
        calories: calories !== undefined ? parseFloat(calories) || null : null,
        protein: protein !== undefined ? parseFloat(protein) || null : null,
        carbs: carbs !== undefined ? parseFloat(carbs) || null : null,
        fats: fats !== undefined ? parseFloat(fats) || null : null,
        fiber: fiber !== undefined ? parseFloat(fiber) || null : null,
        water: water !== undefined ? parseFloat(water) || null : null,
        notes: notes?.trim() || null,
      })
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
    console.error('Failed to create/update daily nutrition:', error)
    return NextResponse.json(
      { error: 'Failed to create/update daily nutrition' },
      { status: 500 }
    )
  }
}
