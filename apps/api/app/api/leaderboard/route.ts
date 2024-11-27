import { NextResponse } from 'next/server'
import { type SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import { getMonthlyLeaderboard } from '@play-money/finance/lib/getMonthlyLeaderboard'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.flatResponses>> {
  try {
    const session = await auth()

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { month, year } = schema.get.parameters.parse(params) ?? {}

    const now = month && year ? new Date(`${month}/01/${year}`) : new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const leaderboard = await getMonthlyLeaderboard(startDate, endDate, session?.user?.id)

    return NextResponse.json(leaderboard, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=600, s-maxage=600, stale-while-revalidate=59',
      },
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Failed to retrieve user session' }, { status: 500 })
  }
}
