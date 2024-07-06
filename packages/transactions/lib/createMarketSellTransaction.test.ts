import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import '@play-money/config/jest/jest-setup'
import { mockAccount } from '@play-money/database/mocks'
import { getUserById } from '@play-money/users/lib/getUserById'
import { createMarketSellTransaction } from './createMarketSellTransaction'
import { createTransaction } from './createTransaction'

// TODO: Cleanup mocks in this file

jest.mock('@play-money/accounts/lib/getAmmAccount', () => ({
  getAmmAccount: jest.fn(),
}))

jest.mock('@play-money/accounts/lib/getExchangerAccount', () => ({
  getExchangerAccount: jest.fn(),
}))

jest.mock('@play-money/accounts/lib/getUserAccount', () => ({
  getUserAccount: jest.fn(),
}))

jest.mock('@play-money/users/lib/getUserById', () => ({
  getUserById: jest.fn(),
}))

jest.mock('@play-money/accounts/lib/getAccountBalance', () => ({
  getAccountBalance: jest.fn(),
}))

jest.mock('@play-money/accounts/lib/checkAccountBalance', () => ({
  checkAccountBalance: jest.fn(),
}))

jest.mock('./createTransaction', () => ({
  createTransaction: jest.fn(),
}))

describe('createMarketSellTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createTransaction with approperate transactionItems', async () => {
    jest.mocked(getAccountBalance).mockImplementation(async ({ currencyCode }) => {
      if (currencyCode === 'YES') return new Decimal(85.71)
      if (currencyCode === 'NO') return new Decimal(350)
      return new Decimal(0)
    })

    jest.mocked(checkAccountBalance).mockResolvedValue(true)
    jest.mocked(getUserById).mockResolvedValue({} as any)

    jest.mocked(getUserAccount).mockResolvedValue(
      mockAccount({
        id: 'user-1-account',
      })
    )

    jest.mocked(getExchangerAccount).mockResolvedValue(
      mockAccount({
        id: 'EXCHANGER',
      })
    )

    jest.mocked(getAmmAccount).mockResolvedValue(
      mockAccount({
        id: 'amm-1-account',
      })
    )

    await createMarketSellTransaction({
      userId: 'user-1',
      amount: new Decimal(64.29),
      sellCurrencyCode: 'YES',
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
