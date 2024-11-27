import { NextResponse } from 'next/server'
import type { SchemaResponse } from '@play-money/api-helpers'
import { getPositions } from '@play-money/finance/lib/getPositions'
import { getUserById } from '@play-money/users/lib/getUserById'
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: unknown }
): Promise<SchemaResponse<typeof schema.get.flatResponses>> {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const urlParams = Object.fromEntries(searchParams)

    const { id, pageSize, status } = schema.get.parameters.parse({ ...(params || {}), ...urlParams })

    const user = await getUserById({ id })

    const { positions } = await getPositions(
      {
        accountId: user.primaryAccountId,
        status,
      },
      { field: 'updatedAt', direction: 'desc' },
      { take: pageSize ?? 25, skip: 0 }
    )

    return NextResponse.json({
      positions,
    })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
