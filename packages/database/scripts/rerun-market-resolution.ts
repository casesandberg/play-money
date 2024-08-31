import { createMarketExcessLiquidityTransactions } from '@play-money/markets/lib/createMarketExcessLiquidityTransactions'
import { createMarketResolveLossTransactions } from '@play-money/markets/lib/createMarketResolveLossTransactions'
import { createMarketResolveWinTransactions } from '@play-money/markets/lib/createMarketResolveWinTransactions'
import { getMarket } from '@play-money/markets/lib/getMarket'
import db from '../prisma'

const marketId = 'cm0amvq8v001910v7iq2mvf4m'

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
        initiatorId: '',
        winningOptionId: resolution.id,
      })

      const winTransactions = await createMarketResolveWinTransactions({
        marketId,
        initiatorId: '',
        winningOptionId: resolution.id,
      })

      const liquidityTransactions = await createMarketExcessLiquidityTransactions({ marketId, initiatorId: '' })

      console.log(
        `Market ${marketId} resolution re-run. ${lossTransactions.flat().length} losses, ${winTransactions.length} wins. ${liquidityTransactions.length} liquidity accounts returned.`
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
