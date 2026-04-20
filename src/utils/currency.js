import { CURRENCIES } from './constants'

export function toINR(amount, currency) {
  const converter = CURRENCIES[currency]
  if (!converter) throw new Error(`Unknown currency: ${currency}`)
  return converter.toINR(Number(amount))
}

export function formatINR(amount) {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${amount < 0 ? '-' : ''}₹${formatted}`
}

export function formatCurrency(amount, currency) {
  const { symbol } = CURRENCIES[currency] || { symbol: '' }
  return `${symbol}${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
