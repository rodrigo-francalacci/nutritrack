
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    
    // Build completions filter based on month parameter
    let completionsFilter = 'habitId == ^._id'
    if (month) {
      // Filter completions to only include those from the specified month
      completionsFilter += ` && date >= "${month}-01" && date < "${month}-32"`
    }
    
    const query = `*[_type == "habit"] | order(_createdAt desc) {
      _id,
      _createdAt,
      _updatedAt,
      name,
      description,
      "completions": *[_type == "habitCompletion" && ${completionsFilter}] {
        _id,
        _createdAt,
        _updatedAt,
        date,
        completed,
        habitId
      }
    }`

    const habits = await sanityClient.fetch(query)
    
    // Transform to match expected format
    const transformedHabits = habits.map((habit: any) => ({
      id: habit._id,
      createdAt: new Date(habit._createdAt),
      updatedAt: new Date(habit._updatedAt),
      name: habit.name,
      description: habit.description || null,
      completions: habit.completions?.map((completion: any) => ({
        id: completion._id,
        createdAt: new Date(completion._createdAt),
        updatedAt: new Date(completion._updatedAt),
        date: new Date(completion.date),
        completed: completion.completed,
        habitId: completion.habitId,
      })) || [],
    }))

    return NextResponse.json(transformedHabits)
  } catch (error) {
    console.error('Failed to fetch habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const habitId = generateSanityId()
    const now = new Date().toISOString()

    const habit = await sanityClient.create({
      _type: 'habit',
      _id: habitId,
      _createdAt: now,
      _updatedAt: now,
      name: name.trim(),
      description: description?.trim() || null,
    })

    // Transform to match expected format
    const transformedHabit = {
      id: habit._id,
      createdAt: new Date(habit._createdAt),
      updatedAt: new Date(habit._updatedAt),
      name: habit.name,
      description: habit.description || null,
      completions: [],
    }

    return NextResponse.json(transformedHabit)
  } catch (error) {
    console.error('Failed to create habit:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}
