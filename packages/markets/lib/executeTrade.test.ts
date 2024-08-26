import Decimal from 'decimal.js'
import { mockAccount, mockBalance } from '@play-money/database/mocks'
import { getBalance, getMarketBalances } from '@play-money/finance/lib/getBalances'
import { executeTrade } from './executeTrade'
import { getMarketAmmAccount } from './getMarketAmmAccount'
import { getMarketClearingAccount } from './getMarketClearingAccount'

declare global {
  namespace jest {
    interface Expect {
      closeToDecimal(expected: string | number, precision?: string | number): CustomMatcherResult
    }
  }
}

jest.mock('./getMarketAmmAccount')
jest.mock('./getMarketClearingAccount')
jest.mock('@play-money/finance/lib/getBalances')

describe('executeTrade', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if the user does not have enough balance to purchase', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'ammAccountId' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'clearingAccountId' }))
    jest.mocked(getBalance).mockResolvedValue(
      mockBalance({
        accountId: 'user-account-1',
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        total: new Decimal(50),
        subtotals: {},
      })
    )
    jest.mocked(getMarketBalances).mockResolvedValue([
      mockBalance({
        accountId: 'ammAccountId',
        assetType: 'MARKET_OPTION',
        assetId: 'optionId',
        total: new Decimal(100),
        subtotals: {},
      }),
    ])

    await expect(
      executeTrade({
        accountId: 'user1',
        amount: new Decimal(100),
        marketId: 'market1',
        optionId: 'optionId',
        isBuy: true,
      })
    ).rejects.toThrow()
  })

  it('throws an error if the option to buy is not found', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'ammAccountId' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'clearingAccountId' }))
    jest.mocked(getBalance).mockResolvedValue(
      mockBalance({
        accountId: 'user-account-1',
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        total: new Decimal(200),
        subtotals: {},
      })
    )
    jest.mocked(getMarketBalances).mockResolvedValue([]) // No matching option

    await expect(
      executeTrade({
        accountId: 'user1',
        amount: new Decimal(100),
        marketId: 'market1',
        optionId: 'optionId',
        isBuy: true,
      })
    ).rejects.toThrow()
  })

  it('returns transaction entries for a successful trade', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'ammAccountId' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'clearingAccountId' }))
    jest.mocked(getBalance).mockResolvedValue(
      mockBalance({
        accountId: 'user-account-1',
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
        total: new Decimal(1000),
        subtotals: {},
      }),
      mockBalance({
        accountId: 'ammAccountId',
        assetType: 'MARKET_OPTION',
        assetId: 'option-2',
        total: new Decimal(1000),
        subtotals: {},
      }),
    ])

    const result = await executeTrade({
      accountId: 'user-account-1',
      amount: new Decimal(100),
      marketId: 'market-1',
      optionId: 'option-1',
      isBuy: true,
    })

    expect(result).toEqual([
      {
        amount: new Decimal(100),
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        fromAccountId: 'user-account-1',
        toAccountId: 'clearingAccountId',
      },
      {
        amount: new Decimal(100),
        assetType: 'MARKET_OPTION',
        assetId: 'option-1',
        fromAccountId: 'clearingAccountId',
        toAccountId: 'ammAccountId',
      },
      {
        amount: new Decimal(100),
        assetType: 'MARKET_OPTION',
        assetId: 'option-2',
        fromAccountId: 'clearingAccountId',
        toAccountId: 'ammAccountId',
      },
      {
        amount: expect.closeToDecimal(190.9),
        assetType: 'MARKET_OPTION',
        assetId: 'option-1',
        fromAccountId: 'ammAccountId',
        toAccountId: 'user-account-1',
      },
    ])
  })

  it('returns transaction entries for a successful trade sell', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'ammAccountId' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'clearingAccountId' }))
    jest.mocked(getBalance).mockResolvedValue(
      mockBalance({
        accountId: 'user-account-1',
        assetType: 'MARKET_OPTION',
        assetId: 'option-1',
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

    const result = await executeTrade({
      accountId: 'user-account-1',
      amount: new Decimal(64.29),
      marketId: 'market-1',
      optionId: 'option-1',
      isBuy: false,
    })

    expect(result).toEqual([
      {
        amount: expect.closeToDecimal(64.29),
        assetType: 'MARKET_OPTION',
        assetId: 'option-1',
        fromAccountId: 'user-account-1',
        toAccountId: 'ammAccountId',
      },
      {
        amount: expect.closeToDecimal(50),
        assetType: 'MARKET_OPTION',
        assetId: 'option-1',
        fromAccountId: 'ammAccountId',
        toAccountId: 'clearingAccountId',
      },
      {
        amount: expect.closeToDecimal(50),
        assetType: 'MARKET_OPTION',
        assetId: 'option-2',
        fromAccountId: 'ammAccountId',
        toAccountId: 'clearingAccountId',
      },
      {
        amount: expect.closeToDecimal(50),
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        fromAccountId: 'clearingAccountId',
        toAccountId: 'user-account-1',
      },
    ])
  })

  it('throws an error if market balances are empty', async () => {
    jest.mocked(getMarketAmmAccount).mockResolvedValue(mockAccount({ id: 'ammAccountId' }))
    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'clearingAccountId' }))
    jest.mocked(getBalance).mockResolvedValue(
      mockBalance({
        accountId: 'user-account-1',
        assetType: 'CURRENCY',
        assetId: 'PRIMARY',
        total: new Decimal(200),
        subtotals: {},
      })
    )
    jest.mocked(getMarketBalances).mockResolvedValue([])

    await expect(
      executeTrade({
        accountId: 'user1',
        amount: new Decimal(100),
        marketId: 'market1',
        optionId: 'optionId',
        isBuy: true,
      })
    ).rejects.toThrow()
  })
})
