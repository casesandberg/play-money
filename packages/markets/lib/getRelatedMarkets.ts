import { getMarket } from './getMarket'
import { getMarkets } from './getMarkets'

export async function getRelatedMarkets({ marketId }: { marketId: string }): Promise<Array<any>> {
  const market = await getMarket({ id: marketId })

  const relatedMarkets = await getMarkets({
    tags: market.tags,
    status: 'active',
  })

  const rankedMarkets = relatedMarkets.markets
    .filter((relatedMarket) => relatedMarket.id !== marketId)
    .map((relatedMarket) => {
      const sharedTagsCount = relatedMarket.tags.filter((tag) => market.tags.includes(tag)).length
      return {
        ...relatedMarket,
        sharedTagsCount,
      }
    })
    .sort((a, b) => b.sharedTagsCount - a.sharedTagsCount)

  return rankedMarkets.slice(0, 5)
}
