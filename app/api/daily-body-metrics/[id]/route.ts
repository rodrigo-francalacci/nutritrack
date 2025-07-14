
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = `*[_type == "dailyBodyMetrics" && _id == $id][0] {
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

    const entry = await sanityClient.fetch(query, { id: params.id })

    if (!entry) {
      return NextResponse.json(
        { error: 'Daily body metrics entry not found' },
        { status: 404 }
      )
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
    console.error('Failed to fetch daily body metrics entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily body metrics entry' },
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

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (date) updateData.date = new Date(date).toISOString().split('T')[0]
    if (weight !== undefined) updateData.weight = parseFloat(weight) || null
    if (bodyFat !== undefined) updateData.bodyFat = parseFloat(bodyFat) || null
    if (muscleMass !== undefined) updateData.muscleMass = parseFloat(muscleMass) || null
    if (visceralFat !== undefined) updateData.visceralFat = parseFloat(visceralFat) || null
    if (bmi !== undefined) updateData.bmi = parseFloat(bmi) || null
    if (bodyWater !== undefined) updateData.bodyWater = parseFloat(bodyWater) || null
    if (boneMass !== undefined) updateData.boneMass = parseFloat(boneMass) || null
    if (basalMetabolism !== undefined) updateData.basalMetabolism = parseFloat(basalMetabolism) || null
    if (notes !== undefined) updateData.notes = notes?.trim() || null

    const entry = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated entry
    const query = `*[_type == "dailyBodyMetrics" && _id == $id][0] {
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

    const updatedEntry = await sanityClient.fetch(query, { id: params.id })

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Daily body metrics entry not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedEntry = {
      id: updatedEntry._id,
      createdAt: new Date(updatedEntry._createdAt),
      updatedAt: new Date(updatedEntry._updatedAt),
      date: new Date(updatedEntry.date),
      weight: updatedEntry.weight || null,
      bodyFat: updatedEntry.bodyFat || null,
      muscleMass: updatedEntry.muscleMass || null,
      visceralFat: updatedEntry.visceralFat || null,
      bmi: updatedEntry.bmi || null,
      bodyWater: updatedEntry.bodyWater || null,
      boneMass: updatedEntry.boneMass || null,
      basalMetabolism: updatedEntry.basalMetabolism || null,
      notes: updatedEntry.notes || null,
    }

    return NextResponse.json(transformedEntry)
  } catch (error) {
    console.error('Failed to update daily body metrics entry:', error)
    return NextResponse.json(
      { error: 'Failed to update daily body metrics entry' },
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
    console.error('Failed to delete daily body metrics entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete daily body metrics entry' },
      { status: 500 }
    )
  }
}
