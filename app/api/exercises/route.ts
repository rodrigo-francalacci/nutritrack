
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const query = `*[_type == "exercise"] | order(_createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      name,
      description,
      photo,
      video,
      musclesInvolved
    }`

    const exercises = await sanityClient.fetch(query)
    
    // Transform to match expected format
    const transformedExercises = exercises.map((exercise: any) => ({
      id: exercise._id,
      createdAt: new Date(exercise._createdAt),
      updatedAt: new Date(exercise._updatedAt),
      name: exercise.name,
      description: exercise.description || null,
      photo: exercise.photo || null,
      video: exercise.video || null,
      musclesInvolved: exercise.musclesInvolved || [],
    }))

    return NextResponse.json(transformedExercises)
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, photo, video, musclesInvolved = [] } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const exerciseId = generateSanityId()
    const now = new Date().toISOString()

    const exercise = await sanityClient.create({
      _type: 'exercise',
      _id: exerciseId,
      _createdAt: now,
      _updatedAt: now,
      name: name.trim(),
      description: description?.trim() || null,
      photo: photo || null,
      video: video || null,
      musclesInvolved: Array.isArray(musclesInvolved) ? musclesInvolved : [],
    })

    // Transform to match expected format
    const transformedExercise = {
      id: exercise._id,
      createdAt: new Date(exercise._createdAt),
      updatedAt: new Date(exercise._updatedAt),
      name: exercise.name,
      description: exercise.description || null,
      photo: exercise.photo || null,
      video: exercise.video || null,
      musclesInvolved: exercise.musclesInvolved || [],
    }

    return NextResponse.json(transformedExercise)
  } catch (error) {
    console.error('Failed to create exercise:', error)
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    )
  }
}
