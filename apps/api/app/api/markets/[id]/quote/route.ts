import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { quote } from '@play-money/amms/lib/maniswap-v1'
import type { SchemaResponse } from '@play-money/api-helpers'
import db from '@play-money/database'
import { isPurchasableCurrency } from '@play-money/markets/lib/helpers'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const { id } = schema.post.parameters.parse(params)

    const body = (await req.json()) as unknown
    const { optionId, amount, isBuy = true } = schema.post.requestBody.parse(body)

    const marketOption = await db.marketOption.findFirst({
      where: { id: optionId, marketId: id },
    })

    if (!marketOption) {
      throw new Error('Invalid optionId')
    }

    if (!isPurchasableCurrency(marketOption.currencyCode)) {
      throw new Error('Invalid option currency code')
    }

    const ammAccount = await getAmmAccount({ marketId: id })

    const decimalAmount = new Decimal(amount)

    // TODO: Change to multi-step quote to account for limit orders
    const { probability, shares } = await quote({
      ammAccountId: ammAccount.id,
      currencyCode: marketOption.currencyCode,
      amount: decimalAmount,
      isBuy,
    })

    return NextResponse.json({
      newProbability: probability.toNumber(),
      potentialReturn: shares.toNumber(),
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
