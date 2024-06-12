import Decimal from 'decimal.js'
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to'
import { getAccountBalance } from '@play-money/accounts/lib/getAccountBalance'
import { buy, costToHitProbability, sell } from './maniswap-v1'

// TODO: Move to global d.ts file
declare global {
  namespace jest {
    interface Expect {
      closeToDecimal(expected: string | number, precision?: string | number): CustomMatcherResult
    }
  }
}

expect.extend({ toBeDeepCloseTo, toMatchCloseTo })

jest.mock('@play-money/accounts/lib/getAccountBalance', () => ({
  getAccountBalance: jest.fn(),
}))

describe('maniswap-v1', () => {
  describe('buy', () => {
    it('should return correct transactions for buying YES', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const transactions = await buy({
        fromAccountId: 'user1',
        ammAccountId: 'amm1',
        currencyCode: 'YES',
        amount: new Decimal(50),
      })

      expect(transactions).toEqual([
        { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(-50) },
        { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(-50) },
        { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(50) },
        { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(50) },
        { accountId: 'amm1', currencyCode: 'YES', amount: expect.closeToDecimal(-64.29) },
        { accountId: 'user1', currencyCode: 'YES', amount: expect.closeToDecimal(64.29) },
      ])
    })

    it('should return correct transactions for buying NO', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const transactions = await buy({
        fromAccountId: 'user1',
        ammAccountId: 'amm1',
        currencyCode: 'NO',
        amount: new Decimal(50),
      })

      expect(transactions).toEqual([
        { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(-50) },
        { accountId: 'user1', currencyCode: 'YES', amount: new Decimal(-50) },
        { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(50) },
        { accountId: 'amm1', currencyCode: 'YES', amount: new Decimal(50) },
        { accountId: 'amm1', currencyCode: 'NO', amount: new Decimal(-150) },
        { accountId: 'user1', currencyCode: 'NO', amount: new Decimal(150) },
      ])
    })
  })

  // This is the inverse of the test for buying YES
  it('should return correct transactions for selling YES', async () => {
    // Current probability ~= 0.80
    jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
      if (currencyCode === 'YES') return 85.71
      if (currencyCode === 'NO') return 350
      return 0
    })

    const transactions = await sell({
      fromAccountId: 'user1',
      ammAccountId: 'amm1',
      currencyCode: 'YES',
      amount: 64.29,
    })

    expect(transactions).toMatchCloseTo(
      [
        { accountId: 'user1', currencyCode: 'YES', amount: -64.29 },
        { accountId: 'amm1', currencyCode: 'YES', amount: 64.29 },
        { accountId: 'user1', currencyCode: 'YES', amount: 50 },
        { accountId: 'user1', currencyCode: 'NO', amount: 50 },
        { accountId: 'amm1', currencyCode: 'YES', amount: -50 },
        { accountId: 'amm1', currencyCode: 'NO', amount: -50 },
      ],
      2
    )
  })

  // This is the inverse of the test for buying NO
  it('should return correct transactions for selling NO', async () => {
    // Current probability ~= 0.57
    jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
      if (currencyCode === 'YES') return 150
      if (currencyCode === 'NO') return 200
      return 0
    })

    const transactions = await sell({
      fromAccountId: 'user1',
      ammAccountId: 'amm1',
      currencyCode: 'NO',
      amount: 150,
    })

    expect(transactions).toMatchCloseTo(
      [
        { accountId: 'user1', currencyCode: 'NO', amount: -150 },
        { accountId: 'amm1', currencyCode: 'NO', amount: 150 },
        { accountId: 'user1', currencyCode: 'NO', amount: 50 },
        { accountId: 'user1', currencyCode: 'YES', amount: 50 },
        { accountId: 'amm1', currencyCode: 'NO', amount: -50 },
        { accountId: 'amm1', currencyCode: 'YES', amount: -50 },
      ],
      2
    )
  })

  describe('costToHitProbability', () => {
    it('should return zero cost and returnedShares for same probability', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: new Decimal(0.75),
        maxAmount: new Decimal(100),
      })

      expect(result).toEqual({
        cost: new Decimal(0),
        returnedShares: new Decimal(0),
      })
    })

    it('should return correct cost and returnedShares for increasing probability', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: new Decimal(0.8),
        maxAmount: new Decimal(100),
      })

      expect(result).toEqual({
        cost: expect.closeToDecimal(46.41),
        returnedShares: expect.closeToDecimal(59.81),
      })
    })

    it('should return correct cost and returnedShares for increasing probability to max', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: new Decimal(0.99),
        maxAmount: new Decimal(100),
      })

      expect(result).toEqual({
        cost: expect.closeToDecimal(100),
        returnedShares: expect.closeToDecimal(125),
      })
    })

    it('should return correct cost and returnedShares for decreasing probability', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: new Decimal(0.5),
        maxAmount: new Decimal(100),
      })

      expect(result).toEqual({
        cost: expect.closeToDecimal(73.21),
        returnedShares: expect.closeToDecimal(200),
      })
    })

    it('should return correct cost and returnedShares for decreasing probability to max', async () => {
      // Current probability = 0.75
      jest.mocked(getAccountBalance).mockImplementation(async (accountId, currencyCode) => {
        if (currencyCode === 'YES') return new Decimal(100)
        if (currencyCode === 'NO') return new Decimal(300)
        return new Decimal(0)
      })

      const result = await costToHitProbability({
        ammAccountId: 'amm1',
        probability: new Decimal(0.25),
        maxAmount: new Decimal(100),
      })

      expect(result).toEqual({
        cost: expect.closeToDecimal(100),
        returnedShares: expect.closeToDecimal(250),
      })
    })
  })
})
