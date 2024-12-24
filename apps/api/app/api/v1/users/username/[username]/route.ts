import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserByUsername } from '@play-money/users/lib/getUserByUsername'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const { username } = schema.get.parameters.parse(params)

    const user = await getUserByUsername({ username })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
