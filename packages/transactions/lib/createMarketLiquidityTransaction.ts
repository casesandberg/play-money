import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { addLiquidity } from '@play-money/amms/lib/maniswap-v1'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { createTransaction } from './createTransaction'
import { convertPrimaryToMarketShares } from './exchanger'

interface MarketLiquidityTransactionInput {
  userId: string
  amount: Decimal // in dollars
  marketId: string
}

export async function createMarketLiquidityTransaction({ userId, marketId, amount }: MarketLiquidityTransactionInput) {
  const userAccount = await getUserAccount({ id: userId })
  const ammAccount = await getAmmAccount({ marketId })
  const market = await getMarket({ id: marketId, extended: true })

  const exchangerTransactions = await convertPrimaryToMarketShares({
    fromAccountId: userAccount.id,
    amount,
  })

  const ammTransactions = await addLiquidity({
    fromAccountId: userAccount.id,
    ammAccountId: ammAccount.id,
    amount,
    options: market.options,
  })

  const transaction = await createTransaction({
    creatorId: userAccount.id,
    type: 'MARKET_LIQUIDITY',
    description: `Add ${amount} dollars worth of shares in market ${marketId}`,
    marketId,
    transactionItems: [...exchangerTransactions, ...ammTransactions],
  })

  return transaction
}
