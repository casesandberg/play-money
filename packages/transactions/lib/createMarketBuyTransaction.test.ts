import { mockMarket } from '@play-money/database/mocks'
import { getMarket } from '@play-money/markets/lib/getMarket'
import { getUserById } from '@play-money/users/lib/getUserById'
import { createMarketBuyTransaction } from './createMarketBuyTransaction'
import { createTransaction } from './createTransaction'
import { checkUserBalance } from './getUserBalances'

// TODO: Cleanup mocks in this file

jest.mock('@play-money/markets/lib/getMarket', () => ({
  getMarket: jest.fn(),
}))

jest.mock('@play-money/users/lib/getUserById', () => ({
  getUserById: jest.fn(),
}))

jest.mock('./getUserBalances', () => ({
  checkUserBalance: jest.fn(),
}))

jest.mock('./createTransaction', () => ({
  createTransaction: jest.fn(),
}))

describe('createMarketBuyTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createTransaction with approperate transactionItems', async () => {
    jest.mocked(checkUserBalance).mockResolvedValue(true)
    jest.mocked(getUserById).mockResolvedValue({} as any)

    jest.mocked(getMarket).mockResolvedValue(
      mockMarket({
        id: 'market-1',
        ammId: 'amm-1',
      })
    )

    await createMarketBuyTransaction({
      userId: 'user-1',
      amount: 50,
      purchaseCurrencyCode: 'YES',
      marketId: 'market-1',
    })

    expect(createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionItems: expect.arrayContaining([
          {
            amount: -50,
            currencyCode: 'PRIMARY',
            userId: 'user-1',
          },
          {
            amount: 50,
            currencyCode: 'PRIMARY',
            userId: 'EXCHANGER',
          },
          {
            amount: -50,
            currencyCode: 'YES',
            userId: 'EXCHANGER',
          },
          {
            amount: -50,
            currencyCode: 'NO',
            userId: 'EXCHANGER',
          },
          {
            amount: 50,
            currencyCode: 'YES',
            userId: 'amm-1',
          },
          {
            amount: 50,
            currencyCode: 'NO',
            userId: 'amm-1',
          },
          {
            amount: 50,
            currencyCode: 'YES',
            userId: 'user-1',
          },
          {
            amount: -50,
            currencyCode: 'YES',
            userId: 'amm-1',
          },
        ]),
      })
    )
  })
})
