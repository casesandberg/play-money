import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import {
  DAILY_COMMENT_BONUS_PRIMARY,
  DAILY_LIQUIDITY_BONUS_PRIMARY,
  DAILY_MARKET_BONUS_PRIMARY,
  DAILY_TRADE_BONUS_PRIMARY,
} from '@play-money/economy'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserById } from '@play-money/users/lib/getUserById'
import { getUserStats } from '@play-money/users/lib/getUserStats'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const { id } = schema.GET.parameters.parse(params)

    await getUserById({ id })

    const {
      netWorth,
      tradingVolume,
      totalMarkets,
      lastTradeAt,
      hasPlacedMarketTrade,
      hasCreatedMarket,
      hasCommented,
      hasBoostedLiquidity,
    } = await getUserStats({ userId: id })

    return NextResponse.json({
      netWorth: netWorth.toNumber(),
      tradingVolume: tradingVolume.toNumber(),
      totalMarkets,
      lastTradeAt,
      quests: [
        {
          title: 'Bet in a market',
          award: DAILY_TRADE_BONUS_PRIMARY,
          completed: hasPlacedMarketTrade,
          href: '/questions',
        },
        {
          title: 'Create a market',
          award: DAILY_MARKET_BONUS_PRIMARY,
          completed: hasCreatedMarket,
          href: '/create-post',
        },
        {
          title: 'Write a comment',
          award: DAILY_COMMENT_BONUS_PRIMARY,
          completed: hasCommented,
          href: '/questions',
        },
        {
          title: 'Boost liquidity in a market',
          award: DAILY_LIQUIDITY_BONUS_PRIMARY,
          completed: hasBoostedLiquidity,
          href: '/questions',
        },
      ],
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
