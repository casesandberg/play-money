import { _MarketModel } from '@play-money/database'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { ServerErrorSchema, createSchema } from '@play-money/api-helpers'
import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import { z } from "zod"

export const dynamic = 'force-dynamic'

export const schema = createSchema({
    POST: {
        request: {
            params: _MarketModel.omit({ id: true, resolvedAt: true, createdAt: true, updatedAt: true, createdBy: true, slug: true }),
        },
        response: {
            200: _MarketModel,
            404: ServerErrorSchema,
            500: ServerErrorSchema,
        },
    },
})

export async function POST(
    _req: Request,
    { params }: { params: unknown }
): Promise<NextResponse<typeof schema.POST.response>> {
    try {
        const session = await auth()
    
        if (!session?.user?.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const market = params as z.infer<typeof _MarketModel>;
        market.createdBy = session.user.id;
        market.slug = market.question.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        
        const newMarket = await createMarket(market)
    
        return NextResponse.json(newMarket)
      } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create market' }, { status: 500 })
      }
}
