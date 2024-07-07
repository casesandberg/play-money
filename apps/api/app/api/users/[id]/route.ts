import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.GET.responses>> {
  try {
    const { id } = schema.GET.parameters.parse(params)

    const user = await getUserById({ id })

    return NextResponse.json(user)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
