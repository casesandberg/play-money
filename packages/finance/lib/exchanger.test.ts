import Decimal from 'decimal.js'
import { mockAccount } from '@play-money/database/mocks'
import { getAssetBalance, getBalances } from '@play-money/finance/lib/getBalances'
import { getMarketClearingAccount } from '@play-money/markets/lib/getMarketClearingAccount'
import { convertMarketSharesToPrimary, convertPrimaryToMarketShares } from './exchanger'
import { getHouseAccount } from './getHouseAccount'

jest.mock('@play-money/finance/lib/getBalances', () => ({ getBalances: jest.fn(), getAssetBalance: jest.fn() }))
jest.mock('@play-money/finance/lib/getHouseAccount', () => ({ getHouseAccount: jest.fn() }))
jest.mock('@play-money/markets/lib/getMarketClearingAccount', () => ({ getMarketClearingAccount: jest.fn() }))

describe('convertPrimaryToMarketShares', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
    jest.mocked(getHouseAccount).mockResolvedValue(mockAccount({ id: 'HOUSE' }))
  })

  it('throws an error if the amount is less than or equal to 0', async () => {
    await expect(
      convertPrimaryToMarketShares({
        fromAccountId: 'user-1',
        amount: new Decimal(0),
        marketId: 'market-1',
      })
    ).rejects.toThrow('Exchange amount must be greater than 0')
  })

  it('throws an error if user does not have enough primary balance and is not the house account', async () => {
    jest.mocked(getAssetBalance).mockResolvedValue({
      accountId: 'user-1',
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      amount: new Decimal(10),
      subtotals: {},
    })

    await expect(
      convertPrimaryToMarketShares({
        fromAccountId: 'user-1',
        amount: new Decimal(20),
        marketId: 'market-1',
      })
    ).rejects.toThrow('User does not have enough balance.')
  })

  it('allows conversion if the user has exactly enough primary balance', async () => {
    jest.mocked(getAssetBalance).mockResolvedValue({
      accountId: 'user-1',
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      amount: new Decimal(20),
      subtotals: {},
    })

    const result = await convertPrimaryToMarketShares({
      fromAccountId: 'user-1',
      amount: new Decimal(20),
      marketId: 'market-1',
    })

    expect(result).toEqual([
      {
        accountId: 'user-1',
        currencyCode: 'PRIMARY',
        amount: new Decimal(-20),
      },
      {
        accountId: 'EXCHANGER',
        currencyCode: 'PRIMARY',
        amount: new Decimal(20),
      },
      {
        accountId: 'EXCHANGER',
        currencyCode: 'YES',
        amount: new Decimal(-20),
      },
      {
        accountId: 'EXCHANGER',
        currencyCode: 'NO',
        amount: new Decimal(-20),
      },
      {
        accountId: 'user-1',
        currencyCode: 'YES',
        amount: new Decimal(20),
      },
      {
        accountId: 'user-1',
        currencyCode: 'NO',
        amount: new Decimal(20),
      },
    ])
  })

  it('allows conversion if the from account is the house account, even with insufficient balance', async () => {
    jest.mocked(getAssetBalance).mockResolvedValue({
      accountId: 'user-1',
      assetType: 'CURRENCY',
      assetId: 'PRIMARY',
      amount: new Decimal(5),
      subtotals: {},
    })

    const result = await convertPrimaryToMarketShares({
      fromAccountId: 'HOUSE',
      amount: new Decimal(20),
      marketId: 'market-1',
    })

    expect(result).toEqual([
      {
        accountId: 'HOUSE',
        currencyCode: 'PRIMARY',
        amount: new Decimal(-20),
      },
      {
        accountId: 'EXCHANGER',
        currencyCode: 'PRIMARY',
        amount: new Decimal(20),
      },
      {
        accountId: 'EXCHANGER',
        currencyCode: 'YES',
        amount: new Decimal(-20),
      },
      {
        accountId: 'EXCHANGER',
        currencyCode: 'NO',
        amount: new Decimal(-20),
      },
      {
        accountId: 'HOUSE',
        currencyCode: 'YES',
        amount: new Decimal(20),
      },
      {
        accountId: 'HOUSE',
        currencyCode: 'NO',
        amount: new Decimal(20),
      },
    ])
  })
})

describe('convertMarketSharesToPrimary', () => {
  const mockExchangerAccount = { id: 'exchanger-account-id' }

  beforeEach(() => {
    jest.resetAllMocks()

    jest.mocked(getMarketClearingAccount).mockResolvedValue(mockAccount({ id: 'EXCHANGER' }))
  })

  it('throws an error if the amount is less than or equal to 0', async () => {
    await expect(
      convertMarketSharesToPrimary({
        fromAccountId: 'user-1',
        amount: new Decimal(0),
        marketId: 'market-id-1',
      })
    ).rejects.toThrow('Exchange amount must be greater than 0')
  })

  it('throws an error if user does not have enough shares and inflight transactions do not cover it', async () => {
    jest.mocked(getBalances).mockResolvedValue([
      { assetType: 'MARKET_OPTION', amount: new Decimal(10), accountId: 'user-1', assetId: 'option-1', subtotals: {} },
      { assetType: 'MARKET_OPTION', amount: new Decimal(10), accountId: 'user-1', assetId: 'option-2', subtotals: {} },
    ])

    await expect(
      convertMarketSharesToPrimary({
        fromAccountId: 'user-1',
        amount: new Decimal(25),
        marketId: 'market-id-1',
      })
    ).rejects.toThrow('User does not have enough shares.')
  })

  it('does not throw an error if inflight transactions cover the insufficient balance', async () => {
    jest.mocked(getBalances).mockResolvedValue([
      { assetType: 'MARKET_OPTION', amount: new Decimal(30), accountId: 'user-1', assetId: 'option-1', subtotals: {} },
      { assetType: 'MARKET_OPTION', amount: new Decimal(0), accountId: 'user-1', assetId: 'option-2', subtotals: {} },
    ])

    const inflightTransactionItems = [
      { accountId: 'user-1', currencyCode: 'YES' as const, amount: new Decimal(-10) },
      { accountId: 'user-1', currencyCode: 'NO' as const, amount: new Decimal(20) },
    ]

    const result = await convertMarketSharesToPrimary({
      fromAccountId: 'user-1',
      amount: new Decimal(20),
      marketId: 'market-id-1',
      inflightTransactionItems,
    })

    expect(result).toEqual([
      { accountId: 'user-1', currencyCode: 'YES', amount: new Decimal(-20) },
      { accountId: 'user-1', currencyCode: 'NO', amount: new Decimal(-20) },
      { accountId: 'EXCHANGER', currencyCode: 'YES', amount: new Decimal(20) },
      { accountId: 'EXCHANGER', currencyCode: 'NO', amount: new Decimal(20) },
      { accountId: 'user-1', currencyCode: 'PRIMARY', amount: new Decimal(20) },
      { accountId: 'EXCHANGER', currencyCode: 'PRIMARY', amount: new Decimal(-20) },
    ])
  })
})
