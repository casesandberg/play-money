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
