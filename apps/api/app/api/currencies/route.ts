import { NextResponse } from 'next/server'
import { getCurrencies } from '@play-money/currencies/lib/getCurrencies'
import type schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const currencies = await getCurrencies()

    return NextResponse.json({ currencies })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
