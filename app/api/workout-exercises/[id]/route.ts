
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reps, series, weight } = body

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (reps !== undefined) updateData.reps = reps ? parseInt(reps) : null
    if (series !== undefined) updateData.series = series ? parseInt(series) : null
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null

    const workoutExercise = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated workout exercise with exercise details
    const query = `*[_type == "workoutExercise" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      workoutPlanId,
      exerciseId,
      reps,
      series,
      weight,
      "exercise": *[_type == "exercise" && _id == ^.exerciseId][0] {
        _id,
        _createdAt,
        _updatedAt,
        name,
        description,
        photo,
        video,
        musclesInvolved
      }
    }`

    const updatedWorkoutExercise = await sanityClient.fetch(query, { id: params.id })

    if (!updatedWorkoutExercise) {
      return NextResponse.json(
        { error: 'Workout exercise not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedWorkoutExercise = {
      id: updatedWorkoutExercise._id,
      createdAt: new Date(updatedWorkoutExercise._createdAt),
      updatedAt: new Date(updatedWorkoutExercise._updatedAt),
      workoutPlanId: updatedWorkoutExercise.workoutPlanId,
      exerciseId: updatedWorkoutExercise.exerciseId,
      reps: updatedWorkoutExercise.reps || null,
      series: updatedWorkoutExercise.series || null,
      weight: updatedWorkoutExercise.weight || null,
      exercise: updatedWorkoutExercise.exercise ? {
        id: updatedWorkoutExercise.exercise._id,
        createdAt: new Date(updatedWorkoutExercise.exercise._createdAt),
        updatedAt: new Date(updatedWorkoutExercise.exercise._updatedAt),
        name: updatedWorkoutExercise.exercise.name,
        description: updatedWorkoutExercise.exercise.description || null,
        photo: updatedWorkoutExercise.exercise.photo || null,
        video: updatedWorkoutExercise.exercise.video || null,
        musclesInvolved: updatedWorkoutExercise.exercise.musclesInvolved || [],
      } : null,
    }

    return NextResponse.json(transformedWorkoutExercise)
  } catch (error) {
    console.error('Failed to update workout exercise:', error)
    return NextResponse.json(
      { error: 'Failed to update workout exercise' },
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
    console.error('Failed to delete workout exercise:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout exercise' },
      { status: 500 }
    )
  }
}
