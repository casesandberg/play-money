import Decimal from 'decimal.js'
import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getMarketQuote } from '@play-money/markets/lib/getMarketQuote'
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

    const { probability, shares } = await getMarketQuote({
      marketId: id,
      optionId,
      amount: new Decimal(amount),
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
