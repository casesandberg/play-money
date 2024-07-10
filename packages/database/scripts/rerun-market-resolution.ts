import { getMarket } from '@play-money/markets/lib/getMarket'
import { createMarketResolveLossTransactions } from '@play-money/transactions/lib/createMarketResolveLossTransactions'
import { createMarketResolveWinTransactions } from '@play-money/transactions/lib/createMarketResolveWinTransactions'
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

      const lossTransactions = await createMarketResolveLossTransactions({
        marketId,
        losingCurrencyCode: resolution.currencyCode === 'YES' ? 'NO' : 'YES',
      })

      const winTransactions = await createMarketResolveWinTransactions({
        marketId,
        winningCurrencyCode: resolution.currencyCode as 'YES' | 'NO',
      })

      console.log(
        `Market ${marketId} resolution re-run. ${lossTransactions.length} losses, ${winTransactions.length} wins.`
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
