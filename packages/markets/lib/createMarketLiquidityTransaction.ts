import Decimal from 'decimal.js'
import { addLiquidity } from '@play-money/finance/amms/maniswap-v1.1'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'
import { updateMarketBalances } from './updateMarketBalances'
import { updateMarketOptionProbabilities } from './updateMarketOptionProbabilities'

export async function createMarketLiquidityTransaction({
  type = 'LIQUIDITY_DEPOSIT',
  initiatorId,
  accountId,
  marketId,
  amount,
}: {
  type?: 'LIQUIDITY_DEPOSIT' | 'LIQUIDITY_INITIALIZE'
  initiatorId?: string
  accountId: string
  amount: Decimal // in dollars
  marketId: string
}) {
  const [ammAccount, clearingAccount, market] = await Promise.all([
    getMarketAmmAccount({ marketId }),
    getMarketClearingAccount({ marketId }),
    getMarket({ id: marketId, extended: true }),
  ])

  const ammBalances = await getMarketBalances({ accountId: ammAccount.id, marketId })
  const ammOptionBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')

  // TODO
  const liquidityAdditions = await addLiquidity({
    amount,
    options: market.options.map((option) => {
      const optionBalance = ammOptionBalances.find(({ assetId }) => assetId === option.id)

      return {
        ...option,
        shares: optionBalance?.total || new Decimal(0),
      }
    }),
  })

  const entries = [
    {
      amount: amount,
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      fromAccountId: accountId,
      toAccountId: clearingAccount.id,
    } as const,
    ...market.options.map((option) => {
      return {
        amount: amount,
        assetType: 'MARKET_OPTION',
        assetId: option.id,
        fromAccountId: clearingAccount.id,
        toAccountId: ammAccount.id,
      } as const
    }),
  ]

  const transaction = await executeTransaction({
    type,
    initiatorId,
    entries,
    marketId,
    additionalLogic: async (txParams) => {
      txParams.tx.market.update({
        where: {
          id: marketId,
        },
        data: {
          liquidityCount: {
            increment: amount.toNumber(),
          },
        },
      })
      const balances = await updateMarketBalances({ ...txParams, marketId })
      await updateMarketOptionProbabilities({ ...txParams, balances, marketId })
    },
  })

  return transaction
}
