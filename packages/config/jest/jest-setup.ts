const Decimal = require('decimal.js')

declare global {
  namespace jest {
    interface Expect {
      closeToDecimal(expected: string | number, precision?: string | number): void
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
})

export {}
