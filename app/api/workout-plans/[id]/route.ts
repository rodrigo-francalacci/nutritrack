
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const query = `*[_type == "workoutPlan" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      date,
      "exercises": *[_type == "workoutExercise" && workoutPlanId == ^._id] {
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
      }
    }`

    const workoutPlan = await sanityClient.fetch(query, { id: params.id })

    if (!workoutPlan) {
      return NextResponse.json(
        { error: 'Workout plan not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedWorkoutPlan = {
      id: workoutPlan._id,
      createdAt: new Date(workoutPlan._createdAt),
      updatedAt: new Date(workoutPlan._updatedAt),
      name: workoutPlan.name,
      date: new Date(workoutPlan.date),
      exercises: workoutPlan.exercises?.map((workoutExercise: any) => ({
        id: workoutExercise._id,
        createdAt: new Date(workoutExercise._createdAt),
        updatedAt: new Date(workoutExercise._updatedAt),
        workoutPlanId: workoutExercise.workoutPlanId,
        exerciseId: workoutExercise.exerciseId,
        reps: workoutExercise.reps || null,
        series: workoutExercise.series || null,
        weight: workoutExercise.weight || null,
        exercise: workoutExercise.exercise ? {
          id: workoutExercise.exercise._id,
          createdAt: new Date(workoutExercise.exercise._createdAt),
          updatedAt: new Date(workoutExercise.exercise._updatedAt),
          name: workoutExercise.exercise.name,
          description: workoutExercise.exercise.description || null,
          photo: workoutExercise.exercise.photo || null,
          video: workoutExercise.exercise.video || null,
          musclesInvolved: workoutExercise.exercise.musclesInvolved || [],
        } : null,
      })) || [],
    }

    return NextResponse.json(transformedWorkoutPlan)
  } catch (error) {
    console.error('Failed to fetch workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout plan' },
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
    const { name, date } = body

    // Build update object with only defined values
    const updateData: any = {
      _updatedAt: new Date().toISOString(),
    }

    if (name?.trim()) updateData.name = name.trim()
    if (date) updateData.date = new Date(date).toISOString().split('T')[0]

    const workoutPlan = await sanityClient
      .patch(params.id)
      .set(updateData)
      .commit()

    // Fetch the updated workout plan with exercises
    const query = `*[_type == "workoutPlan" && _id == $id][0] {
      _id,
      _createdAt,
      _updatedAt,
      name,
      date,
      "exercises": *[_type == "workoutExercise" && workoutPlanId == ^._id] {
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
      }
    }`

    const updatedWorkoutPlan = await sanityClient.fetch(query, { id: params.id })

    if (!updatedWorkoutPlan) {
      return NextResponse.json(
        { error: 'Workout plan not found' },
        { status: 404 }
      )
    }

    // Transform to match expected format
    const transformedWorkoutPlan = {
      id: updatedWorkoutPlan._id,
      createdAt: new Date(updatedWorkoutPlan._createdAt),
      updatedAt: new Date(updatedWorkoutPlan._updatedAt),
      name: updatedWorkoutPlan.name,
      date: new Date(updatedWorkoutPlan.date),
      exercises: updatedWorkoutPlan.exercises?.map((workoutExercise: any) => ({
        id: workoutExercise._id,
        createdAt: new Date(workoutExercise._createdAt),
        updatedAt: new Date(workoutExercise._updatedAt),
        workoutPlanId: workoutExercise.workoutPlanId,
        exerciseId: workoutExercise.exerciseId,
        reps: workoutExercise.reps || null,
        series: workoutExercise.series || null,
        weight: workoutExercise.weight || null,
        exercise: workoutExercise.exercise ? {
          id: workoutExercise.exercise._id,
          createdAt: new Date(workoutExercise.exercise._createdAt),
          updatedAt: new Date(workoutExercise.exercise._updatedAt),
          name: workoutExercise.exercise.name,
          description: workoutExercise.exercise.description || null,
          photo: workoutExercise.exercise.photo || null,
          video: workoutExercise.exercise.video || null,
          musclesInvolved: workoutExercise.exercise.musclesInvolved || [],
        } : null,
      })) || [],
    }

    return NextResponse.json(transformedWorkoutPlan)
  } catch (error) {
    console.error('Failed to update workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to update workout plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First delete all associated workout exercises
    const workoutExercisesQuery = `*[_type == "workoutExercise" && workoutPlanId == $id]._id`
    const workoutExerciseIds = await sanityClient.fetch(workoutExercisesQuery, { id: params.id })
    
    // Delete all associated workout exercises
    if (workoutExerciseIds.length > 0) {
      await Promise.all(workoutExerciseIds.map((exerciseId: string) => sanityClient.delete(exerciseId)))
    }

    // Then delete the workout plan itself
    await sanityClient.delete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout plan' },
      { status: 500 }
    )
  }
}
