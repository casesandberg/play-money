import Decimal from 'decimal.js'
import db, { Market } from '@play-money/database'
import { QuestionContributionPolicyType } from '@play-money/database/zod/inputTypeSchemas/QuestionContributionPolicySchema'
import { getBalance } from '@play-money/finance/lib/getBalances'
import { createMarket } from '@play-money/markets/lib/createMarket'
import { slugifyTitle } from '@play-money/markets/lib/helpers'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { calculateTotalCost } from './helpers'

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

  const userAccount = await getUserPrimaryAccount({ userId: ownerId })
  const userPrimaryBalance = await getBalance({
    accountId: userAccount.id,
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
  })

  if (!userPrimaryBalance.total.gte(totalCost)) {
    throw new Error('User does not have enough balance to create list')
  }

  const list = await db.list.create({
    data: {
      title,
      description,
      ownerId,
      slug,
      tags: tags?.map((tag) => slugifyTitle(tag)),
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
          color: market.color ?? '#3B82F6',
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
