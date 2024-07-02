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

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k'
  } else {
    return num.toString()
  }
}
