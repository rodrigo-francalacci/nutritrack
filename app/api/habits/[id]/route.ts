
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description } = body

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (name?.trim()) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null

    const habit = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated habit with completions
    const query = `*[_type == "habit" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      description,
      "completions": *[_type == "habitCompletion" && habit._ref == ^._id] {
        _id,
        _createdAt,
        _updatedAt,
        date,
        completed,
        habitId
      }
    }`

    const updatedHabit = await sanityClient.fetch(query, { id: params.id })

    if (!updatedHabit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedHabit = {
      id: updatedHabit._id,
      createdAt: new Date(updatedHabit._createdAt),
      updatedAt: new Date(updatedHabit._updatedAt),
      name: updatedHabit.name,
      description: updatedHabit.description || null,
      completions: updatedHabit.completions?.map((completion: any) => ({
        id: completion._id,
        createdAt: new Date(completion._createdAt),
        updatedAt: new Date(completion._updatedAt),
        date: new Date(completion.date),
        completed: completion.completed,
        habitId: completion.habitId,
      })) || [],
    }

    return NextResponse.json(transformedHabit)
  } catch (error) {
    console.error('Failed to update habit:', error)
    return NextResponse.json(
      { error: 'Failed to update habit' },
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
    console.error('Failed to delete habit:', error)
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    )
  }
}
