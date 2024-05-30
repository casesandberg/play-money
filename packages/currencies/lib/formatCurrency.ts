export function formatCurrency(value: number, currencySymbol: string, decimals = 0): string {
  const options = {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }

  return new Intl.NumberFormat('en-US', options).format(value).replace('$', currencySymbol)
}
