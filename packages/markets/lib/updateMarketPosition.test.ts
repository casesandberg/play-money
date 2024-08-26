import { Decimal } from 'decimal.js'
import { TransactionClient } from '@play-money/database'
import { BalanceChange, findBalanceChange } from '@play-money/finance/lib/helpers'
import { updateMarketPosition } from './updateMarketPosition'

jest.mock('@play-money/database')
jest.mock('@play-money/finance/lib/helpers')

describe('updateMarketPosition', () => {
  let mockTx: jest.Mocked<TransactionClient>

  beforeEach(() => {
    mockTx = {
      marketOptionPosition: {
        upsert: jest.fn(),
      },
    } as any

    jest.clearAllMocks()
  })

  it('should create a new position when it does not exist', async () => {
    const balanceChanges: BalanceChange[] = [
      { accountId: 'acc1', assetType: 'CURRENCY', assetId: 'PRIMARY', change: -100 },
      { accountId: 'acc1', assetType: 'MARKET_OPTION', assetId: 'option1', change: 10 },
    ]

    jest.mocked(findBalanceChange).mockImplementation(({ assetType, assetId }) => {
      if (assetType === 'CURRENCY' && assetId === 'PRIMARY') return balanceChanges[0]
      if (assetType === 'MARKET_OPTION' && assetId === 'option1') return balanceChanges[1]
      return undefined
    })

    await updateMarketPosition({
      tx: mockTx,
      marketId: 'market1',
      accountId: 'acc1',
      optionId: 'option1',
      balanceChanges,
    })

    expect(mockTx.marketOptionPosition.upsert).toHaveBeenCalledWith({
      where: {
        accountId_optionId: {
          accountId: 'acc1',
          optionId: 'option1',
        },
      },
      update: {
        quantity: { increment: 10 },
        cost: { increment: 100 },
      },
      create: {
        accountId: 'acc1',
        marketId: 'market1',
        optionId: 'option1',
        quantity: new Decimal(10),
        cost: new Decimal(100),
        value: new Decimal(100),
      },
    })
  })

  it('should update an existing position', async () => {
    const balanceChanges: BalanceChange[] = [
      { accountId: 'acc1', assetType: 'CURRENCY', assetId: 'PRIMARY', change: 50 },
      { accountId: 'acc1', assetType: 'MARKET_OPTION', assetId: 'option1', change: -5 },
    ]

    jest.mocked(findBalanceChange).mockImplementation(({ assetType, assetId }) => {
      if (assetType === 'CURRENCY' && assetId === 'PRIMARY') return balanceChanges[0]
      if (assetType === 'MARKET_OPTION' && assetId === 'option1') return balanceChanges[1]
      return undefined
    })

    await updateMarketPosition({
      tx: mockTx,
      marketId: 'market1',
      accountId: 'acc1',
      optionId: 'option1',
      balanceChanges,
    })

    expect(mockTx.marketOptionPosition.upsert).toHaveBeenCalledWith({
      where: {
        accountId_optionId: {
          accountId: 'acc1',
          optionId: 'option1',
        },
      },
      update: {
        quantity: { decrement: 5 },
        cost: { decrement: 50 },
      },
      create: {
        accountId: 'acc1',
        marketId: 'market1',
        optionId: 'option1',
        quantity: new Decimal(-5),
        cost: new Decimal(-50),
        value: new Decimal(-50),
      },
    })
  })

  it('should handle zero changes correctly', async () => {
    const balanceChanges: BalanceChange[] = [
      { accountId: 'acc1', assetType: 'CURRENCY', assetId: 'PRIMARY', change: 0 },
      { accountId: 'acc1', assetType: 'MARKET_OPTION', assetId: 'option1', change: 0 },
    ]

    jest.mocked(findBalanceChange).mockImplementation(({ assetType, assetId }) => {
      if (assetType === 'CURRENCY' && assetId === 'PRIMARY') return balanceChanges[0]
      if (assetType === 'MARKET_OPTION' && assetId === 'option1') return balanceChanges[1]
      return undefined
    })

    await updateMarketPosition({
      tx: mockTx,
      marketId: 'market1',
      accountId: 'acc1',
      optionId: 'option1',
      balanceChanges,
    })

    expect(mockTx.marketOptionPosition.upsert).toHaveBeenCalledWith({
      where: {
        accountId_optionId: {
          accountId: 'acc1',
          optionId: 'option1',
        },
      },
      update: {
        quantity: { increment: 0 },
        cost: { decrement: 0 },
      },
      create: {
        accountId: 'acc1',
        marketId: 'market1',
        optionId: 'option1',
        quantity: new Decimal(0),
        cost: new Decimal(0),
        value: new Decimal(0),
      },
    })
  })
})
