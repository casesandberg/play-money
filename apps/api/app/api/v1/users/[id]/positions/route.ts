import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getUserById } from '@play-money/users/lib/getUserById'
import { getUserPositions } from '@play-money/users/lib/getUserPositions'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const urlParams = Object.fromEntries(searchParams)

    const { id: userId, status, ...paginationParams } = schema.get.parameters.parse({ ...(params || {}), ...urlParams })

    await getUserById({ id: userId })

    const results = await getUserPositions({ userId, status }, paginationParams)

    return NextResponse.json(results)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
