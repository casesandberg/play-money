import { _UserModel } from '@play-money/database'
import { checkUsername } from '@play-money/users/lib/checkUsername'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { NextResponse } from 'next/server'
import z from 'zod'

export const dynamic = 'force-dynamic'

// TODO: Next doesnt like us exporting this schema...
const schema = createSchema({
  GET: {
    request: {
      params: _UserModel.pick({ username: true }),
    },
    response: {
      200: z.object({ available: z.boolean(), message: z.string().optional() }),
      500: ServerErrorSchema,
    },
  },
})

export async function GET(req: Request): Promise<NextResponse<typeof schema.GET.response>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    const { username } = schema.GET.request.params.parse(params)

    const { available, message } = await checkUsername({ username })

    return NextResponse.json({ available, message })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
