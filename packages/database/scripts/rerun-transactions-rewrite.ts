import Decimal from 'decimal.js'
import { createHouseSingupBonusTransaction } from '@play-money/finance/lib/createHouseSingupBonusTransaction'
import { createMarketLiquidityTransaction } from '@play-money/markets/lib/createMarketLiquidityTransaction'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import db from '../prisma'

async function main() {
  try {
    console.log('Starting...')
    const usersWithoutBonus = await db.user.findMany({
      where: {
        primaryAccount: {
          toEntries: {
            none: {
              transaction: {
                type: 'HOUSE_SIGNUP_BONUS',
              },
            },
          },
        },
      },
      include: {
        primaryAccount: true,
      },
    })

    console.log(`Found ${usersWithoutBonus.length} users without signup bonuses.`)

    for (const user of usersWithoutBonus) {
      try {
        await createHouseSingupBonusTransaction({ userId: user.id })

        console.log(`Created signup bonus transaction for user ${user.id}`)
      } catch (error) {
        console.error(`Failed to create signup bonus for user ${user.id}:`, error)
      }
    }

    const marketsWithoutLiquidity = await db.market.findMany({
      where: {
        transactions: {
          none: {
            type: 'LIQUIDITY_INITIALIZE',
          },
        },
        marketResolution: null,
      },
    })

    console.log(`Found ${marketsWithoutLiquidity.length} markets without liquidity.`)

    for (const market of marketsWithoutLiquidity) {
      try {
        const userAccount = await getUserPrimaryAccount({ userId: market.createdBy })
        await createMarketLiquidityTransaction({
          type: 'LIQUIDITY_INITIALIZE',
          initiatorId: market.createdBy,
          accountId: userAccount.id,
          amount: new Decimal(1000),
          marketId: market.id,
        })

        console.log(`Added liquidity to ${market.id}`)
      } catch (error) {
        console.error(`Failed adding liquidity to ${market.id}:`, error)
      }
    }

    console.log('Done setting up transactions rewrite')
  } catch (fetchError) {
    const error = fetchError as Error
    console.error(`An error occurred: ${error.message}`)
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
