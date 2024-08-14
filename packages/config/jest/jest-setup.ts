import Decimal from 'decimal.js'

declare global {
  namespace jest {
    interface Expect {
      closeToDecimal(expected: string | number, precision?: string | number): CustomMatcherResult
    }
    interface Matchers<R> {
      toBeCloseToDecimal(expected: Decimal.Value, precision?: Decimal.Value): R
    }
  }
}

expect.extend({
  closeToDecimal(received, expected, precision = 0.01) {
    const receivedDecimal = new Decimal(received)
    const expectedDecimal = new Decimal(expected)
    const pass = receivedDecimal.minus(expectedDecimal).abs().lessThanOrEqualTo(new Decimal(precision))

    if (pass) {
      return {
        message: () =>
          `expected ${receivedDecimal.toString()} not to be close to ${expectedDecimal.toString()} within precision ${precision}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${receivedDecimal.toString()} to be close to ${expectedDecimal.toString()} within precision ${precision}`,
        pass: false,
      }
    }
  },
  toBeCloseToDecimal(received: unknown, expected: Decimal.Value, precision: Decimal.Value = 0.01) {
    const receivedDecimal = new Decimal(received as Decimal.Value)
    const expectedDecimal = new Decimal(expected)
    const precisionDecimal = new Decimal(precision)

    const pass = receivedDecimal.minus(expectedDecimal).abs().lessThanOrEqualTo(precisionDecimal)
    const message = pass
      ? () =>
          `expected ${receivedDecimal.toString()} not to be close to ${expectedDecimal.toString()} within precision ${precisionDecimal.toString()}`
      : () =>
          `expected ${receivedDecimal.toString()} to be close to ${expectedDecimal.toString()} within precision ${precisionDecimal.toString()}`

    return { pass, message }
  },
})

export {}
