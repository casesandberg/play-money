import Decimal from 'decimal.js'
import db from '@play-money/database'
import { mockAccount, mockBalance, mockTransactionEntry, mockTransactionWithEntries } from '@play-money/database/mocks'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createMarketExcessLiquidityTransactions } from './createMarketExcessLiquidityTransactions'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

jest.mock('./getMarketAmmAccount')
jest.mock('./getMarketClearingAccount')
jest.mock('@play-money/finance/lib/getHouseAccount')
jest.mock('@play-money/finance/lib/executeTransaction')
jest.mock('@play-money/finance/lib/getBalances')

jest.mock('@play-money/database')

describe('createMarketExcessLiquidityTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle remaining shares of zero', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))

    jest.mocked(getMarketBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            total: new Decimal(0),
          }),
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            total: new Decimal(0),
          }),
        ]
      }
      return []
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
      initiatorId: 'user-1',
    })

    expect(executeTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single LP', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-1',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-1',
            toAccountId: 'exchanger-account-id',
            amount: new Decimal(50),
          }),
        ],
      }),
    ])

    jest.mocked(getMarketBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            total: new Decimal(25),
          }),
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            total: new Decimal(25),
          }),
        ]
      }
      return []
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
      initiatorId: 'user-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_RETURNED',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-1',
            fromAccountId: 'exchanger-account-id',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
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
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-1',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-1',
            toAccountId: 'exchanger-account-id',
            amount: new Decimal(50),
          }),
        ],
      }),
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-2',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-2',
            toAccountId: 'exchanger-account-id',
            amount: new Decimal(50),
          }),
        ],
      }),
    ])

    jest.mocked(getMarketBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            total: new Decimal(20),
          }),
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            total: new Decimal(20),
          }),
        ]
      }
      return []
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
      initiatorId: 'user-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_RETURNED',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-1',
            fromAccountId: 'exchanger-account-id',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(10),
          },
        ]),
      })
    )

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_RETURNED',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-2',
            fromAccountId: 'exchanger-account-id',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(10),
          },
        ]),
      })
    )
  })

  it('should never return more liquidity than deposited, remaining dust to house', async () => {
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-1',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-1',
            toAccountId: 'exchanger-account-id',
            amount: new Decimal(50),
          }),
        ],
      }),
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-2',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-2',
            toAccountId: 'exchanger-account-id',
            amount: new Decimal(50),
          }),
        ],
      }),
    ])

    jest.mocked(getMarketBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            total: new Decimal(120),
          }),
          mockBalance({
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            total: new Decimal(120),
          }),
        ]
      }
      return []
    })

    await createMarketExcessLiquidityTransactions({
      marketId: 'market-1',
      initiatorId: 'user-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_RETURNED',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-1',
            fromAccountId: 'exchanger-account-id',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(50),
          },
        ]),
      })
    )

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_RETURNED',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-2',
            fromAccountId: 'exchanger-account-id',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(50),
          },
        ]),
      })
    )

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_RETURNED',
        entries: expect.arrayContaining([
          {
            toAccountId: 'HOUSE',
            fromAccountId: 'exchanger-account-id',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(20),
          },
        ]),
      })
    )
  })
})
