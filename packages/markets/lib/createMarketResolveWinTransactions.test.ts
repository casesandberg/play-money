import Decimal from 'decimal.js'
import _ from 'lodash'
import db from '@play-money/database'
import { mockAccount, mockMarket, mockMarketOption, mockTransactionItem } from '@play-money/database/mocks'
import { createTransaction } from '@play-money/finance/lib/createTransaction'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { createMarketResolveWinTransactions } from './createMarketResolveWinTransactions'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'
import { getMarketOption } from './getMarketOption'

jest.mock('./getMarketAmmAccount', () => ({ getMarketAmmAccount: jest.fn() }))
jest.mock('./getMarketClearingAccount', () => ({ getMarketClearingAccount: jest.fn() }))
jest.mock('@play-money/database', () => ({ transactionItem: { findMany: jest.fn() } }))
jest.mock('@play-money/finance/lib/createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('./getMarket', () => ({ getMarket: jest.fn() }))
jest.mock('./getMarketOption', () => ({ getMarketOption: jest.fn() }))
jest.mock('@play-money/finance/lib/getBalances', () => ({ getBalances: jest.fn(), getAssetBalance: jest.fn() }))

describe('createMarketResolveWinTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle no winning shares', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transactionItem.findMany).mockResolvedValue([])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return []
      }
      return []
    })

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }),
        mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }),
      ],
    })

    await createMarketResolveWinTransactions({
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single user with multiple transactions', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest
      .mocked(db.transactionItem.findMany)
      .mockResolvedValue([
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(10) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(50) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(-20) }),
      ])
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return []
      }
      return []
    })

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }),
        mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }),
      ],
    })

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
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
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
