import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import { getHouseAccount } from '@play-money/accounts/lib/getHouseAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import '@play-money/config/jest/jest-setup'
import { mockAccount, mockMarketOption } from '@play-money/database/mocks'
import { getMarketOption } from '@play-money/markets/lib/getMarketOption'
import { createMarketBuyTransaction } from './createMarketBuyTransaction'
import { createTransaction } from './createTransaction'

jest.mock('@play-money/accounts/lib/getHouseAccount', () => ({ getHouseAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getAmmAccount', () => ({ getAmmAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getExchangerAccount', () => ({ getExchangerAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getUserAccount', () => ({ getUserAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getAccountBalance', () => ({ getAccountBalance: jest.fn() }))
jest.mock('@play-money/accounts/lib/checkAccountBalance', () => ({ checkAccountBalance: jest.fn() }))
jest.mock('@play-money/markets/lib/getMarketOption', () => ({ getMarketOption: jest.fn() }))
jest.mock('./createTransaction', () => ({ createTransaction: jest.fn() }))

describe('createMarketBuyTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createTransaction with approperate transactionItems', async () => {
    jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
      if (currencyCode === 'YES') return new Decimal(100)
      if (currencyCode === 'NO') return new Decimal(300)
      return new Decimal(0)
    })

    jest.mocked(checkAccountBalance).mockImplementation(async ({ accountId, amount }) => {
      if (accountId === 'user-1-account' && amount.equals(50)) return true
      return false
    })

    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
    jest.mocked(getUserAccount).mockResolvedValue(mockAccount({ id: 'user-1-account' }))
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getMarketOption).mockResolvedValue(mockMarketOption({ id: 'option-1' }))

    await createMarketBuyTransaction({
      userId: 'user-1',
      amount: new Decimal(50),
      marketId: 'market-1',
      optionId: 'option-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionItems: expect.arrayContaining([
          {
            amount: new Decimal(-50),
            currencyCode: 'PRIMARY',
            accountId: 'user-1-account',
          },
          {
            amount: new Decimal(50),
            currencyCode: 'PRIMARY',
            accountId: 'EXCHANGER',
          },
          {
            amount: new Decimal(-50),
            currencyCode: 'YES',
            accountId: 'EXCHANGER',
          },
          {
            amount: new Decimal(-50),
            currencyCode: 'NO',
            accountId: 'EXCHANGER',
          },
          {
            amount: new Decimal(50),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: new Decimal(50),
            currencyCode: 'NO',
            accountId: 'user-1-account',
          },
          {
            amount: new Decimal(-50),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: new Decimal(-50),
            currencyCode: 'NO',
            accountId: 'user-1-account',
          },
          {
            amount: new Decimal(50),
            currencyCode: 'YES',
            accountId: 'amm-1-account',
          },
          {
            amount: new Decimal(50),
            currencyCode: 'NO',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(-64.29),
            currencyCode: 'YES',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(64.29),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
        ]),
      })
    )
  })
})
