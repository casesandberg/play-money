import { faker } from '@faker-js/faker'
import cuid from 'cuid'
import Decimal from 'decimal.js'
import _ from 'lodash'
import { NetBalance } from '@play-money/finance/lib/getBalances'
import { TransactionWithEntries } from '@play-money/finance/types'
import { ExtendedMarket } from '@play-money/markets/types'
import {
  Market,
  User,
  Account,
  MarketOption,
  Comment,
  MarketResolution,
  Notification,
  TransactionEntry,
  MarketOptionPosition,
} from './zod'

// Monkey patch for es2022
declare namespace Intl {
  type Key = 'calendar' | 'collation' | 'currency' | 'numberingSystem' | 'timeZone' | 'unit'

  function supportedValuesOf(input: Key): string[]

  type DateTimeFormatOptions = {
    timeZone: string
    timeZoneName: string
  }
  class DateTimeFormat {
    constructor(locale: string, options: DateTimeFormatOptions)
    format(date: Date): string
  }
}

export function mockUser(overrides?: Partial<User>): User {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: cuid(),
    username: faker.internet.userName({ firstName, lastName }),
    displayName: faker.person.fullName({ firstName, lastName }),
    avatarUrl: faker.helpers.maybe(faker.image.avatar) ?? null,
    bio: faker.helpers.maybe(faker.person.bio) ?? null,
    twitterHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }) ?? null,
    discordHandle: faker.helpers.maybe(faker.internet.userName, { probability: 0.3 }) ?? null,
    website: faker.helpers.maybe(faker.internet.domainName, { probability: 0.3 }) ?? null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    primaryAccountId: faker.string.uuid(),
    referralCode: faker.string.uuid(),
    referredBy: null,
    role: 'USER',
    timezone: faker.helpers.arrayElement(Intl.supportedValuesOf('timeZone')),
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
    tags: [faker.word.noun(), faker.word.noun(), faker.word.noun(), faker.word.noun(), faker.word.noun()],
    ammAccountId: faker.string.uuid(),
    clearingAccountId: faker.string.uuid(),
    resolvedAt: faker.helpers.maybe(faker.date.past, { probability: 0.2 }) ?? null,
    createdBy: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    parentListId: faker.string.uuid(),
    liquidityCount: parseInt(faker.string.numeric({ length: { min: 4, max: 5 } })),
    commentCount: parseInt(faker.string.numeric({ length: { min: 0, max: 1 } })),
    uniqueTradersCount: parseInt(faker.string.numeric({ length: { min: 0, max: 1 } })),
    uniquePromotersCount: parseInt(faker.string.numeric({ length: { min: 0, max: 1 } })),
    ...overrides,
  }
}

export function mockExtendedMarket(overrides?: Partial<ExtendedMarket>): ExtendedMarket {
  const user = mockUser()
  const market = mockMarket({
    createdBy: user.id,
  })

  const yesOption = mockMarketOption({ id: '1', name: 'Yes', marketId: market.id, probability: 0.65 })
  const noOption = mockMarketOption({ id: '2', name: 'No', marketId: market.id, probability: 0.35 })

  return {
    ...market,
    options: [yesOption, noOption],
    user,
    marketResolution: market.resolvedAt
      ? {
          ...mockMarketResolution(),
          resolution: faker.helpers.arrayElement([yesOption, noOption]),
          resolvedBy: user,
        }
      : undefined,
    ...overrides,
  }
}

export function mockMarketResolution(overrides?: Partial<MarketResolution>): MarketResolution {
  return {
    id: faker.string.uuid(),
    marketId: faker.string.uuid(),
    resolvedById: faker.string.uuid(),
    resolutionId: faker.string.uuid(),
    supportingLink: faker.internet.url(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function mockAccount(overrides?: Partial<Account>): Account {
  return {
    id: faker.string.uuid(),
    type: 'USER',
    userId: null,
    marketId: null,
    internalType: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}

export function mockTransactionEntry(overrides?: Partial<TransactionEntry>): TransactionEntry {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.past(),
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
    fromAccountId: faker.string.uuid(),
    toAccountId: faker.string.uuid(),
    transactionId: faker.string.uuid(),
    amount: new Decimal(faker.finance.amount()),
    ...overrides,
  }
}

export function mockTransactionWithEntries(overrides?: Partial<TransactionWithEntries>): TransactionWithEntries {
  const transactionId = faker.string.uuid()
  const market = mockMarket()
  const initiatorId = faker.string.uuid()
  const user = mockUser()

  return {
    id: transactionId,
    type: faker.helpers.arrayElement(['TRADE_BUY', 'TRADE_SELL']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    initiatorId,
    marketId: market.id,
    entries: _.times(faker.number.int({ min: 1, max: 5 }), () => mockTransactionEntry({ transactionId })),
    options: [],
    batchId: null,
    market,
    initiator: user,
    ...overrides,
  }
}

export function mockMarketOption(overrides?: Partial<MarketOption>): MarketOption {
  return {
    id: faker.string.uuid(),
    name: 'Yes',
    color: '#3B82F6',
    liquidityProbability: new Decimal(0.5),
    marketId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    probability: 50,
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

type ExtendedNotification = Notification & { actor: User; recipient: User; market: Market; comment: Comment }
export function mockNotification(overrides?: Partial<Notification>): ExtendedNotification {
  return {
    id: faker.string.uuid(),
    recipientId: faker.string.uuid(),
    recipient: mockUser(),
    actorId: faker.string.uuid(),
    actor: mockUser(),
    type: faker.helpers.arrayElement(['MARKET_COMMENT']),
    marketId: faker.string.uuid(),
    market: mockMarket(),
    commentId: faker.string.uuid(),
    comment: mockComment(),
    listId: faker.string.uuid(),
    transactionId: faker.string.uuid(),
    marketOptionId: faker.string.uuid(),
    marketResolutionId: faker.string.uuid(),
    parentCommentId: faker.string.uuid(),
    commentReactionId: faker.string.uuid(),
    content: null,
    actionUrl: '/market/1',
    readAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...overrides,
  }
}

export function mockBalance(overrides?: Partial<NetBalance>): NetBalance {
  return {
    id: faker.string.uuid(),
    accountId: faker.string.uuid(),
    assetType: 'CURRENCY',
    assetId: 'PRIMARY',
    total: new Decimal(50),
    subtotals: {},
    marketId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...overrides,
  }
}

export function mockMarketOptionPosition(overrides?: Partial<MarketOptionPosition>): MarketOptionPosition {
  return {
    id: faker.string.uuid(),
    accountId: faker.string.uuid(),
    optionId: faker.string.uuid(),
    marketId: faker.string.uuid(),
    value: new Decimal(0),
    cost: new Decimal(0),
    quantity: new Decimal(0),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...overrides,
  }
}
