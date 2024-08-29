import Decimal from 'decimal.js'
import db from '@play-money/database'
import {
  mockAccount,
  mockMarket,
  mockMarketOption,
  mockTransactionEntry,
  mockTransactionWithEntries,
} from '@play-money/database/mocks'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createLiquidityVolumeBonusTransaction } from './createLiquidityVolumeBonusTransaction'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

jest.mock('./getMarket')
jest.mock('./getMarketClearingAccount')
jest.mock('./getMarketAmmAccount')
jest.mock('@play-money/finance/lib/getHouseAccount')
jest.mock('@play-money/finance/lib/executeTransaction')
jest.mock('@play-money/database')

describe('createLiquidityVolumeBonusTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle a single LP', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-1',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-1',
            toAccountId: 'EXCHANGER',
            amount: new Decimal(50),
          }),
        ],
      }),
    ])

    await createLiquidityVolumeBonusTransaction({
      marketId: 'market-1',
      amountTraded: new Decimal(100),
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_VOLUME_BONUS',
        marketId: 'market-1',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-1',
            fromAccountId: 'HOUSE',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(5),
          },
        ]),
      })
    )
  })

  it('should handle multiple LPs', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(db.transaction.findMany).mockResolvedValue([
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-1',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-1',
            toAccountId: 'EXCHANGER',
            amount: new Decimal(100),
          }),
        ],
      }),
      mockTransactionWithEntries({
        type: 'LIQUIDITY_DEPOSIT',
        initiatorId: 'user-2',
        entries: [
          mockTransactionEntry({
            fromAccountId: 'user-2',
            toAccountId: 'EXCHANGER',
            amount: new Decimal(150),
          }),
        ],
      }),
    ])

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        { ...mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }), probability: 50 },
        { ...mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }), probability: 50 },
      ],
    })

    await createLiquidityVolumeBonusTransaction({
      marketId: 'market-1',
      amountTraded: new Decimal(200),
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_VOLUME_BONUS',
        marketId: 'market-1',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-1',
            fromAccountId: 'HOUSE',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(4),
          },
        ]),
      })
    )

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'LIQUIDITY_VOLUME_BONUS',
        marketId: 'market-1',
        entries: expect.arrayContaining([
          {
            toAccountId: 'user-2',
            fromAccountId: 'HOUSE',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(6),
          },
        ]),
      })
    )
  })
})
