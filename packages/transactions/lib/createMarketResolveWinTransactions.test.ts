import Decimal from 'decimal.js'
import _ from 'lodash'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db from '@play-money/database'
import { mockAccount, mockMarketOption, mockTransactionItem } from '@play-money/database/mocks'
import { getMarketOption } from '@play-money/markets/lib/getMarketOption'
import { createMarketResolveWinTransactions } from './createMarketResolveWinTransactions'
import { createTransaction } from './createTransaction'

jest.mock('@play-money/accounts/lib/getAmmAccount', () => ({
  getAmmAccount: jest.fn(),
}))

jest.mock('@play-money/accounts/lib/getExchangerAccount', () => ({
  getExchangerAccount: jest.fn(),
}))

jest.mock('@play-money/database', () => ({
  transactionItem: {
    findMany: jest.fn(),
  },
}))

jest.mock('./createTransaction', () => ({
  createTransaction: jest.fn(),
}))

jest.mock('@play-money/markets/lib/getMarketOption', () => ({ getMarketOption: jest.fn() }))

describe('createMarketResolveWinTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle no winning shares', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transactionItem.findMany).mockResolvedValue([])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))

    await createMarketResolveWinTransactions({
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single user with multiple transactions', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest
      .mocked(db.transactionItem.findMany)
      .mockResolvedValue([
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(10) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(50) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(-20) }),
      ])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))

    await createMarketResolveWinTransactions({
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_RESOLVE_WIN',
        description: 'Returning winning shares for market market-1 and converting to primary currency',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-1',
            currencyCode: 'YES',
            amount: new Decimal(40).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'YES',
            amount: new Decimal(40),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'YES',
            amount: new Decimal(40).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'NO',
            amount: new Decimal(40).negated(),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'YES',
            amount: new Decimal(40),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'NO',
            amount: new Decimal(40),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(40).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(40),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(40).negated(),
          },
          {
            accountId: 'user-1',
            currencyCode: 'PRIMARY',
            amount: new Decimal(40),
          },
        ]),
      })
    )
  })

  it('should handle multiple users with multiple transactions', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest
      .mocked(db.transactionItem.findMany)
      .mockResolvedValue([
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(10) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(50) }),
        mockTransactionItem({ accountId: 'user-2', currencyCode: 'YES', amount: new Decimal(30) }),
        mockTransactionItem({ accountId: 'user-2', currencyCode: 'YES', amount: new Decimal(20) }),
      ])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))

    await createMarketResolveWinTransactions({
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(createTransaction).toHaveBeenCalledTimes(2)

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_RESOLVE_WIN',
        description: 'Returning winning shares for market market-1 and converting to primary currency',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-1',
            currencyCode: 'YES',
            amount: new Decimal(60).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'YES',
            amount: new Decimal(60),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'YES',
            amount: new Decimal(60).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'NO',
            amount: new Decimal(60).negated(),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'YES',
            amount: new Decimal(60),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'NO',
            amount: new Decimal(60),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(60).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(60),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(60).negated(),
          },
          {
            accountId: 'user-1',
            currencyCode: 'PRIMARY',
            amount: new Decimal(60),
          },
        ]),
      })
    )

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_RESOLVE_WIN',
        description: 'Returning winning shares for market market-1 and converting to primary currency',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-2',
            currencyCode: 'YES',
            amount: new Decimal(50).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'YES',
            amount: new Decimal(50),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'YES',
            amount: new Decimal(50).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'NO',
            amount: new Decimal(50).negated(),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'YES',
            amount: new Decimal(50),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'NO',
            amount: new Decimal(50),
          },
          {
            accountId: 'exchanger-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(50).negated(),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(50),
          },
          {
            accountId: 'amm-account-id',
            currencyCode: 'PRIMARY',
            amount: new Decimal(50).negated(),
          },
          {
            accountId: 'user-2',
            currencyCode: 'PRIMARY',
            amount: new Decimal(50),
          },
        ]),
      })
    )
  })
})
