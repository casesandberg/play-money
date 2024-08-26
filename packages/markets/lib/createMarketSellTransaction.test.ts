import Decimal from 'decimal.js'
import '@play-money/config/jest/jest-setup'
import { mockAccount, mockBalance } from '@play-money/database/mocks'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getMarketBalances, getBalance } from '@play-money/finance/lib/getBalances'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketSellTransaction } from './createMarketSellTransaction'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

jest.mock('./getMarketAmmAccount')
jest.mock('./getMarketClearingAccount')
jest.mock('@play-money/users/lib/getUserPrimaryAccount')
jest.mock('@play-money/finance/lib/executeTransaction')
jest.mock('@play-money/finance/lib/getBalances')

describe('createMarketSellTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.mocked(getUserPrimaryAccount).mockResolvedValue(mockAccount({ id: 'user-1-account' }))
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
  })

  it('should call executeTransaction with approperate entries', async () => {
    jest.mocked(getBalance).mockResolvedValue(
      mockBalance({
        accountId: 'user-1',
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        total: new Decimal(200),
        subtotals: {},
      })
    )
    jest.mocked(getMarketBalances).mockResolvedValue([
      mockBalance({
        accountId: 'ammAccountId',
        assetType: 'MARKET_OPTION',
        assetId: 'option-1',
        total: new Decimal(85.71),
        subtotals: {},
      }),
      mockBalance({
        accountId: 'ammAccountId',
        assetType: 'MARKET_OPTION',
        assetId: 'option-2',
        total: new Decimal(350),
        subtotals: {},
      }),
    ])

    await createMarketSellTransaction({
      initiatorId: 'user-1',
      accountId: 'account-1',
      amount: new Decimal(64.29),
      marketId: 'market-1',
      optionId: 'option-1',
    })

    expect(executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.arrayContaining([
          {
            amount: expect.closeToDecimal(64.29),
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            fromAccountId: 'account-1',
            toAccountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(50),
            assetType: 'MARKET_OPTION',
            assetId: 'option-1',
            fromAccountId: 'amm-1-account',
            toAccountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(50),
            assetType: 'MARKET_OPTION',
            assetId: 'option-2',
            fromAccountId: 'amm-1-account',
            toAccountId: 'EXCHANGER',
          },
          {
            amount: expect.closeToDecimal(50),
            assetType: 'CURRENCY',
            assetId: 'PRIMARY',
            fromAccountId: 'EXCHANGER',
            toAccountId: 'account-1',
          },
        ]),
      })
    )
  })
})
