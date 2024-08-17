import Decimal from 'decimal.js'
import db, { MarketSchema, MarketOption, MarketOptionSchema } from '@play-money/database'
import { INITIAL_MARKET_LIQUIDITY_PRIMARY } from '@play-money/economy'
import { getAssetBalance } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/finance/lib/getUserPrimaryAccount'
import { createDailyMarketBonusTransaction } from '@play-money/quests/lib/createDailyMarketBonusTransaction'
import { hasCreatedMarketToday } from '@play-money/quests/lib/helpers'
import { createMarketLiquidityTransaction } from '@play-money/transactions/lib/createMarketLiquidityTransaction'
import { slugifyTitle } from './helpers'

type PartialOptions = Pick<MarketOption, 'name' | 'color'>

export async function createMarket({
  question,
  description,
  closeDate,
  createdBy,
  options,
  subsidyAmount = new Decimal(INITIAL_MARKET_LIQUIDITY_PRIMARY),
}: {
  question: string
  description: string
  closeDate: Date | null
  createdBy: string
  options?: Array<PartialOptions>
  subsidyAmount?: Decimal
}) {
  let slug = slugifyTitle(question)
  const marketData = MarketSchema.omit({ id: true }).parse({
    question,
    description,
    closeDate,
    resolvedAt: null,
    slug,
    updatedAt: new Date(),
    createdAt: new Date(),
    createdBy,
  })

  let parsedOptions: Array<PartialOptions>

  if (options && options.length > 2) {
    throw new Error('Only 2 options are currently supported')
  }

  if (options?.length) {
    parsedOptions = options.map((data) => MarketOptionSchema.pick({ name: true, color: true }).parse(data))
  } else {
    parsedOptions = [
      {
        name: 'Yes',
        color: '#3B82F6',
      },
      {
        name: 'No',
        color: '#EC4899',
      },
    ]
  }

  const userAccount = await getUserPrimaryAccount({ userId: marketData.createdBy })
  const userPrimaryBalance = await getAssetBalance({
    accountId: userAccount.id,
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
  })

  if (!userPrimaryBalance.amount.gte(subsidyAmount)) {
    throw new Error('User does not have enough balance to create market')
  }

  const createdMarket = await db.market.create({
    data: {
      ...marketData,
      options: {
        createMany: {
          data: parsedOptions.map((option, i) => ({
            name: option.name,
            currencyCode: i === 0 ? 'YES' : 'NO',
            color: option.color || (i === 0 ? '#3B82F6' : '#EC4899'),
            liquidityProbability: new Decimal(1).div(parsedOptions.length),
            updatedAt: new Date(),
            createdAt: new Date(),
          })),
        },
      },
      accounts: {
        create: {}, // Create AMM Account
      },
    },
    include: {
      options: true,
    },
  })

  await createMarketLiquidityTransaction({
    accountId: userAccount.id,
    amount: subsidyAmount,
    marketId: createdMarket.id,
  })

  if (!(await hasCreatedMarketToday({ userId: createdMarket.createdBy }))) {
    await createDailyMarketBonusTransaction({ accountId: userAccount.id, marketId: createdMarket.id })
  }

  return createdMarket
}
