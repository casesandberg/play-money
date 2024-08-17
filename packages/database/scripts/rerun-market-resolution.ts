import { createMarketResolveLossTransactions } from '@play-money/markets/lib/createMarketResolveLossTransactions'
import { createMarketResolveWinTransactions } from '@play-money/markets/lib/createMarketResolveWinTransactions'
import { getMarket } from '@play-money/markets/lib/getMarket'
import db from '../prisma'

const marketId = 'clyc6m3yr000gwrsrtrvkt9yj'

async function main() {
  try {
    const market = await getMarket({ id: marketId, extended: true })

    if ('marketResolution' in market) {
      const resolution = market.marketResolution?.resolution

      if (!resolution) {
        return
      }

      const nonWinningOptions = market.options.filter((o) => o.id !== resolution.id)

      const lossTransactions = await Promise.all(
        nonWinningOptions.map((option) => {
          return createMarketResolveLossTransactions({
            marketId,
            losingOptionId: option.id,
          })
        })
      )

      const winTransactions = await createMarketResolveWinTransactions({
        marketId,
        winningOptionId: resolution.id,
      })

      console.log(
        `Market ${marketId} resolution re-run. ${lossTransactions.flat().length} losses, ${winTransactions.length} wins.`
      )
      return
    }

    console.log('Market not resolved yet.')
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred while fetching users: ${error.message}`)
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
