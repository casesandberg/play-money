import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import type { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { createMarketSellTransaction } from '@play-money/transactions/lib/createMarketSellTransaction'
import schema from './schema'

function isSellableCurrency(currency: CurrencyCodeType): currency is 'YES' | 'NO' {
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

    const marketOption = await db.marketOption.findFirst({
      where: { id: optionId, marketId: id },
    })

    if (!marketOption) {
      throw new Error('Invalid optionId')
    }

    if (!isSellableCurrency(marketOption.currencyCode)) {
      throw new Error('Invalid option currency code')
    }

    await createMarketSellTransaction({
      userId: session.user.id,
      marketId: id,
      amount: new Decimal(amount),
      sellCurrencyCode: marketOption.currencyCode,
    })

    return NextResponse.json({})
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
