
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (date) {
      // Fetch workout for a specific date
      const query = `*[_type == "workoutPlan" && date == "${date}"][0] {
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

      const workoutPlan = await sanityClient.fetch(query)
      
      if (!workoutPlan) {
        return NextResponse.json(null)
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
    } else {
      // Fetch all workout plans
      const query = `*[_type == "workoutPlan"] | order(date desc) {
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

      const workoutPlans = await sanityClient.fetch(query)
      
      // Transform to match expected format
      const transformedWorkoutPlans = workoutPlans.map((workoutPlan: any) => ({
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
      }))

      return NextResponse.json(transformedWorkoutPlans)
    }
  } catch (error) {
    console.error('Failed to fetch workout plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, date } = body

    if (!name?.trim() || !date) {
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      )
    }

    const workoutPlanId = generateSanityId()
    const now = new Date().toISOString()
    const dateString = new Date(date).toISOString().split('T')[0]

    const workoutPlan = await sanityClient.create({
      _type: 'workoutPlan',
      _id: workoutPlanId,
      _createdAt: now,
      _updatedAt: now,
      name: name.trim(),
      date: dateString,
    })

    // Transform to match expected format
    const transformedWorkoutPlan = {
      id: workoutPlan._id,
      createdAt: new Date(workoutPlan._createdAt),
      updatedAt: new Date(workoutPlan._updatedAt),
      name: workoutPlan.name,
      date: new Date(workoutPlan.date),
      exercises: [],
    }

    return NextResponse.json(transformedWorkoutPlan)
  } catch (error) {
    console.error('Failed to create workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to create workout plan' },
      { status: 500 }
    )
  }
}
