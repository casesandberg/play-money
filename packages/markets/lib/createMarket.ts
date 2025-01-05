import { Prisma } from '@prisma/client'
import Decimal from 'decimal.js'
import db, { MarketSchema, MarketOption, MarketOptionSchema } from '@play-money/database'
import { INITIAL_MARKET_LIQUIDITY_PRIMARY } from '@play-money/finance/economy'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { createDailyMarketBonusTransaction } from '@play-money/quests/lib/createDailyMarketBonusTransaction'
import { hasCreatedMarketToday } from '@play-money/quests/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
import { getMarketTagsLLM } from './getMarketTagsLLM'
import { slugifyTitle } from './helpers'

type PartialOptions = Pick<MarketOption, 'name' | 'color'>

export async function createMarket({
  question,
  description,
  closeDate,
  createdBy,
  options,
  tags,
  subsidyAmount = new Decimal(INITIAL_MARKET_LIQUIDITY_PRIMARY),
  parentListId,
}: {
  question: string
  description: string
  closeDate: Date | null
  createdBy: string
  options?: Array<PartialOptions>
  tags?: Array<string>
  subsidyAmount?: Decimal
  parentListId?: string
}) {
  let slug = slugifyTitle(question)

  let parsedOptions: Array<PartialOptions>

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

  const userAccount = await getUserPrimaryAccount({ userId: createdBy })
  const userPrimaryBalance = await getBalance({
    accountId: userAccount.id,
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
  })

  if (!userPrimaryBalance.total.gte(subsidyAmount)) {
    throw new Error('User does not have enough balance to create market')
  }

  const generatedTags = tags ?? (await getMarketTagsLLM({ question }))

  const now = new Date()
  const createdMarket = await db.market.create({
    data: {
      question,
      description,
      closeDate,
      slug,
      tags: generatedTags.map((tag) => slugifyTitle(tag)),
      options: {
        createMany: {
          data: parsedOptions.map((option, i) => ({
            name: option.name,
            color: option.color || (i === 0 ? '#3B82F6' : '#EC4899'),
            liquidityProbability: new Decimal(1).div(parsedOptions.length),
            probability: new Decimal(1).div(parsedOptions.length).toNumber(),
            createdAt: new Date(now.getTime() + i), // Stagger createdAt so that they can be ordered by creation
          })),
        },
      },
      ...(parentListId
        ? {
            parentList: {
              connect: {
                id: parentListId,
              },
            } as unknown as undefined,
            lists: {
              create: {
                listId: parentListId,
              },
            },
          }
        : {}),

      commentCount: 0,
      liquidityCount: 0,
      uniquePromotersCount: 0,
      uniqueTradersCount: 0,

      // @case: Borked the TS for these relations during the financial rewrite, not sure how to fix.
      ammAccountId: undefined as unknown as string,
      ammAccount: {
        create: {
          type: 'MARKET_AMM' as const,
        },
      } as unknown as undefined,
      clearingAccountId: undefined as unknown as string,
      clearingAccount: {
        create: {
          type: 'MARKET_CLEARING' as const,
        },
      } as unknown as undefined,
      createdBy: undefined as unknown as string,
      user: {
        connect: {
          id: createdBy,
        },
      } as unknown as undefined,
    },
    include: {
      options: true,
    },
  })

  await Promise.all([
    db.account.update({
      where: {
        id: createdMarket.ammAccountId,
      },
      data: {
        marketId: createdMarket.id,
        updatedAt: new Date(),
      },
    }),
    db.account.update({
      where: {
        id: createdMarket.clearingAccountId,
      },
      data: {
        marketId: createdMarket.id,
        updatedAt: new Date(),
      },
    }),
  ])

  await createMarketLiquidityTransaction({
    type: 'LIQUIDITY_INITIALIZE',
    initiatorId: createdBy,
    accountId: userAccount.id,
    amount: subsidyAmount,
    marketId: createdMarket.id,
  })

  if (!(await hasCreatedMarketToday({ userId: createdMarket.createdBy }))) {
    await createDailyMarketBonusTransaction({
      accountId: userAccount.id,
      marketId: createdMarket.id,
      initiatorId: createdBy,
    })
  }

  return createdMarket
}
