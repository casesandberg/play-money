import Decimal from 'decimal.js'
import _ from 'lodash'
import db from '@play-money/database'
import { mockAccount, mockMarketOption, mockTransactionItem } from '@play-money/database/mocks'
import { createTransaction } from '@play-money/finance/lib/createTransaction'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarketClearingAccount } from '@play-money/finance/lib/getMarketClearingAccount'
import { createMarketResolveLossTransactions } from './createMarketResolveLossTransactions'
import { getMarketOption } from './getMarketOption'

jest.mock('@play-money/finance/lib/getMarketAmmAccount', () => ({
  getMarketAmmAccount: jest.fn(),
}))

jest.mock('@play-money/finance/lib/getMarketClearingAccount', () => ({
  getMarketClearingAccount: jest.fn(),
}))

jest.mock('@play-money/database', () => ({
  transactionItem: {
    findMany: jest.fn(),
  },
}))

jest.mock('@play-money/finance/lib/createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('./getMarketOption', () => ({ getMarketOption: jest.fn() }))

describe('createMarketResolveLossTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle no losing shares', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transactionItem.findMany).mockResolvedValue([])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'NO' }))

    await createMarketResolveLossTransactions({
      marketId: 'market-1',
      losingOptionId: 'option-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single user with multiple transactions', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest
      .mocked(db.transactionItem.findMany)
      .mockResolvedValue([
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'NO', amount: new Decimal(10) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'NO', amount: new Decimal(50) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'NO', amount: new Decimal(-20) }),
      ])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'NO' }))

    await createMarketResolveLossTransactions({
      marketId: 'market-1',
      losingOptionId: 'option-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_RESOLVE_LOSS',
        description: 'Returning losing shares for market market-1',
        marketId: 'market-1',
        transactionItems: [
          {
            accountId: 'user-1',
            currencyCode: 'NO',
            amount: new Decimal(40).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'NO',
            amount: new Decimal(40),
          },
        ],
      })
    )
  })

  it('should handle multiple users with multiple transactions', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest
      .mocked(db.transactionItem.findMany)
      .mockResolvedValue([
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'NO', amount: new Decimal(10) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'NO', amount: new Decimal(50) }),
        mockTransactionItem({ accountId: 'user-2', currencyCode: 'NO', amount: new Decimal(30) }),
        mockTransactionItem({ accountId: 'user-2', currencyCode: 'NO', amount: new Decimal(20) }),
      ])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'NO' }))

    await createMarketResolveLossTransactions({
      marketId: 'market-1',
      losingOptionId: 'option-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_RESOLVE_LOSS',
        description: 'Returning losing shares for market market-1',
        marketId: 'market-1',
        transactionItems: [
          {
            accountId: 'user-1',
            currencyCode: 'NO',
            amount: new Decimal(60).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'NO',
            amount: new Decimal(60),
          },
        ],
      })
    )

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_RESOLVE_LOSS',
        description: 'Returning losing shares for market market-1',
        marketId: 'market-1',
        transactionItems: [
          {
            accountId: 'user-2',
            currencyCode: 'NO',
            amount: new Decimal(50).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'NO',
            amount: new Decimal(50),
          },
        ],
      })
    )
  })
})
