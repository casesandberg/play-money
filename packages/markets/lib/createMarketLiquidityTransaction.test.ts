import Decimal from 'decimal.js'
import '@play-money/config/jest/jest-setup'
import { mockAccount, mockMarket, mockMarketOption } from '@play-money/database/mocks'
import { createTransaction } from '@play-money/finance/lib/createTransaction'
import { getAssetBalance, getBalances, NetBalance } from '@play-money/finance/lib/getBalances'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarketClearingAccount } from '@play-money/finance/lib/getMarketClearingAccount'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
import { getMarket } from './getMarket'

jest.mock('@play-money/finance/lib/getHouseAccount', () => ({ getHouseAccount: jest.fn() }))
jest.mock('@play-money/finance/lib/getMarketAmmAccount', () => ({ getMarketAmmAccount: jest.fn() }))
jest.mock('@play-money/finance/lib/getMarketClearingAccount', () => ({ getMarketClearingAccount: jest.fn() }))
jest.mock('./getMarket', () => ({ getMarket: jest.fn() }))
jest.mock('@play-money/finance/lib/createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('@play-money/finance/lib/getBalances', () => ({ getBalances: jest.fn(), getAssetBalance: jest.fn() }))

describe('createMarketLiquidityTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createTransaction with approperate transactionItems', async () => {
    jest.mocked(getAssetBalance).mockImplementation(async ({ accountId }) => {
      if (accountId === 'user-1-account') {
        return {
          accountId,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
          amount: new Decimal(50),
          subtotals: {},
        }
      }
      return {} as NetBalance
    })

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

    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }),
        mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }),
      ],
    })

    await createMarketLiquidityTransaction({
      accountId: 'user-1-account',
      amount: new Decimal(50),
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionItems: expect.arrayContaining([
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'NO',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'YES',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'NO',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'NO',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'YES',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'NO',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'PRIMARY',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'PRIMARY',
            accountId: 'user-1-account',
          },
        ]),
      })
    )
  })
})
