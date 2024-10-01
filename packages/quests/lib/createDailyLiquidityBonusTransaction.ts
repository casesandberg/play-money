import Decimal from 'decimal.js'
import db from '@play-money/database'
import { DAILY_LIQUIDITY_BONUS_PRIMARY } from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createReferralBonusTransactions } from '@play-money/referrals/lib/createReferralBonusTransactions'
import { isNewlyReferredUser } from '@play-money/referrals/lib/helpers'

export async function createDailyLiquidityBonusTransaction({
  accountId,
  initiatorId,
  marketId,
}: {
  accountId: string
  initiatorId: string
  marketId: string
}) {
  const [houseAccount, user] = await Promise.all([
    getHouseAccount(),
    db.user.findFirstOrThrow({
      where: {
        primaryAccountId: accountId,
      },
    }),
  ])
  const payout = new Decimal(DAILY_LIQUIDITY_BONUS_PRIMARY)

  const entries = [
    {
      amount: payout,
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      fromAccountId: houseAccount.id,
      toAccountId: accountId,
    } as const,
  ]

  const transaction = await executeTransaction({
    type: 'DAILY_LIQUIDITY_BONUS',
    initiatorId,
    entries,
    marketId,
  })

  if (isNewlyReferredUser(user)) {
    await createReferralBonusTransactions({
      user,
      initiatorId,
      marketId,
      payout,
    })
  }

  return transaction
}
