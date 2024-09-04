import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { updateMarketOptionProbabilities } from '@play-money/markets/lib/updateMarketOptionProbabilities'
import db from '../prisma'

async function main() {
  try {
    const markets = await db.market.findMany({
      where: {
        options: {
          some: {
            probability: null,
          },
        },
      },
    })

    console.log(`Found ${markets.length} markets without probabilities.`)

    for await (const market of markets) {
      try {
        const balances = await getMarketBalances({ marketId: market.id, accountId: market.ammAccountId })

        await db.$transaction(async (tx) => {
          await updateMarketOptionProbabilities({ tx, balances })
        })
        console.log(`Successfully added probabilities to market with id: ${market.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to add probabilities to id: ${market.id}. Error: ${error.message}`)
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
