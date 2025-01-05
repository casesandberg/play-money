import Decimal from 'decimal.js'
import _ from 'lodash'
import db, { Market } from '@play-money/database'
import { QuestionContributionPolicyType } from '@play-money/database/zod/inputTypeSchemas/QuestionContributionPolicySchema'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { getMarketTagsLLM } from '@play-money/markets/lib/getMarketTagsLLM'
import { slugifyTitle } from '@play-money/markets/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { calculateTotalCost } from './helpers'

const COLORS = [
  '#f44336',
  '#9c27b0',
  '#3f51b5',
  '#2196f3',
  '#009688',
  '#8bc34a',
  '#ffc107',
  '#ff9800',
  '#795548',
  '#607d8b',
]

export async function createList({
  title,
  description,
  tags,
  ownerId,
  closeDate,
  markets,
  contributionPolicy,
}: {
  title: string
  description?: string
  tags?: Array<string>
  ownerId: string
  closeDate: Date | null
  markets: Array<{ name: string; color?: string }>
  contributionPolicy: QuestionContributionPolicyType
}) {
  const slug = slugifyTitle(title)
  const totalCost = calculateTotalCost(markets.length)
  const costPerMarket = new Decimal(totalCost).div(markets.length)
  const SHUFFLED_COLORS = _.shuffle(COLORS)

  const userAccount = await getUserPrimaryAccount({ userId: ownerId })
  const userPrimaryBalance = await getBalance({
    accountId: userAccount.id,
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
  })

  if (!userPrimaryBalance.total.gte(totalCost)) {
    throw new Error('User does not have enough balance to create list')
  }

  const generatedTags = tags ?? (await getMarketTagsLLM({ question: title }))

  const list = await db.list.create({
    data: {
      title,
      description,
      ownerId,
      slug,
      tags: generatedTags.map((tag) => slugifyTitle(tag)),
      contributionPolicy,
    },
    include: {
      markets: {
        include: {
          market: true,
        },
      },
    },
  })

  const createdMarkets: Array<Market> = []
  for (const market of markets) {
    const createdMarket = await createMarket({
      parentListId: list.id,
      question: market.name,
      description: description ?? '',
      options: [
        {
          name: 'Yes',
          color: market.color ?? SHUFFLED_COLORS[createdMarkets.length % SHUFFLED_COLORS.length],
        },
        {
          name: 'No',
          color: '#EC4899',
        },
      ],
      closeDate,
      createdBy: ownerId,
      subsidyAmount: costPerMarket,
    })
    createdMarkets.push(createdMarket)
  }

  return db.list.findFirstOrThrow({
    where: {
      id: list.id,
    },
    include: {
      markets: {
        include: {
          market: true,
        },
      },
    },
  })
}
