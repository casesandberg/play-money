import Decimal from 'decimal.js'
import db, { User } from '@play-money/database'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { getUserById } from '@play-money/users/lib/getUserById'

export async function createReferralBonusTransactions({
  user,
  initiatorId,
  marketId,
  payout,
}: {
  user: User
  initiatorId: string
  marketId?: string
  payout: Decimal
}) {
  const referringUser = user.referredBy ? await getUserById({ id: user.referredBy }) : null
  const houseAccount = await getHouseAccount()

  if (referringUser) {
    const transaction = await executeTransaction({
      type: 'REFERRER_BONUS',
      initiatorId,
      entries: [
        {
          amount: payout,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
          fromAccountId: houseAccount.id,
          toAccountId: referringUser.primaryAccountId,
        },
      ],
      marketId,
    })

    await executeTransaction({
      type: 'REFERREE_BONUS',
      initiatorId,
      entries: [
        {
          amount: payout,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
          fromAccountId: houseAccount.id,
          toAccountId: user.primaryAccountId,
        },
      ],
      marketId,
    })

    await createNotification({
      type: 'REFERRER_BONUS',
      actorId: initiatorId,
      marketId,
      transactionId: transaction.id,
      groupKey: 'REFERRER_BONUS',
      userId: referringUser.id,
      actionUrl: `/settings/referrals`,
    })
  }
}
