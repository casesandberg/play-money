import Decimal from 'decimal.js'
import '@play-money/config/jest/jest-setup'
import { mockAccount, mockBalance, mockMarket, mockMarketOption } from '@play-money/database/mocks'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getBalance, getMarketBalances, NetBalance } from '@play-money/finance/lib/getBalances'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
import { getMarket } from './getMarket'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

jest.mock('@play-money/finance/lib/getHouseAccount')
jest.mock('./getMarketAmmAccount')
jest.mock('./getMarketClearingAccount')
jest.mock('./getMarket')
jest.mock('@play-money/finance/lib/getBalances')
jest.mock('@play-money/finance/lib/executeTransaction')

describe('createMarketLiquidityTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call executeTransaction with approperate entries', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'exchanger-account-id' }))

    jest.mocked(getBalance).mockImplementation(async ({ accountId }) => {
      if (accountId === 'user-1-account') {
        return mockBalance({
          accountId,
          assetType: 'CURRENCY',
          assetId: 'PRIMARY',
          total: new Decimal(50),
        })
      }
      return {} as NetBalance
    })

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

    jest.mocked(getMarket).mockResolvedValue({
      ...mockMarket(),
      options: [
        { ...mockMarketOption({ id: 'option-1', liquidityProbability: new Decimal(0.5) }), probability: 50 },
        { ...mockMarketOption({ id: 'option-2', liquidityProbability: new Decimal(0.5) }), probability: 50 },
      ],
    })

    await createMarketLiquidityTransaction({
      initiatorId: 'user-1',
      accountId: 'user-1-account',
      amount: new Decimal(50),
      marketId: 'market-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.arrayContaining([
          {
            toAccountId: 'exchanger-account-id',
            fromAccountId: 'user-1-account',
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            amount: new Decimal(50),
          },
          {
            toAccountId: 'amm-1-account',
            fromAccountId: 'exchanger-account-id',
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            amount: new Decimal(50),
          },
          {
            toAccountId: 'amm-1-account',
            fromAccountId: 'exchanger-account-id',
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            amount: new Decimal(50),
          },
        ]),
      })
    )
  })
})
