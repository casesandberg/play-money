import Decimal from 'decimal.js'
import _ from 'lodash'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import db from '@play-money/database'
import { mockAccount, mockTransactionItem, mockTransactionWithItems } from '@play-money/database/mocks'
import { createMarketExcessLiquidityTransactions } from './createMarketExcessLiquidityTransactions'
import { createTransaction } from './createTransaction'

jest.mock('@play-money/accounts/lib/getAmmAccount', () => ({ getAmmAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getExchangerAccount', () => ({ getExchangerAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/checkAccountBalance', () => ({ checkAccountBalance: jest.fn() }))
jest.mock('@play-money/accounts/lib/getAccountBalance', () => ({ getAccountBalance: jest.fn() }))
jest.mock('./createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('@play-money/database', () => ({
  transactionItem: {
    findMany: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
  },
}))

describe('createMarketExcessLiquidityTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle no remaining shares', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transactionItem.findMany).mockResolvedValue([])
    jest.mocked(getAccountBalance).mockImplementation(async () => new Decimal(0))

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle remaining shares of zero', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(checkAccountBalance).mockImplementation(async () => true)
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(0) }),
        ],
      }),
    ])
    jest
      .mocked(db.transactionItem.findMany)
      .mockResolvedValue([
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(50) }),
        mockTransactionItem({ accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(-50) }),
      ])

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single LP', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        creatorId: 'user-1',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(-50) }),
        ],
      }),
    ])
    jest.mocked(checkAccountBalance).mockImplementation(async () => true)
    jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
      if (currencyCode === 'YES') return new Decimal(25)
      if (currencyCode === 'NO') return new Decimal(25)
      return new Decimal(0)
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_EXCESS_LIQUIDITY',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-1',
            currencyCode: 'PRIMARY',
            amount: new Decimal(25),
          },
        ]),
      })
    )
  })

  it('should handle a single LP', async () => {
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        creatorId: 'user-1',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(-50) }),
        ],
      }),
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        creatorId: 'user-2',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-2', currencyCode: 'PRIMARY', amount: new Decimal(-150) }),
        ],
      }),
    ])
    jest.mocked(checkAccountBalance).mockImplementation(async () => true)
    jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
      if (currencyCode === 'YES') return new Decimal(20)
      if (currencyCode === 'NO') return new Decimal(20)
      return new Decimal(0)
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_EXCESS_LIQUIDITY',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-1',
            currencyCode: 'PRIMARY',
            amount: new Decimal(5),
          },
        ]),
      })
    )

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-account-id',
        type: 'MARKET_EXCESS_LIQUIDITY',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-2',
            currencyCode: 'PRIMARY',
            amount: new Decimal(15),
          },
        ]),
      })
    )
  })
})
