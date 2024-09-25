'use client'

import _ from 'lodash'
import Link from 'next/link'
import { useMarketRelated } from '@play-money/api-helpers/client/hooks'
import { MarketProbabilityDetail } from './MarketProbabilityDetail'

export function RelatedMarkets({ marketId, listId }: { marketId?: string; listId?: string }) {
  const { data } = useMarketRelated({ marketId })

  return data?.markets.length ? (
    <div>
      <div className="pb-2 text-xs font-semibold uppercase text-muted-foreground">Related Markets</div>
      <ul className="divide-y divide-muted text-sm">
        {data.markets.map((market) => {
          return (
            <li className="py-2" key={market.id}>
              <Link className="visited:text-muted-foreground" href={`/questions/${market.id}/${market.slug}`}>
                <div>
                  <div className="line-clamp-2 hover:underline">{market.question}</div>
                  <MarketProbabilityDetail options={market.options} size="sm" />
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  ) : null
}
