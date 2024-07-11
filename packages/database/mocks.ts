import { faker } from '@faker-js/faker'
import cuid from 'cuid'
import Decimal from 'decimal.js'
import _ from 'lodash'
import { ExtendedMarket } from '@play-money/markets/components/MarketOverviewPage'
import type { TransactionWithItems } from '@play-money/transactions/lib/getTransactions'
import { Market, User, Account, TransactionItem, Currency, MarketOption, Comment, Transaction } from './zod'

export function mockUser(overrides?: Partial<User>): User {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: cuid(),
    username: faker.internet.userName({ firstName, lastName }),
    displayName: faker.person.fullName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    avatarUrl: faker.helpers.maybe(faker.image.avatar) ?? null,
    bio: faker.helpers.maybe(faker.person.bio) ?? null,
    twitterHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }) ?? null,
    discordHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }) ?? null,
    website: faker.helpers.maybe(faker.internet.domainName, { probability: 0.3 }) ?? null,
    emailVerified: faker.date.past(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function mockMarket(overrides?: Partial<Market>): Market {
  const question = faker.lorem.sentence()
  const description = faker.lorem.paragraph()
  const closeDate = faker.date.future()
  return {
    id: faker.string.uuid(),
    question,
    description,
    slug: faker.helpers.slugify(question),
    closeDate,
    resolvedAt: faker.helpers.maybe(faker.date.past, { probability: 0.3 }) ?? null,
    createdBy: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function mockExtendedMarket(overrides?: Partial<ExtendedMarket>): ExtendedMarket {
  const user = mockUser()
  const market = mockMarket({
    createdBy: user.id,
  })

  return {
    ...market,
    options: [
      { ...mockMarketOption({ id: '1', name: 'Yes', marketId: market.id }), color: 'green' },
      { ...mockMarketOption({ id: '2', name: 'No', marketId: market.id }), color: 'red' },
    ],
    user,
    ...overrides,
  }
}

export function mockAccount(overrides?: Partial<Account>): Account {
  return {
    id: faker.string.uuid(),
    userId: null,
    marketId: null,
    internalType: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function mockCurrency(overrides?: Partial<Currency>): Currency {
  return {
    id: faker.string.uuid(),
    symbol: faker.finance.currencySymbol(),
    code: faker.helpers.arrayElement(['YES', 'NO']),
    name: faker.finance.currencyName(),
    imageUrl: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function mockTransactionItem(overrides?: Partial<TransactionItem>): TransactionItem {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.past(),
    currencyCode: faker.helpers.arrayElement(['YES', 'NO', 'PRIMARY']),
    accountId: faker.string.uuid(),
    transactionId: faker.string.uuid(),
    amount: new Decimal(faker.finance.amount()),
    ...overrides,
  }
}

export function mockTransactionWithItems(overrides?: Partial<TransactionWithItems>): TransactionWithItems {
  const transactionId = faker.string.uuid()
  const market = mockMarket()
  const creatorId = faker.string.uuid()
  const user = mockUser()

  return {
    id: transactionId,
    type: faker.helpers.arrayElement(['MARKET_BUY', 'MARKET_SELL']),
    description: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    creatorId,
    marketId: market.id,
    transactionItems: _.times(faker.datatype.number({ min: 1, max: 5 }), () => mockTransactionItem({ transactionId })),
    market,
    creator: {
      user,
    },
    ...overrides,
  }
}

export function mockMarketOption(overrides?: Partial<MarketOption>): MarketOption {
  const currencyCode = faker.helpers.arrayElement(['YES', 'NO']) as Currency['code']
  return {
    id: faker.string.uuid(),
    name: currencyCode === 'YES' ? 'Yes' : 'No',
    currencyCode,
    color: currencyCode === 'YES' ? '#3B82F6' : '#EC4899',
    liquidityProbability: new Decimal(0.5),
    marketId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...overrides,
  }
}

export function mockComment(overrides?: Partial<Comment>): Comment {
  return {
    id: faker.string.uuid(),
    entityType: 'MARKET',
    entityId: faker.string.uuid(),
    content: `<p>${faker.lorem.paragraph()}</p>`,
    edited: false,
    authorId: faker.string.uuid(),
    parentId: null,
    hidden: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...overrides,
  }
}
