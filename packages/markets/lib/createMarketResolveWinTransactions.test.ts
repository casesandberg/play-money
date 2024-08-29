import Decimal from 'decimal.js'
import db from '@play-money/database'
import { mockAccount, mockMarket, mockMarketOption, mockMarketOptionPosition } from '@play-money/database/mocks'
import * as ECONOMY from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { createMarketResolveWinTransactions } from './createMarketResolveWinTransactions'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

// TODO: Test for unrealized gains
Object.defineProperty(ECONOMY, 'REALIZED_GAINS_TAX', { value: 0 })

jest.mock('./getMarket')
jest.mock('./getMarketAmmAccount')
jest.mock('./getMarketClearingAccount')
jest.mock('@play-money/database')
jest.mock('@play-money/finance/lib/executeTransaction')
jest.mock('@play-money/finance/lib/getHouseAccount')

describe('createMarketResolveWinTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
  })

  it('should handle no winning shares', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(db.marketOptionPosition.findMany).mockResolvedValue([])

    await createMarketResolveWinTransactions({
      initiatorId: 'user-1',
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(executeTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single user with a single position', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest
      .mocked(db.marketOptionPosition.findMany)
      .mockResolvedValue([
        mockMarketOptionPosition({ accountId: 'user-1', optionId: 'option-1', quantity: new Decimal(40) }),
      ])

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        { ...mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }), probability: 50 },
        { ...mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }), probability: 50 },
      ],
    })

    await createMarketResolveWinTransactions({
      initiatorId: 'user-1',
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TRADE_WIN',
        marketId: 'market-1',
        entries: expect.arrayContaining([
          {
            fromAccountId: 'EXCHANGER',
            toAccountId: 'user-1',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(40),
          },
        ]),
      })
    )
  })

  it('should handle multiple users with positions', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest
      .mocked(db.marketOptionPosition.findMany)
      .mockResolvedValue([
        mockMarketOptionPosition({ accountId: 'user-1', optionId: 'option-1', quantity: new Decimal(60) }),
        mockMarketOptionPosition({ accountId: 'user-2', optionId: 'option-1', quantity: new Decimal(50) }),
      ])

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        { ...mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }), probability: 50 },
        { ...mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }), probability: 50 },
      ],
    })

    await createMarketResolveWinTransactions({
      initiatorId: 'user-1',
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TRADE_WIN',
        marketId: 'market-1',
        entries: expect.arrayContaining([
          {
            fromAccountId: 'EXCHANGER',
            toAccountId: 'user-1',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(60),
          },
        ]),
      })
    )

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TRADE_WIN',
        marketId: 'market-1',
        entries: expect.arrayContaining([
          {
            fromAccountId: 'EXCHANGER',
            toAccountId: 'user-2',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(50),
          },
        ]),
      })
    )
  })
})
