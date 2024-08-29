import { updateMarket } from '@play-money/markets/lib/updateMarket'
import db from '../prisma'

async function main() {
  try {
    const markets = await db.market.findMany({})

    const filteredMarkets = markets.filter((market) => {
      return market.tags.length === 0
    })

    console.log(`Found ${filteredMarkets.length} markets without tags.`)

    for await (const market of filteredMarkets) {
      try {
        const tags: Array<string> = [] // await getMarketTagsLLM({ question: market.question })

        await updateMarket({ id: market.id, tags })
        console.log(`Successfully added tags to market with id: ${market.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to add tags to id: ${market.id}. Error: ${error.message}`)
      }
    }
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred while fetching markets: ${error.message}`)
  } finally {
    await db.$disconnect()
    console.log('Database connection closed.')
  }
}

main().catch((e) => {
  const error = e as Error
  console.error(`Unexpected error: ${error.message}`)
  process.exit(1)
})
