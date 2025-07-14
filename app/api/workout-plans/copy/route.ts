
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sourceWorkoutId, targetDate, targetName } = body

    if (!sourceWorkoutId || !targetDate) {
      return NextResponse.json(
        { error: 'Source workout ID and target date are required' },
        { status: 400 }
      )
    }

    // Fetch the source workout with all its exercises
    const sourceWorkout = await prisma.workoutPlan.findUnique({
      where: { id: sourceWorkoutId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    })

    if (!sourceWorkout) {
      return NextResponse.json(
        { error: 'Source workout not found' },
        { status: 404 }
      )
    }

    // Check if there's already a workout on the target date
    const existingWorkout = await prisma.workoutPlan.findFirst({
      where: {
        date: new Date(targetDate),
      },
    })

    if (existingWorkout) {
      return NextResponse.json(
        { error: 'A workout already exists for the target date' },
        { status: 409 }
      )
    }

    // Create the new workout plan
    const newWorkout = await prisma.workoutPlan.create({
      data: {
        name: targetName || `${sourceWorkout.name} (Copy)`,
        date: new Date(targetDate),
      },
    })

    // Copy all exercises from the source workout
    const exercisePromises = sourceWorkout.exercises.map((exercise) =>
      prisma.workoutExercise.create({
        data: {
          workoutPlanId: newWorkout.id,
          exerciseId: exercise.exerciseId,
          reps: exercise.reps,
          series: exercise.series,
          weight: exercise.weight,
        },
        include: {
          exercise: true,
        },
      })
    )

    await Promise.all(exercisePromises)

    // Fetch the complete copied workout
    const copiedWorkout = await prisma.workoutPlan.findUnique({
      where: { id: newWorkout.id },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    })

    return NextResponse.json(copiedWorkout)
  } catch (error) {
    console.error('Failed to copy workout:', error)
    return NextResponse.json(
      { error: 'Failed to copy workout' },
      { status: 500 }
    )
  }
}
