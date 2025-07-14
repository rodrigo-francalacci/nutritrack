
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sanityClient.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete custom unit:', error)
    return NextResponse.json(
      { error: 'Failed to delete custom unit' },
      { status: 500 }
    )
  }
}
