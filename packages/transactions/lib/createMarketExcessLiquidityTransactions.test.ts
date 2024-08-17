import Decimal from 'decimal.js'
import _ from 'lodash'
import db from '@play-money/database'
import {
  mockAccount,
  mockMarket,
  mockMarketOption,
  mockTransactionItem,
  mockTransactionWithItems,
} from '@play-money/database/mocks'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarketClearingAccount } from '@play-money/finance/lib/getMarketClearingAccount'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { createMarketExcessLiquidityTransactions } from './createMarketExcessLiquidityTransactions'
import { createTransaction } from './createTransaction'

jest.mock('@play-money/finance/lib/getMarketAmmAccount', () => ({ getMarketAmmAccount: jest.fn() }))
jest.mock('@play-money/finance/lib/getMarketClearingAccount', () => ({ getMarketClearingAccount: jest.fn() }))
jest.mock('./createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('@play-money/finance/lib/getBalances', () => ({ getBalances: jest.fn() }))
jest.mock('@play-money/markets/lib/getMarket', () => ({ getMarket: jest.fn() }))

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
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transactionItem.findMany).mockResolvedValue([])

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return []
      }
      return []
    })

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [mockMarketOption({ id: 'option-1' }), mockMarketOption({ id: 'option-2' })],
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle remaining shares of zero', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            amount: new Decimal(0),
            subtotals: {},
          },
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(0),
            subtotals: {},
          },
        ]
      }
      return []
    })

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [mockMarketOption({ id: 'option-1' }), mockMarketOption({ id: 'option-2' })],
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single LP', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        creatorId: 'user-1',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(-50) }),
        ],
      }),
    ])

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            amount: new Decimal(25),
            subtotals: {},
          },
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(25),
            subtotals: {},
          },
        ]
      }
      return []
    })

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [mockMarketOption({ id: 'option-1' }), mockMarketOption({ id: 'option-2' })],
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-1-account',
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

  it('should handle multiple LPs', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
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

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            amount: new Decimal(20),
            subtotals: {},
          },
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(20),
            subtotals: {},
          },
        ]
      }
      return []
    })

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [mockMarketOption({ id: 'option-1' }), mockMarketOption({ id: 'option-2' })],
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'amm-1-account',
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
        creatorId: 'amm-1-account',
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
