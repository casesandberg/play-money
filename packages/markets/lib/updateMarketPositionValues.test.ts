import { Decimal } from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { mockAccount, mockBalance, mockMarketOptionPosition } from '@play-money/database/mocks'
import * as ECONOMY from '@play-money/finance/economy'
import { getMarketBalances } from '@play-money/finance/lib/getBalances'
import { BalanceChange, calculateRealizedGainsTax, findBalanceChange } from '@play-money/finance/lib/helpers'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { updateMarketPositionValues } from './updateMarketPositionValues'

// TODO: Test for unrealized gains
Object.defineProperty(ECONOMY, 'REALIZED_GAINS_TAX', { value: 0 })

// TODO: Figure out fix for not having to include this
declare global {
  namespace jest {
    interface Expect {
      closeToDecimal(expected: string | number, precision?: string | number): CustomMatcherResult
    }
    interface Matchers<R> {
      toBeCloseToDecimal(expected: Decimal.Value, precision?: Decimal.Value): R
    }
  }
}

jest.mock('@play-money/database')
jest.mock('@play-money/finance/lib/getBalances')
jest.mock('@play-money/finance/lib/helpers')
jest.mock('./getMarketAmmAccount')

describe('updateMarketPositionValues', () => {
  let mockTx: jest.Mocked<TransactionClient>

  beforeEach(() => {
    mockTx = {
      marketOptionPosition: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    } as any

    jest.clearAllMocks()
  })

  it('should update market position values correctly', async () => {
    const mockMarketId = 'market1'
    const mockAmmAccountId = 'amm1'
    const mockBalanceChanges = [
      { accountId: mockAmmAccountId, assetType: 'MARKET_OPTION', assetId: 'option1', change: -50 },
      { accountId: mockAmmAccountId, assetType: 'MARKET_OPTION', assetId: 'option2', change: 100 },
    ] as Array<BalanceChange>

    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: mockAmmAccountId }))
    jest.mocked(calculateRealizedGainsTax).mockImplementation(() => {
      return new Decimal(0)
    })

    jest.mocked(getMarketBalances).mockResolvedValue([
      mockBalance({
        accountId: mockAmmAccountId,
        assetType: 'MARKET_OPTION',
        assetId: 'option1',
        total: new Decimal(100),
      }),
      mockBalance({
        accountId: mockAmmAccountId,
        assetType: 'MARKET_OPTION',
        assetId: 'option2',
        total: new Decimal(200),
      }),
    ])
    jest.mocked(findBalanceChange).mockImplementation(({ assetId }) => {
      return mockBalanceChanges.find((change) => change.assetId === assetId)
    })

    jest.mocked(mockTx.marketOptionPosition.findMany).mockResolvedValue([
      mockMarketOptionPosition({
        id: 'user-1-pos',
        optionId: 'option1',
        cost: new Decimal(25),
        quantity: new Decimal(50),
        value: new Decimal(50),
      }),
      mockMarketOptionPosition({
        id: 'user-2-pos',
        optionId: 'option2',
        cost: new Decimal(40),
        quantity: new Decimal(75),
        value: new Decimal(75),
      }),
    ])

    await updateMarketPositionValues({
      tx: mockTx,
      balanceChanges: mockBalanceChanges,
      marketId: mockMarketId,
    })

    expect(mockTx.marketOptionPosition.update).toHaveBeenCalledWith({
      where: { id: 'user-1-pos' },
      data: expect.objectContaining({ value: expect.closeToDecimal(41.88) }),
    })
    expect(mockTx.marketOptionPosition.update).toHaveBeenCalledWith({
      where: { id: 'user-2-pos' },
      data: expect.objectContaining({ value: expect.closeToDecimal(9.01) }),
    })
  })

  it('should handle the case when no positions are found', async () => {
    const mockMarketId = 'market1'
    const mockAmmAccountId = 'amm1'
    const mockBalanceChanges: any[] = []

    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: mockAmmAccountId }))
    jest.mocked(getMarketBalances).mockResolvedValue([])
    jest.mocked(mockTx.marketOptionPosition.findMany).mockResolvedValue([])

    await updateMarketPositionValues({
      tx: mockTx,
      balanceChanges: mockBalanceChanges,
      marketId: mockMarketId,
    })

    expect(mockTx.marketOptionPosition.update).not.toHaveBeenCalled()
  })

  it('should skip updating position if no balance changes', async () => {
    const mockMarketId = 'market1'
    const mockAmmAccountId = 'amm1'
    const mockBalanceChanges: any[] = []

    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: mockAmmAccountId }))
    jest.mocked(getMarketBalances).mockResolvedValue([
      mockBalance({
        accountId: mockAmmAccountId,
        assetType: 'MARKET_OPTION',
        assetId: 'option1',
        total: new Decimal(100),
      }),
      mockBalance({
        accountId: mockAmmAccountId,
        assetType: 'MARKET_OPTION',
        assetId: 'option2',
        total: new Decimal(200),
      }),
    ])

    jest.mocked(mockTx.marketOptionPosition.findMany).mockResolvedValue([
      mockMarketOptionPosition({
        id: 'user-1-pos',
        optionId: 'option1',
        cost: new Decimal(25),
        quantity: new Decimal(50),
        value: new Decimal(41.8861),
      }),
      mockMarketOptionPosition({
        id: 'user-2-pos',
        optionId: 'option2',
        cost: new Decimal(40),
        quantity: new Decimal(75),
        value: new Decimal(9.0148),
      }),
    ])

    await updateMarketPositionValues({
      tx: mockTx,
      balanceChanges: mockBalanceChanges,
      marketId: mockMarketId,
    })

    expect(mockTx.marketOptionPosition.update).not.toHaveBeenCalled()
  })
})
