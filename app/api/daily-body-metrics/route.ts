
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = `*[_type == "dailyBodyMetrics"`
    
    if (startDate && endDate) {
      query += ` && date >= "${startDate}" && date <= "${endDate}"`
    }
    
    query += `] | order(date desc) {
      _id,
      _createdAt,
      _updatedAt,
      date,
      weight,
      bodyFat,
      muscleMass,
      visceralFat,
      bmi,
      bodyWater,
      boneMass,
      basalMetabolism,
      notes
    }`

    const entries = await sanityClient.fetch(query)
    
    // Transform to match expected format
    const transformedEntries = entries.map((entry: any) => ({
      id: entry._id,
      createdAt: new Date(entry._createdAt),
      updatedAt: new Date(entry._updatedAt),
      date: new Date(entry.date),
      weight: entry.weight || null,
      bodyFat: entry.bodyFat || null,
      muscleMass: entry.muscleMass || null,
      visceralFat: entry.visceralFat || null,
      bmi: entry.bmi || null,
      bodyWater: entry.bodyWater || null,
      boneMass: entry.boneMass || null,
      basalMetabolism: entry.basalMetabolism || null,
      notes: entry.notes || null,
    }))

    return NextResponse.json(transformedEntries)
  } catch (error) {
    console.error('Failed to fetch daily body metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily body metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      date,
      weight,
      bodyFat,
      muscleMass,
      visceralFat,
      bmi,
      bodyWater,
      boneMass,
      basalMetabolism,
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
    const existingQuery = `*[_type == "dailyBodyMetrics" && date == "${dateString}"][0]`
    const existingEntry = await sanityClient.fetch(existingQuery)

    let entry
    const now = new Date().toISOString()

    if (existingEntry) {
      // Update existing entry
      const updateData: any = {
        _updatedAt: now,
      }

      if (weight !== undefined) updateData.weight = parseFloat(weight) || null
      if (bodyFat !== undefined) updateData.bodyFat = parseFloat(bodyFat) || null
      if (muscleMass !== undefined) updateData.muscleMass = parseFloat(muscleMass) || null
      if (visceralFat !== undefined) updateData.visceralFat = parseFloat(visceralFat) || null
      if (bmi !== undefined) updateData.bmi = parseFloat(bmi) || null
      if (bodyWater !== undefined) updateData.bodyWater = parseFloat(bodyWater) || null
      if (boneMass !== undefined) updateData.boneMass = parseFloat(boneMass) || null
      if (basalMetabolism !== undefined) updateData.basalMetabolism = parseFloat(basalMetabolism) || null
      if (notes !== undefined) updateData.notes = notes?.trim() || null

      entry = await sanityClient
        .patch(existingEntry._id)
        .set(updateData)
        .commit()

      // Fetch updated entry
      const updatedQuery = `*[_type == "dailyBodyMetrics" && _id == "${existingEntry._id}"][0]`
      entry = await sanityClient.fetch(updatedQuery)
    } else {
      // Create new entry
      const entryId = generateSanityId()
      entry = await sanityClient.create({
        _type: 'dailyBodyMetrics',
        _id: entryId,
        _createdAt: now,
        _updatedAt: now,
        date: dateString,
        weight: weight !== undefined ? parseFloat(weight) || null : null,
        bodyFat: bodyFat !== undefined ? parseFloat(bodyFat) || null : null,
        muscleMass: muscleMass !== undefined ? parseFloat(muscleMass) || null : null,
        visceralFat: visceralFat !== undefined ? parseFloat(visceralFat) || null : null,
        bmi: bmi !== undefined ? parseFloat(bmi) || null : null,
        bodyWater: bodyWater !== undefined ? parseFloat(bodyWater) || null : null,
        boneMass: boneMass !== undefined ? parseFloat(boneMass) || null : null,
        basalMetabolism: basalMetabolism !== undefined ? parseFloat(basalMetabolism) || null : null,
        notes: notes?.trim() || null,
      })
    }

    // Transform to match expected format
    const transformedEntry = {
      id: entry._id,
      createdAt: new Date(entry._createdAt),
      updatedAt: new Date(entry._updatedAt),
      date: new Date(entry.date),
      weight: entry.weight || null,
      bodyFat: entry.bodyFat || null,
      muscleMass: entry.muscleMass || null,
      visceralFat: entry.visceralFat || null,
      bmi: entry.bmi || null,
      bodyWater: entry.bodyWater || null,
      boneMass: entry.boneMass || null,
      basalMetabolism: entry.basalMetabolism || null,
      notes: entry.notes || null,
    }

    return NextResponse.json(transformedEntry)
  } catch (error) {
    console.error('Failed to create/update daily body metrics:', error)
    return NextResponse.json(
      { error: 'Failed to create/update daily body metrics' },
      { status: 500 }
    )
  }
}
