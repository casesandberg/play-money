import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import db from '@play-money/database'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

async function getMarketsCountByUser(userId: string) {
  const count = await db.market.count({
    where: {
      createdBy: userId,
    },
  })
  return count
}

async function getTradingVolumeByUser(userId: string) {
  const buyVolume = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      currencyCode: 'PRIMARY',
      transaction: {
        type: 'MARKET_BUY',
      },
    },
  })

  const sellVolume = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      currencyCode: 'PRIMARY',
      transaction: {
        type: 'MARKET_SELL',
      },
    },
  })

  const totalVolume = Decimal.abs(buyVolume._sum.amount || 0).plus(Decimal.abs(sellVolume._sum.amount || 0))

  return totalVolume.toNumber()
}

async function getNetWorthByUser(userId: string) {
  const netWorth = await db.transactionItem.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      account: {
        userId,
      },
      currencyCode: 'PRIMARY',
    },
  })

  return netWorth._sum.amount?.toNumber() ?? 0
}

async function getLastTradeByUser(userId: string) {
  const lastTrade = await db.transactionItem.findFirst({
    where: {
      account: {
        userId,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return lastTrade?.createdAt
}

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const { id } = schema.GET.parameters.parse(params)

    await getUserById({ id })

    const [netWorth, tradingVolume, totalMarkets, lastTradeAt] = await Promise.all([
      getNetWorthByUser(id),
      getTradingVolumeByUser(id),
      getMarketsCountByUser(id),
      getLastTradeByUser(id),
    ])

    return NextResponse.json({
      netWorth,
      tradingVolume,
      totalMarkets,
      lastTradeAt,
    })
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
