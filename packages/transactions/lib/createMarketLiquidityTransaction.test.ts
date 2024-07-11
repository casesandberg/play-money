import Decimal from 'decimal.js'
import { checkAccountBalance } from '@play-money/accounts/lib/checkAccountBalance'
import { getAmmAccount } from '@play-money/accounts/lib/getAmmAccount'
import { getExchangerAccount } from '@play-money/accounts/lib/getExchangerAccount'
import { getUserAccount } from '@play-money/accounts/lib/getUserAccount'
import '@play-money/config/jest/jest-setup'
import { mockAccount } from '@play-money/database/mocks'
import { createMarketLiquidityTransaction } from './createMarketLiquidityTransaction'
import { createTransaction } from './createTransaction'

jest.mock('@play-money/accounts/lib/getAmmAccount', () => ({ getAmmAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getExchangerAccount', () => ({ getExchangerAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/getUserAccount', () => ({ getUserAccount: jest.fn() }))
jest.mock('@play-money/accounts/lib/checkAccountBalance', () => ({ checkAccountBalance: jest.fn() }))
jest.mock('./createTransaction', () => ({ createTransaction: jest.fn() }))

describe('createMarketLiquidityTransaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call createTransaction with approperate transactionItems', async () => {
    jest.mocked(checkAccountBalance).mockImplementation(async ({ accountId, amount }) => {
      if (accountId === 'user-1-account' && amount.equals(50)) return true
      return false
    })

    jest.mocked(getUserAccount).mockResolvedValue(mockAccount({ id: 'user-1-account' }))
    jest.mocked(getAmmAccount).mockResolvedValue(mockAccount({ id: 'amm-1-account' }))
    jest.mocked(getExchangerAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))

    await createMarketLiquidityTransaction({
      userId: 'user-1',
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
          {
            amount: expect.closeToDecimal(-50),
            currencyCode: 'LPB',
            accountId: 'amm-1-account',
          },
          {
            amount: expect.closeToDecimal(50),
            currencyCode: 'LPB',
            accountId: 'user-1-account',
          },
        ]),
      })
    )
  })
})
