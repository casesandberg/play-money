import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import { createMarket } from '@play-money/markets/lib/createMarket'
import schema from './schema'
import { MarketSchema } from '@play-money/database'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<NextResponse<typeof schema.POST.response>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in to create a market' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const basicMarket = schema.POST.request.body.parse(body)
    const newMarket = await createMarket(basicMarket.question, basicMarket.description, basicMarket.closeDate, session.user.id)

    return NextResponse.json(newMarket)
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message || 'Failed to create market' }, { status: 500 })
  }
}
