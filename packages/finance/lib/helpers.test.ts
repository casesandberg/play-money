import Decimal from 'decimal.js'
import { mockBalance } from '@play-money/database/mocks'
import { calculateBalanceSubtotals, marketOptionBalancesToProbabilities } from './helpers'

describe('calculateBalanceSubtotals', () => {
  const mockTx = {
    balance: {
      findFirst: jest.fn(),
    },
  }

  it('should calculate subtotals when existing balance is found', async () => {
    mockTx.balance.findFirst.mockResolvedValue({
      subtotals: { existingType: 100 },
    })

    const result = await calculateBalanceSubtotals({
      tx: mockTx as any,
      accountId: '123',
      assetType: 'MARKET_OPTION',
      assetId: 'asset1',
      change: new Decimal(50),
      transactionType: 'newType',
    })

    expect(result).toEqual({
      existingType: 100,
      newType: 50,
    })
  })

  it('should create new subtotals when no existing balance is found', async () => {
    mockTx.balance.findFirst.mockResolvedValue(null)

    const result = await calculateBalanceSubtotals({
      tx: mockTx as any,
      accountId: '123',
      assetType: 'MARKET_OPTION',
      assetId: 'asset1',
      change: new Decimal(50),
      transactionType: 'newType',
    })

    expect(result).toEqual({
      newType: 50,
    })
  })

  it('should update existing subtotal for the same transaction type', async () => {
    mockTx.balance.findFirst.mockResolvedValue({
      subtotals: { existingType: 100 },
    })

    const result = await calculateBalanceSubtotals({
      tx: mockTx as any,
      accountId: '123',
      assetType: 'MARKET_OPTION',
      assetId: 'asset1',
      change: new Decimal(50),
      transactionType: 'existingType',
    })

    expect(result).toEqual({
      existingType: 150,
    })
  })

  it('should handle negative for the same transaction type', async () => {
    mockTx.balance.findFirst.mockResolvedValue({
      subtotals: { existingType: 100 },
    })

    const result = await calculateBalanceSubtotals({
      tx: mockTx as any,
      accountId: '123',
      assetType: 'MARKET_OPTION',
      assetId: 'asset1',
      change: new Decimal(-150),
      transactionType: 'existingType',
    })

    expect(result).toEqual({
      existingType: -50,
    })
  })
})

describe('marketOptionBalancesToProbabilities', () => {
  it('should calculate probabilities correctly', () => {
    const balances = [
      mockBalance({ assetType: 'MARKET_OPTION', assetId: 'option1', total: new Decimal(30) }),
      mockBalance({ assetType: 'MARKET_OPTION', assetId: 'option2', total: new Decimal(70) }),
      mockBalance({ assetType: 'CURRENCY', assetId: 'PRIMARY', total: new Decimal(50) }),
    ]

    const result = marketOptionBalancesToProbabilities(balances)

    expect(result).toEqual({
      option1: 70,
      option2: 30,
    })
  })

  it('should handle empty input', () => {
    const result = marketOptionBalancesToProbabilities([])
    expect(result).toEqual({})
  })

  it('should handle input with no MARKET_OPTION assets', () => {
    const balances = [
      { assetType: 'OTHER', assetId: 'other1', total: 50 },
      { assetType: 'OTHER', assetId: 'other2', total: 50 },
    ]

    const result = marketOptionBalancesToProbabilities(balances as any)
    expect(result).toEqual({})
  })
})
