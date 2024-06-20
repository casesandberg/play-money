import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { quote } from '@play-money/amms/lib/maniswap-v1'
import type { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import type { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
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
