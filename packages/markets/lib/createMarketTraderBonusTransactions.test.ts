import Decimal from 'decimal.js'
import _ from 'lodash'
import db from '@play-money/database'
import { mockAccount, mockTransactionItem, mockTransactionWithItems } from '@play-money/database/mocks'
import { createTransaction } from '@play-money/finance/lib/createTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createMarketTraderBonusTransactions } from './createMarketTraderBonusTransactions'

jest.mock('@play-money/finance/lib/getHouseAccount', () => ({ getHouseAccount: jest.fn() }))
jest.mock('@play-money/finance/lib/createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('@play-money/database', () => ({
  transactionItem: {
    findMany: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
  },
}))

describe('createMarketTraderBonusTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle no remaining shares', async () => {
    await createMarketTraderBonusTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle remaining shares of zero', async () => {
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(0) }),
        ],
      }),
    ])

    await createMarketTraderBonusTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single LP', async () => {
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        creatorId: 'user-1',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(-50) }),
        ],
      }),
    ])

    await createMarketTraderBonusTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'HOUSE',
        type: 'MARKET_TRADER_BONUS',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-1',
            currencyCode: 'PRIMARY',
            amount: new Decimal(50),
          },
        ]),
      })
    )
  })

  it('should handle multiple LPs', async () => {
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithItems({
        type: 'MARKET_LIQUIDITY',
        creatorId: 'user-1',
        transactionItems: [
          mockTransactionItem({ accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(-100) }),
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

    await createMarketTraderBonusTransactions({
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'HOUSE',
        type: 'MARKET_TRADER_BONUS',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-1',
            currencyCode: 'PRIMARY',
            amount: new Decimal(20),
          },
        ]),
      })
    )

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        creatorId: 'HOUSE',
        type: 'MARKET_TRADER_BONUS',
        marketId: 'market-1',
        transactionItems: expect.arrayContaining([
          {
            accountId: 'user-2',
            currencyCode: 'PRIMARY',
            amount: new Decimal(30),
          },
        ]),
      })
    )
  })
})
