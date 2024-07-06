import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'

export async function getUserBalanceInMarket({ userId, marketId }: { userId: string; marketId: string }) {
  const userAccount = await getUserAccount({ id: userId })
  const yes = await getAccountBalance({ accountId: userAccount.id, currencyCode: 'YES', marketId })
  const no = await getAccountBalance({ accountId: userAccount.id, currencyCode: 'NO', marketId })

  return {
    YES: yes.toNumber(),
    NO: no.toNumber(),
  }
}
