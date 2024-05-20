import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import { createComment } from '@play-money/comments/lib/createComment'
import { _UserModel } from '@play-money/database'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(req: Request): Promise<NextResponse<typeof schema.POST.response>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const data = schema.POST.request.body.parse(body)

    const comment = await createComment({ ...data, authorId: session.user.id })

    return NextResponse.json(comment)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
