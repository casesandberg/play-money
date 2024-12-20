import { NextResponse } from 'next/server'
import { type SchemaResponse } from '@play-money/api-helpers'
import { getList } from '@play-money/lists/lib/getList'
import schema from './schema'

export const dynamic = 'force-dynamic'

// TODO: Look into a better way to handle mixing vercel params and search params together...
export async function GET(
  req: Request,
  { params: idParams }: { params: Record<string, unknown> }
): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const params = Object.fromEntries(searchParams)

    if (params.extended) {
      // TODO: Transform this within zod before parsing. This is a workaround for now.
      params.extended = (params.extended === 'true') as unknown as string
    }

    const { id, extended } = schema.get.parameters.parse({ ...params, ...idParams })

    const list = await getList({ id, extended })

    return NextResponse.json(list)
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
