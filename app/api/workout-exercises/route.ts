
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { workoutPlanId, exerciseId, reps, series, weight } = body

    if (!workoutPlanId || !exerciseId) {
      return NextResponse.json(
        { error: 'Workout plan and exercise are required' },
        { status: 400 }
      )
    }

    const workoutExerciseId = generateSanityId()
    const now = new Date().toISOString()

    const workoutExercise = await sanityClient.create({
      _type: 'workoutExercise',
      _id: workoutExerciseId,
      _createdAt: now,
      _updatedAt: now,
      workoutPlanId,
      exerciseId,
      reps: reps ? parseInt(reps) : null,
      series: series ? parseInt(series) : null,
      weight: weight ? parseFloat(weight) : null,
    })

    // Fetch the exercise details to include in the response
    const exerciseQuery = `*[_type == "exercise" && _id == $exerciseId][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      description,
      photo,
      video,
      musclesInvolved
    }`

    const exercise = await sanityClient.fetch(exerciseQuery, { exerciseId })

    // Transform to match expected format
    const transformedWorkoutExercise = {
      id: workoutExercise._id,
      createdAt: new Date(workoutExercise._createdAt),
      updatedAt: new Date(workoutExercise._updatedAt),
      workoutPlanId: workoutExercise.workoutPlanId,
      exerciseId: workoutExercise.exerciseId,
      reps: workoutExercise.reps || null,
      series: workoutExercise.series || null,
      weight: workoutExercise.weight || null,
      exercise: exercise ? {
        id: exercise._id,
        createdAt: new Date(exercise._createdAt),
        updatedAt: new Date(exercise._updatedAt),
        name: exercise.name,
        description: exercise.description || null,
        photo: exercise.photo || null,
        video: exercise.video || null,
        musclesInvolved: exercise.musclesInvolved || [],
      } : null,
    }

    return NextResponse.json(transformedWorkoutExercise)
  } catch (error) {
    console.error('Failed to add exercise to workout:', error)
    return NextResponse.json(
      { error: 'Failed to add exercise to workout' },
      { status: 500 }
    )
  }
}
