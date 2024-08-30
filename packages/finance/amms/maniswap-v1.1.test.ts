import Decimal from 'decimal.js'
import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to'
import '@play-money/config/jest/jest-setup'
import { addLiquidity, trade, quote, calculateProbability } from './maniswap-v1.1'

expect.extend({ toBeDeepCloseTo, toMatchCloseTo })

jest.mock('@play-money/markets/lib/getMarketOption', () => ({ getMarketOption: jest.fn() }))

describe('maniswap-v1.1', () => {
  describe('trade', () => {
    test.each([
      { targetShare: 100, shares: [100, 300], expected: 64.29 },
      { targetShare: 100, shares: [100, 400, 400, 400], expected: 79.76 },
      { targetShare: 100, shares: [100, 400, 400, 400, 400, 400, 400, 400, 400], expected: 111.02 },
    ])(
      'should return $expected for buying high targetShare: $targetShare of shares: $shares',
      async ({ targetShare, shares, expected }) => {
        // Current probability = 0.75
        const amount = await trade({
          amount: new Decimal(50),
          targetShare: new Decimal(targetShare),
          shares: shares.map((share) => new Decimal(share)),
          isBuy: true,
        })

        expect(amount).toBeCloseToDecimal(expected)
      }
    )

    test.each([
      { targetShare: 300, shares: [100, 300], expected: 150 },
      { targetShare: 400, shares: [100, 400, 400, 400], expected: 239.3 },
      { targetShare: 400, shares: [100, 400, 400, 400, 400, 400, 400, 400, 400], expected: 333.07 },
    ])(
      'should return $expected for buying low targetShare: $targetShare of shares: $shares',
      async ({ targetShare, shares, expected }) => {
        // Current probability = 0.75
        const amount = await trade({
          amount: new Decimal(50),
          targetShare: new Decimal(targetShare),
          shares: shares.map((share) => new Decimal(share)),
          isBuy: true,
        })

        expect(amount).toBeCloseToDecimal(expected)
      }
    )

    // This is the inverse of the test for buying high
    test.each([
      { targetShare: 85.71, shares: [85.71, 350], expected: 50 },
      { targetShare: 85.71, shares: [85.71, 400, 400, 400], expected: 36.13 },
      { targetShare: 85.71, shares: [85.71, 400, 400, 400, 400, 400, 400, 400, 400], expected: 20.21 },
    ])(
      'should return $expected for selling high targetShare: $targetShare of shares: $shares',
      async ({ targetShare, shares, expected }) => {
        // Current probability = 0.75
        const amount = await trade({
          amount: new Decimal(64.29),
          targetShare: new Decimal(targetShare),
          shares: shares.map((share) => new Decimal(share)),
          isBuy: false,
        })

        expect(amount).toBeCloseToDecimal(expected)
      }
    )

    // This is the inverse of the test for buying low
    test.each([
      { targetShare: 200, shares: [150, 200], expected: 50 },
      { targetShare: 200, shares: [150, 200, 450, 450], expected: 36.58 },
      { targetShare: 200, shares: [150, 200, 450, 450, 450, 450, 450, 450, 450], expected: 21.45 },
    ])(
      'should return $expected for selling low targetShare: $targetShare of shares: $shares',
      async ({ targetShare, shares, expected }) => {
        // Current probability = 0.75
        const amount = await trade({
          amount: new Decimal(150),
          targetShare: new Decimal(targetShare),
          shares: shares.map((share) => new Decimal(share)),
          isBuy: false,
        })

        expect(amount).toBeCloseToDecimal(expected)
      }
    )
  })

  describe('quote', () => {
    it('should return correct quote for buying YES shares', async () => {
      const result = await quote({
        amount: new Decimal(50),
        probability: new Decimal(0.99),
        targetShare: new Decimal(100),
        shares: [new Decimal(100), new Decimal(300)],
      })

      expect(result.probability).toBeCloseToDecimal(0.8)
      expect(result.shares).toBeCloseToDecimal(64.29)
    })

    it('should return correct quote for selling YES shares', async () => {
      const result = await quote({
        amount: new Decimal(64.29),
        probability: new Decimal(0.01),
        targetShare: new Decimal(85.71),
        shares: [new Decimal(85.71), new Decimal(350)],
      })

      expect(result.probability).toBeCloseToDecimal(0.75)
      expect(result.shares).toBeCloseToDecimal(50)
    })

    it('should return correct quote for buying NO shares', async () => {
      const result = await quote({
        amount: new Decimal(50),
        probability: new Decimal(0.99),
        targetShare: new Decimal(300),
        shares: [new Decimal(100), new Decimal(300)],
      })
      expect(result.probability).toBeCloseToDecimal(0.42)
      expect(result.shares).toBeCloseToDecimal(150)
    })

    it('should return correct quote for selling NO shares', async () => {
      const result = await quote({
        amount: new Decimal(150),
        probability: new Decimal(0.01),
        targetShare: new Decimal(200),
        shares: [new Decimal(150), new Decimal(200)],
      })
      expect(result.probability).toBeCloseToDecimal(0.25)
      expect(result.shares).toBeCloseToDecimal(50)
    })

    it('should return zero cost and returnedShares for same probability', async () => {
      // Current probability = 0.75
      const result = await quote({
        amount: new Decimal(100),
        probability: new Decimal(0.75),
        targetShare: new Decimal(100),
        shares: [new Decimal(100), new Decimal(300)],
      })

      expect(result.probability).toBeCloseToDecimal(0.75)
      expect(result.shares).toBeCloseToDecimal(0)
      expect(result.cost).toBeCloseToDecimal(0)
    })

    it('should return correct cost and returnedShares for increasing probability', async () => {
      // Current probability = 0.75
      const result = await quote({
        amount: new Decimal(100),
        probability: new Decimal(0.8),
        targetShare: new Decimal(100),
        shares: [new Decimal(100), new Decimal(300)],
      })

      expect(result.probability).toBeCloseToDecimal(0.8)
      expect(result.shares).toBeCloseToDecimal(59.81)
      expect(result.cost).toBeCloseToDecimal(46.41)
    })

    it('should return correct cost and returnedShares for increasing probability to max', async () => {
      // Current probability = 0.75
      const result = await quote({
        amount: new Decimal(100),
        probability: new Decimal(0.99),
        targetShare: new Decimal(100),
        shares: [new Decimal(100), new Decimal(300)],
      })

      expect(result.probability).toBeCloseToDecimal(0.84)
      expect(result.shares).toBeCloseToDecimal(125)
      expect(result.cost).toBeCloseToDecimal(100)
    })

    it('should return correct cost and returnedShares for decreasing probability', async () => {
      // Current probability = 0.8
      const result = await quote({
        amount: new Decimal(64.29),
        probability: new Decimal(0.5),
        targetShare: new Decimal(85.71),
        shares: [new Decimal(85.71), new Decimal(350)],
      })

      expect(result.probability).toBeCloseToDecimal(0.75)
      expect(result.shares).toBeCloseToDecimal(50)
      expect(result.cost).toBeCloseToDecimal(64.29)
    })

    it('should return correct cost and returnedShares for decreasing probability to max', async () => {
      // Current probability = 0.75
      const result = await quote({
        amount: new Decimal(100),
        probability: new Decimal(0.25),
        targetShare: new Decimal(100),
        shares: [new Decimal(100), new Decimal(300)],
      })

      expect(result.probability).toBeCloseToDecimal(0.63)
      expect(result.shares).toBeCloseToDecimal(69.72)
      expect(result.cost).toBeCloseToDecimal(100)
    })

    it('should return correct quote for buying option in multiple choice', async () => {
      const result = await quote({
        amount: new Decimal(50),
        probability: new Decimal(0.99),
        targetShare: new Decimal(200),
        shares: [new Decimal(200), new Decimal(200), new Decimal(200)],
      })

      expect(result.probability).toBeCloseToDecimal(0.59)
      expect(result.shares).toBeCloseToDecimal(122)
    })

    // Inverse of previous buy
    it('should return correct quote for selling option in multiple choice', async () => {
      const result = await quote({
        amount: new Decimal(116.66),
        probability: new Decimal(0.01),
        targetShare: new Decimal(128),
        shares: [new Decimal(128), new Decimal(250), new Decimal(250)],
      })

      expect(result.probability).toBeCloseToDecimal(0.34)
      expect(result.shares).toBeCloseToDecimal(48.2)
    })
  })

  describe('addLiquidity', () => {
    it('should correctly add liquidity to a balanced market', async () => {
      const result = await addLiquidity({
        amount: new Decimal(50),
        options: [
          {
            shares: new Decimal(400),
            liquidityProbability: new Decimal(0.5),
          },
          {
            shares: new Decimal(400),
            liquidityProbability: new Decimal(0.5),
          },
        ],
      })

      expect(result).toEqual([
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.5) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.5) },
      ])
    })

    it('should correctly add liquidity to an imbalanced market', async () => {
      const result = await addLiquidity({
        amount: new Decimal(50),
        options: [
          {
            shares: new Decimal(100),
            liquidityProbability: new Decimal(0.3),
          },
          {
            shares: new Decimal(300),
            liquidityProbability: new Decimal(0.7),
          },
        ],
      })

      expect(result).toEqual([
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.25) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.75) },
      ])
    })

    it('should correctly add liquidity to a balanced 4 option market', async () => {
      const result = await addLiquidity({
        amount: new Decimal(50),
        options: [
          {
            shares: new Decimal(1000),
            liquidityProbability: new Decimal(0.25),
          },
          {
            shares: new Decimal(1000),
            liquidityProbability: new Decimal(0.25),
          },
          {
            shares: new Decimal(1000),
            liquidityProbability: new Decimal(0.25),
          },
          {
            shares: new Decimal(1000),
            liquidityProbability: new Decimal(0.25),
          },
        ],
      })

      expect(result).toEqual([
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.25) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.25) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.25) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.25) },
      ])
    })

    it('should correctly add liquidity to an imbalanced 4 option market', async () => {
      const result = await addLiquidity({
        amount: new Decimal(50),
        options: [
          {
            shares: new Decimal(100),
            liquidityProbability: new Decimal(0.25),
          },
          {
            shares: new Decimal(300),
            liquidityProbability: new Decimal(0.25),
          },
          {
            shares: new Decimal(300),
            liquidityProbability: new Decimal(0.25),
          },
          {
            shares: new Decimal(300),
            liquidityProbability: new Decimal(0.25),
          },
        ],
      })

      expect(result).toEqual([
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.205) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.265) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.265) },
        { newShares: expect.closeToDecimal(50), liquidityProbability: expect.closeToDecimal(0.265) },
      ])
    })
  })

  describe('calculateProbability', () => {
    const testCases = [
      { index: 0, shares: [100, 300], expected: 0.75 },
      { index: 0, shares: [200, 200], expected: 0.5 },
      { index: 0, shares: [200, 200, 200], expected: 0.3333 },
      { index: 0, shares: [44.45, 200, 200], expected: 0.8 },
      { index: 0, shares: [200, 200, 200, 200], expected: 0.25 },
      { index: 0, shares: [31.02, 300, 300, 300], expected: 0.9 },
    ]

    test.each(testCases)(
      'calculates probability correctly for index: $index, shares: $shares',
      ({ index, shares, expected }) => {
        const result = calculateProbability({ index, shares })
        expect(result.toNumber()).toBeCloseTo(expected, 4)
      }
    )
  })
})
