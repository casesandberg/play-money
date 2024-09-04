import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { updateMarketOptionProbabilities } from '@play-money/markets/lib/updateMarketOptionProbabilities'
import db from '../prisma'

async function main() {
  try {
    const marketsWithoutProbabilities = await db.market.findMany({
      where: {
        options: {
          some: {
            probability: null,
          },
        },
      },
    })

    console.log(`Found ${marketsWithoutProbabilities.length} markets without probabilities.`)

    for await (const market of marketsWithoutProbabilities) {
      try {
        const balances = await getMarketBalances({ marketId: market.id, accountId: market.ammAccountId })

        await db.$transaction(async (tx) => {
          await updateMarketOptionProbabilities({ tx, balances, marketId: market.id })
        })
        console.log(`Successfully added probabilities to market with id: ${market.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to add probabilities to id: ${market.id}. Error: ${error.message}`)
      }
    }

    const marketsWithoutLiquidity = await db.market.findMany({
      where: {
        liquidityCount: null,
      },
    })

    console.log(`Found ${marketsWithoutLiquidity.length} markets without liquidity count.`)

    for await (const market of marketsWithoutLiquidity) {
      try {
        const data = await db.transactionEntry.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            toAccountId: market.clearingAccountId,
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            transaction: {
              marketId: market.id,
            },
          },
        })

        await db.market.update({
          where: {
            id: market.id,
          },
          data: {
            liquidityCount: data._sum.amount,
          },
        })
        console.log(`Successfully added liquidity count to market with id: ${market.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to add liquidity count to id: ${market.id}. Error: ${error.message}`)
      }
    }

    const marketsWithoutUniqueTraders = await db.market.findMany({
      where: {
        uniqueTradersCount: null,
      },
    })

    console.log(`Found ${marketsWithoutUniqueTraders.length} markets without unique traders count.`)

    for await (const market of marketsWithoutUniqueTraders) {
      try {
        const data = await db.transaction.groupBy({
          by: ['initiatorId'],
          where: {
            marketId: market.id,
            type: 'TRADE_BUY',
          },
          _count: true,
        })

        await db.market.update({
          where: {
            id: market.id,
          },
          data: {
            uniqueTradersCount: data.length,
          },
        })
        console.log(`Successfully added unique traders count to market with id: ${market.id}`)
      } catch (updateError) {
        const error = updateError as Error
        console.error(`Failed to add unique traders count to id: ${market.id}. Error: ${error.message}`)
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
