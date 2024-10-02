import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getStatsUsersTimeSeries } from '@play-money/transparency/lib/getStatsUsersTimeSeries'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const data = await getStatsUsersTimeSeries({
      endAt: new Date(),
    })

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
