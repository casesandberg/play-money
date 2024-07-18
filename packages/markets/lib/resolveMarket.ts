import db from '@play-money/database'
import { createNotification } from '@play-money/notifications/lib/createNotification'
import { createMarketExcessLiquidityTransactions } from '@play-money/transactions/lib/createMarketExcessLiquidityTransactions'
import { createMarketResolveLossTransactions } from '@play-money/transactions/lib/createMarketResolveLossTransactions'
import { createMarketResolveWinTransactions } from '@play-money/transactions/lib/createMarketResolveWinTransactions'
import { getUniqueTraderIds } from '@play-money/transactions/lib/getUniqueTraderIds'
import { getUserById } from '@play-money/users/lib/getUserById'
import { getMarket } from './getMarket'
import { canResolveMarket, isPurchasableCurrency } from './helpers'

export async function resolveMarket({
  resolverId,
  marketId,
  optionId,
  supportingLink,
}: {
  resolverId: string
  marketId: string
  optionId: string
  supportingLink?: string
}) {
  const market = await getMarket({ id: marketId })

  if (market.resolvedAt) {
    throw new Error('Market already resolved')
  }

  if (!canResolveMarket({ market, userId: resolverId })) {
    throw new Error('User cannot resolve market')
  }

  const marketOption = await db.marketOption.findFirst({
    where: { id: optionId, marketId },
  })

  if (!marketOption) {
    throw new Error('Invalid optionId')
  }

  if (!isPurchasableCurrency(marketOption.currencyCode)) {
    throw new Error('Invalid option currency code')
  }

  await db.$transaction(async (tx) => {
    const now = new Date()

    await tx.marketResolution.upsert({
      where: { marketId },
      create: {
        marketId,
        resolutionId: optionId,
        supportingLink,
        resolvedById: resolverId,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        resolutionId: optionId,
        supportingLink,
        resolvedById: resolverId,
        updatedAt: now,
      },
    })

    await tx.market.update({
      where: { id: marketId },
      data: { resolvedAt: now, closeDate: now },
    })
  })

  await createMarketResolveLossTransactions({
    marketId,
    losingCurrencyCode: marketOption.currencyCode === 'YES' ? 'NO' : 'YES',
  })

  await createMarketResolveWinTransactions({
    marketId,
    winningCurrencyCode: marketOption.currencyCode,
  })

  await createMarketExcessLiquidityTransactions({ marketId })

  const user = await getUserById({ id: resolverId })
  const recipientIds = await getUniqueTraderIds(marketId, [user.id])

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        type: 'MARKET_RESOLVED',
        actorId: resolverId,
        marketId: market.id,
        marketOptionId: marketOption.id,
        groupKey: market.id,
        userId: recipientId,
        actionUrl: `/questions/${market.id}/${market.slug}`,
      })
    )
  )
}
