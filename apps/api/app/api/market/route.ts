import { createMarket } from '@play-money/markets/lib/createMarket'
import { NextResponse } from 'next/server'
import { auth } from '@play-money/auth'
import type { z } from "zod"
import schema from './schema'

export const dynamic = 'force-dynamic'

export async function POST(
    req: Request,
): Promise<NextResponse<typeof schema.POST.response>> {
    try {
        const session = await auth();
    
        if (!session?.user?.id) {
          return NextResponse.json({ error: 'You must be signed in to create a market' }, { status: 401 })
        }

        const body = (await req.json()) as unknown
        body.closeDate = new Date(body.closeDate)
        const market = schema.POST.request.body.parse(body) as z.infer<typeof _MarketModel>
        console.log(market)
        market.closeDate = new Date(market.closeDate)
        market.createdBy = "clwc79lcj00004edlolie4q3x";// session.user.id; // TODO: fix auth and add this back in
        market.slug = slugify(market.question)
        
        const newMarket = await createMarket(market)
    
        return NextResponse.json(newMarket)
      } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create market' }, { status: 500 })
      }
}

function slugify(title, maxLen = 50) {
    // Based on django's slugify:
    // https://github.com/django/django/blob/a21a63cc288ba51bcf8c227a49de6f5bb9a72cc3/django/utils/text.py#L362
    let slug = title
        .normalize("NFKD") // Normalize to decomposed form (eg. é -> e)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove non-word characters
        .trim()
        .replace(/[\s]/g, "-") // Replace whitespace with a dash
        .replace(/-+/, "-") // Replace multiple dashes with a single dash
    
    if (slug.length > maxLen) {
        slug = slug
            .substring(0, maxLen)
            .replace(/-+[^-]*?$/, "") // Remove the last word, since it might be cut off
    }

    return slug
}