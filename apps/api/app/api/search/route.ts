import { NextResponse } from 'next/server'
import { _UserModel } from '@play-money/database'
import { search } from '@play-money/search/lib/search'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { query } = schema.GET.request.params.parse(params)

    const { users } = await search({ query })

    return NextResponse.json({ users })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
