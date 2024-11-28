import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getAuthUser } from '@play-money/auth/lib/getAuthUser'
import { getMarketTagsLLM } from '@play-money/markets/lib/getMarketTagsLLM'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const body = (await req.json()) as unknown
    const { question } = schema.post.requestBody.parse(body)

    const userId = await getAuthUser(req)
    if (!userId) {
      return NextResponse.json({ tags: [] })
    }

    const tags = await getMarketTagsLLM({
      question,
    })

    return NextResponse.json({
      tags,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
