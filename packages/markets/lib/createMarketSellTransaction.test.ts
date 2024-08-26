import Decimal from 'decimal.js'
import '@play-money/config/jest/jest-setup'
import { mockAccount, mockBalance, mockMarketOptionPosition } from '@play-money/database/mocks'
import * as ECONOMY from '@play-money/finance/economy'
import { executeTransaction } from '@play-money/finance/lib/executeTransaction'
import { getMarketBalances, getBalance } from '@play-money/finance/lib/getBalances'
import { getHouseAccount } from '@play-money/finance/lib/getHouseAccount'
import { getMarketOptionPosition } from '@play-money/users/lib/getMarketOptionPosition'
import { getUserPrimaryAccount } from '@play-money/users/lib/getUserPrimaryAccount'
import { createMarketSellTransaction } from './createMarketSellTransaction'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

// TODO: Test for unrealized gains
Object.defineProperty(ECONOMY, 'REALIZED_GAINS_TAX', { value: 0 })

jest.mock('./getMarketAmmAccount')
jest.mock('./getMarketClearingAccount')
jest.mock('@play-money/users/lib/getUserPrimaryAccount')
jest.mock('@play-money/finance/lib/executeTransaction')
jest.mock('@play-money/finance/lib/getBalances')
jest.mock('@play-money/finance/lib/getHouseAccount')
jest.mock('@play-money/users/lib/getMarketOptionPosition')

describe('createMarketSellTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.mocked(getUserPrimaryAccount).mockResolvedValue(mockAccount({ id: 'user-1-account' }))
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
  })

  it('should call executeTransaction with approperate entries', async () => {
    jest.mocked(getMarketOptionPosition).mockResolvedValue(
      mockMarketOptionPosition({
        accountId: 'account-1',
        optionId: 'option-1',
      })
    )
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
