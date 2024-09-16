import Decimal from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { quote } from '@play-money/finance/amms/maniswap-v1.1'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { BalanceChange, calculateRealizedGainsTax, findBalanceChange } from '@play-money/finance/lib/helpers'
import { getMarketAmmAccount } from './getMarketAmmAccount'

export async function updateMarketPositionValues({
  tx,
  balanceChanges,
  marketId,
}: {
  tx: TransactionClient
  balanceChanges: Array<BalanceChange>
  marketId: string
}) {
  const ammAccount = await getMarketAmmAccount({ marketId })
  const ammBalances = await getMarketBalances({ accountId: ammAccount.id, marketId })

  const ammAssetBalances = ammBalances.filter(({ assetType }) => assetType === 'MARKET_OPTION')

  const marketOptionPositions = await tx.marketOptionPosition.findMany({ where: { marketId } })
  const updatedMarketOptionBalances = ammAssetBalances.map((balance) => {
    const change =
      findBalanceChange({
        balanceChanges,
        accountId: balance.accountId,
        assetType: balance.assetType,
        assetId: balance.assetId,
      })?.change || 0

    return { ...balance, amount: balance.total.add(change) }
  })

  await Promise.all(
    marketOptionPositions.map(async (position) => {
      const optionBalance = updatedMarketOptionBalances.find((b) => b.assetId === position.optionId)
      if (!optionBalance) return position

      const newValue = await quote({
        amount: position.quantity,
        probability: new Decimal(0.01),
        targetShare: optionBalance.amount,
        shares: updatedMarketOptionBalances.map((balance) => balance.amount),
      })

      if (position.value.toDecimalPlaces(4).equals(newValue.shares.toDecimalPlaces(4))) {
        return
      }

      const tax = calculateRealizedGainsTax({ cost: position.cost, salePrice: newValue.shares })

      return tx.marketOptionPosition.update({
        where: { id: position.id },
        data: {
          value: new Decimal(newValue.shares).sub(tax),
          updatedAt: new Date(),
        },
      })
    })
  )
}
