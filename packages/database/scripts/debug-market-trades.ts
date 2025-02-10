import { Decimal } from 'decimal.js'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getUniqueTraderIds } from '@play-money/markets/lib/getUniqueTraderIds'
import { getUserById } from '@play-money/users/lib/getUserById'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import db from '../prisma'

const marketId = 'cm5od3mim075xt20i1ummyi2u'

async function main() {
  try {
    const market = await getMarket({ id: marketId, extended: true })

    console.log(market.question)

    const uniqueTraders = await getUniqueTraderIds(marketId)

    for (const traderId of uniqueTraders) {
      const user = await getUserById({ id: traderId })
      const userAccount = await getUserPrimaryAccount({ userId: traderId })

      const marketBalances = await getMarketBalances({ accountId: userAccount.id, marketId })

      console.log(user.username)

      market.options.map((option) => {
        const optionBalance = marketBalances.find(({ assetId }) => assetId === option.id)

        if (optionBalance) {
          const cashedOut = new Decimal(optionBalance.subtotals.TRADE_SELL ?? 0)
            .plus(optionBalance.subtotals.TRADE_WIN ?? 0)
            .abs()
            .toDecimalPlaces(2)
          console.log(
            `· Option: ${option.name}, Pending Balance: ${optionBalance.total.toDecimalPlaces(2)}, Cashed Out: ${cashedOut}`
          )
          console.log(`\x1b[2m  ${JSON.stringify(optionBalance.subtotals)}\x1b[0m`)
        }
      })
    }
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
