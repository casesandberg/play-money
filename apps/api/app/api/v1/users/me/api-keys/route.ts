import { generateMnemonic } from 'bip39'
import { NextResponse } from 'next/server'
import { SchemaResponse } from '@play-money/api-helpers'
import { auth } from '@play-money/auth'
import db from '@play-money/database'
import schema from './schema'

export async function POST(req: Request): Promise<SchemaResponse<typeof schema.post.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as unknown
    const { name } = schema.post.requestBody.parse(body)

    const key = generateMnemonic(128)

    const apiKey = await db.apiKey.create({
      data: {
        name,
        key: key.replace(/\s+/g, '-'),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ data: apiKey })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}

export async function GET(): Promise<SchemaResponse<typeof schema.get.responses>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const keys = await db.apiKey.findMany({
      where: {
        userId: session.user.id,
        isRevoked: false,
      },
    })

    return NextResponse.json({ data: keys })
  } catch (error) {
    console.log(error) // eslint-disable-line no-console -- Log error for debugging

    return NextResponse.json({ error: 'Error processing request' }, { status: 500 })
  }
}
