
import { NextResponse } from 'next/server'
import { sanityClient, generateSanityId } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { habitId, date, completed = true } = body

    if (!habitId || !date) {
      return NextResponse.json(
        { error: 'Habit ID and date are required' },
        { status: 400 }
      )
    }

    const dateString = new Date(date).toISOString().split('T')[0]
    
    // Check if completion already exists for this habit and date
    const existingQuery = `*[_type == "habitCompletion" && habitId == $habitId && date == $date][0]`
    const existingCompletion = await sanityClient.fetch(existingQuery, { 
      habitId, 
      date: dateString 
    })

    let completion
    const now = new Date().toISOString()

    if (existingCompletion) {
      // Toggle the existing completion
      completion = await sanityClient
        .patch(existingCompletion._id)
        .set({
          completed: !existingCompletion.completed,
          _updatedAt: now,
        })
        .commit()

      // Fetch the updated completion
      const updatedQuery = `*[_type == "habitCompletion" && _id == $id][0]`
      completion = await sanityClient.fetch(updatedQuery, { id: existingCompletion._id })
    } else {
      // Create new completion
      const completionId = generateSanityId()
      completion = await sanityClient.create({
        _type: 'habitCompletion',
        _id: completionId,
        _createdAt: now,
        _updatedAt: now,
        habitId,
        date: dateString,
        completed: true,
      })
    }

    // Transform to match expected format
    const transformedCompletion = {
      id: completion._id,
      createdAt: new Date(completion._createdAt),
      updatedAt: new Date(completion._updatedAt),
      habitId: completion.habitId,
      date: new Date(completion.date),
      completed: completion.completed,
    }

    return NextResponse.json(transformedCompletion)
  } catch (error) {
    console.error('Failed to toggle habit completion:', error)
    return NextResponse.json(
      { error: 'Failed to toggle habit completion' },
      { status: 500 }
    )
  }
}
