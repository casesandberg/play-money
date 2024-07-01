import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import type { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { isMarketTradable } from '@play-money/markets/lib/helpers'
import { createMarketBuyTransaction } from '@play-money/transactions/lib/createMarketBuyTransaction'
import schema from './schema'

function isPurchasableCurrency(currency: CurrencyCodeType): currency is 'YES' | 'NO' {
  return ['YES', 'NO'].includes(currency)
}

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = schema.post.parameters.parse(params)

    const body = (await req.json()) as unknown
    const { optionId, amount } = schema.post.requestBody.parse(body)

    const market = await getMarket({ id })
    if (!isMarketTradable(market)) {
      throw new Error('Market is closed')
    }

    const marketOption = await db.marketOption.findFirst({
      where: { id: optionId, marketId: id },
    })

    if (!marketOption) {
      throw new Error('Invalid optionId')
    }

    if (!isPurchasableCurrency(marketOption.currencyCode)) {
      throw new Error('Invalid option currency code')
    }

    await createMarketBuyTransaction({
      userId: session.user.id,
      marketId: id,
      amount: new Decimal(amount),
      purchaseCurrencyCode: marketOption.currencyCode,
    })

    return NextResponse.json({})
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
