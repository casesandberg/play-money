import { _UserModel } from '@play-money/database'
import { UserNotFoundError } from '@play-money/users/lib/exceptions'
import { getUserByUsername } from '@play-money/users/lib/getUserByUsername'
import { NextResponse } from 'next/server'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: unknown }
): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const { username } = schema.GET.request.params.parse(params)

    const user = await getUserByUsername({ username })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
