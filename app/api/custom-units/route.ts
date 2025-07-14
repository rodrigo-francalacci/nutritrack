
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const query = `*[_type == "customUnit"] | order(_createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      unitName,
      gramsEquivalent,
      ingredientId
    }`

    const customUnits = await sanityClient.fetch(query)
    
    // Transform to match expected format
    const transformedCustomUnits = customUnits.map((unit: any) => ({
      id: unit._id,
      createdAt: new Date(unit._createdAt),
      updatedAt: new Date(unit._updatedAt),
      unitName: unit.unitName,
      gramsEquivalent: unit.gramsEquivalent,
      ingredientId: unit.ingredientId,
    }))

    return NextResponse.json(transformedCustomUnits)
  } catch (error) {
    console.error('Failed to fetch custom units:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom units' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ingredientId, unitName, gramsEquivalent } = body

    if (!ingredientId || !unitName?.trim() || !gramsEquivalent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const customUnitId = generateSanityId()
    const now = new Date().toISOString()

    const customUnit = await sanityClient.create({
      _type: 'customUnit',
      _id: customUnitId,
      _createdAt: now,
      _updatedAt: now,
      ingredientId,
      unitName: unitName.trim(),
      gramsEquivalent: parseFloat(gramsEquivalent),
    })

    // Transform to match expected format
    const transformedCustomUnit = {
      id: customUnit._id,
      createdAt: new Date(customUnit._createdAt),
      updatedAt: new Date(customUnit._updatedAt),
      ingredientId: customUnit.ingredientId,
      unitName: customUnit.unitName,
      gramsEquivalent: customUnit.gramsEquivalent,
    }

    return NextResponse.json(transformedCustomUnit)
  } catch (error) {
    console.error('Failed to create custom unit:', error)
    return NextResponse.json(
      { error: 'Failed to create custom unit' },
      { status: 500 }
    )
  }
}
