import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getStatsUsersTimeSeries } from '@play-money/transparency/lib/getStatsUsersTimeSeries'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const now = new Date()
    const startAt = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const data = await getStatsUsersTimeSeries({
      endAt: new Date(),
      startAt,
    })

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
