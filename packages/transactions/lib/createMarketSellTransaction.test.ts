import Decimal from 'decimal.js'
import '@play-money/config/jest/jest-setup'
import { mockAccount, mockMarket, mockMarketOption } from '@play-money/database/mocks'
import { getBalances } from '@play-money/finance/lib/getBalances'
import { getMarketAmmAccount } from '@play-money/finance/lib/getMarketAmmAccount'
import { getMarketClearingAccount } from '@play-money/finance/lib/getMarketClearingAccount'
import { getUserPrimaryAccount } from '@play-money/finance/lib/getUserPrimaryAccount'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getMarketOption } from '@play-money/markets/lib/getMarketOption'
import { createMarketSellTransaction } from './createMarketSellTransaction'
import { createTransaction } from './createTransaction'

jest.mock('@play-money/finance/lib/getMarketAmmAccount', () => ({ getMarketAmmAccount: jest.fn() }))
jest.mock('@play-money/finance/lib/getMarketClearingAccount', () => ({ getMarketClearingAccount: jest.fn() }))
jest.mock('@play-money/finance/lib/getUserPrimaryAccount', () => ({ getUserPrimaryAccount: jest.fn() }))
jest.mock('./createTransaction', () => ({ createTransaction: jest.fn() }))
jest.mock('@play-money/markets/lib/getMarketOption', () => ({ getMarketOption: jest.fn() }))
jest.mock('@play-money/finance/lib/getBalances', () => ({ getBalances: jest.fn() }))
jest.mock('@play-money/markets/lib/getMarket', () => ({ getMarket: jest.fn() }))

describe('createMarketSellTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createTransaction with approperate transactionItems', async () => {
    jest.mocked(getUserPrimaryAccount).mockResolvedValue(mockAccount({ id: 'user-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1', currencyCode: 'YES' }))

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }),
        mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }),
      ],
    })

    jest.mocked(getBalances).mockImplementation(async ({ accountId }) => {
      if (accountId === 'amm-1-account') {
        return [
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            amount: new Decimal(85.71),
            subtotals: {},
          },
          {
            accountId,
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(350),
            subtotals: {},
          },
        ]
      }
      return []
    })

    await createMarketSellTransaction({
      userId: 'user-1',
      amount: new Decimal(64.29),
      optionId: 'option-1',
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionItems: expect.arrayContaining([
          {
            amount: expect.closeToDecimal(-64.29),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeToDecimal(64.29),
            currencyCode: 'YES',
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
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'NO',
            accountId: 'amm-1-account',
          },
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
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'NO',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'PRIMARY',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'PRIMARY',
            accountId: 'user-1-account',
          },
        ]),
      })
    )
  })
})
