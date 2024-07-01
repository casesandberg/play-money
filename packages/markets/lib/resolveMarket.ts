import db from '@play-money/database'
import { CurrencyCodeType } from '@play-money/database/zod/inputTypeSchemas/CurrencyCodeSchema'
import { createMarketResolveLossTransactions } from '@play-money/transactions/lib/createMarketResolveLossTransactions'
import { createMarketResolveWinTransactions } from '@play-money/transactions/lib/createMarketResolveWinTransactions'
import { getMarket } from './getMarket'
import { canResolveMarket } from './helpers'

function isPurchasableCurrency(currency: CurrencyCodeType): currency is 'YES' | 'NO' {
  return ['YES', 'NO'].includes(currency)
}

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

  const now = new Date()

  await db.marketResolution.upsert({
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

  await db.market.update({
    where: { id: marketId },
    data: { resolvedAt: now, closeDate: now },
  })

  await createMarketResolveLossTransactions({
    marketId,
    losingCurrencyCode: marketOption.currencyCode === 'YES' ? 'NO' : 'YES',
  })

  await createMarketResolveWinTransactions({
    marketId,
    winningCurrencyCode: marketOption.currencyCode,
  })
}
