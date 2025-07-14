
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, photo, video, musclesInvolved } = body

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (name?.trim()) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (photo !== undefined) updateData.photo = photo || null
    if (video !== undefined) updateData.video = video || null
    if (Array.isArray(musclesInvolved)) updateData.musclesInvolved = musclesInvolved

    const exercise = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated exercise
    const query = `*[_type == "exercise" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      description,
      photo,
      video,
      musclesInvolved
    }`

    const updatedExercise = await sanityClient.fetch(query, { id: params.id })

    if (!updatedExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedExercise = {
      id: updatedExercise._id,
      createdAt: new Date(updatedExercise._createdAt),
      updatedAt: new Date(updatedExercise._updatedAt),
      name: updatedExercise.name,
      description: updatedExercise.description || null,
      photo: updatedExercise.photo || null,
      video: updatedExercise.video || null,
      musclesInvolved: updatedExercise.musclesInvolved || [],
    }

    return NextResponse.json(transformedExercise)
  } catch (error) {
    console.error('Failed to update exercise:', error)
    return NextResponse.json(
      { error: 'Failed to update exercise' },
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
    console.error('Failed to delete exercise:', error)
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    )
  }
}
