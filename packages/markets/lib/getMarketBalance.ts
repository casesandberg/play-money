import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'

export async function getMarketBalance({
  marketId,
  excludeTransactionTypes,
}: {
  marketId: string
  excludeTransactionTypes?: Array<string>
}) {
  const ammAccount = await getAmmAccount({ marketId })
  const y = await getAccountBalance({
    accountId: ammAccount.id,
    currencyCode: 'YES',
    marketId,
    excludeTransactionTypes,
  })
  const n = await getAccountBalance({
    accountId: ammAccount.id,
    currencyCode: 'NO',
    marketId,
    excludeTransactionTypes,
  })

  return {
    YES: y.toNumber(),
    NO: n.toNumber(),
    probability: {
      YES: n.div(y.add(n)).toNumber(),
      NO: y.div(y.add(n)).toNumber(),
    },
  }
}
