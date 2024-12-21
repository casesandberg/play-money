import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { checkUsername } from '@play-money/users/lib/checkUsername'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(req: Request): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { username } = schema.get.parameters.parse(params)

    const { available, message } = await checkUsername({ username })

    return NextResponse.json({ available, message })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
