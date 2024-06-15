import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import { mockAccount } from '@play-money/database/mocks'
import { getUserById } from '@play-money/users/lib/getUserById'
import { createMarketSellTransaction } from './createMarketSellTransaction'
import { createTransaction } from './createTransaction'

// TODO: Cleanup mocks in this file
// TODO: Create accounts for Exchanger

jest.mock('@play-money/accounts/lib/getAmmAccount', () => ({
  getAmmAccount: jest.fn(),
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
    jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
      if (currencyCode === 'YES') return 85.71
      if (currencyCode === 'NO') return 350
      return 0
    })

    jest.mocked(checkAccountBalance).mockResolvedValue(true)
    jest.mocked(getUserById).mockResolvedValue({} as any)

    jest.mocked(getUserAccount).mockResolvedValue(
      mockAccount({
        id: 'user-1-account',
      })
    )

    jest.mocked(getAmmAccount).mockResolvedValue(
      mockAccount({
        id: 'amm-1-account',
      })
    )

    await createMarketSellTransaction({
      userId: 'user-1',
      amount: 64.29,
      sellCurrencyCode: 'YES',
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionItems: expect.arrayContaining([
          {
            amount: expect.closeTo(-64.29, 2),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeTo(64.29, 2),
            currencyCode: 'YES',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeTo(50, 2),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeTo(50, 2),
            currencyCode: 'NO',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeTo(-50, 2),
            currencyCode: 'YES',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeTo(-50, 2),
            currencyCode: 'NO',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeTo(-50, 2),
            currencyCode: 'YES',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeTo(-50, 2),
            currencyCode: 'NO',
            accountId: 'user-1-account',
          },
          {
            amount: expect.closeTo(50, 2),
            currencyCode: 'YES',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeTo(50, 2),
            currencyCode: 'NO',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeTo(-50, 2),
            currencyCode: 'PRIMARY',
            accountId: 'EXCHANGER',
          },
          {
            amount: expect.closeTo(50, 2),
            currencyCode: 'PRIMARY',
            accountId: 'user-1-account',
          },
        ]),
      })
    )
  })
})
