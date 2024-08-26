import Decimal from 'decimal.js'
import db from '@play-money/database'
import { mockAccount, mockMarketOptionPosition } from '@play-money/database/mocks'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { createMarketResolveLossTransactions } from './createMarketResolveLossTransactions'
import { getMarketAmmAccount } from './getMarketAmmAccount'

jest.mock('./getMarketAmmAccount')
jest.mock('@play-money/database')
jest.mock('@play-money/finance/lib/executeTransaction')

describe('createMarketResolveLossTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle no losing shares', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest.mocked(db.marketOptionPosition.findMany).mockResolvedValue([])

    await createMarketResolveLossTransactions({
      initiatorId: 'user-1',
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(executeTransaction).not.toHaveBeenCalled()
  })

  it('should handle a single user with a single position', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest
      .mocked(db.marketOptionPosition.findMany)
      .mockResolvedValue([
        mockMarketOptionPosition({ accountId: 'user-1', optionId: 'option-2', quantity: new Decimal(40) }),
      ])

    await createMarketResolveLossTransactions({
      initiatorId: 'user-1',
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TRADE_LOSS',
        marketId: 'market-1',
        entries: [
          {
            fromAccountId: 'user-1',
            toAccountId: 'amm-account-id',
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(40),
          },
        ],
      })
    )
  })

  it('should handle multiple users with positions', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-account-id' }))
    jest
      .mocked(db.marketOptionPosition.findMany)
      .mockResolvedValue([
        mockMarketOptionPosition({ accountId: 'user-1', optionId: 'option-2', quantity: new Decimal(60) }),
        mockMarketOptionPosition({ accountId: 'user-2', optionId: 'option-2', quantity: new Decimal(50) }),
      ])

    await createMarketResolveLossTransactions({
      initiatorId: 'user-1',
      marketId: 'market-1',
      winningOptionId: 'option-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TRADE_LOSS',
        marketId: 'market-1',
        entries: [
          {
            fromAccountId: 'user-1',
            toAccountId: 'amm-account-id',
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(60),
          },
        ],
      })
    )

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TRADE_LOSS',
        marketId: 'market-1',
        entries: [
          {
            fromAccountId: 'user-2',
            toAccountId: 'amm-account-id',
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(50),
          },
        ],
      })
    )
  })
})
