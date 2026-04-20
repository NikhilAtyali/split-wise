import * as XLSX from 'xlsx'
import { MEMBERS, EXPENSE_TYPES, EXPENSE_TYPE_LABELS } from './constants'
import { toINR, formatCurrency } from './currency'
import { calculateBalances, simplifyDebts } from './settlement'

function fmt(n) {
  return Math.round(n * 100) / 100
}

export function exportToExcel(contributions, expenses) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Contributions ──
  const contribRows = contributions.map((c) => ({
    Member: c.member,
    Amount: c.amount,
    Currency: c.currency,
    'Amount (INR)': fmt(toINR(c.amount, c.currency)),
    Note: c.note || '',
  }))

  const totalFundINR = contributions.reduce((s, c) => s + toINR(c.amount, c.currency), 0)
  contribRows.push({})
  contribRows.push({
    Member: 'TOTAL',
    Amount: '',
    Currency: '',
    'Amount (INR)': fmt(totalFundINR),
    Note: '',
  })
  contribRows.push({})
  contribRows.push({ Member: 'Conversion Rates:', Amount: '1 USD = ₹94', Currency: '186 IDR = ₹1' })

  const ws1 = XLSX.utils.json_to_sheet(contribRows)
  ws1['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Contributions')

  // ── Sheet 2: Expenses ──
  const expenseRows = expenses.map((e) => {
    const beneficiaries = e.beneficiaries
      ? e.beneficiaries.join(', ')
      : e.beneficiary || ''

    let splitInfo = ''
    if (e.type === EXPENSE_TYPES.COMMON_TO_COMMON) {
      splitInfo = 'Everyone (equal split)'
    } else if (e.type === EXPENSE_TYPES.PERSONAL_TO_COMMON) {
      splitInfo = 'Everyone (equal split)'
    } else {
      splitInfo = beneficiaries
    }

    return {
      Description: e.description,
      Type: EXPENSE_TYPE_LABELS[e.type] || e.type,
      Amount: e.amount,
      Currency: e.currency,
      'Amount (INR)': fmt(toINR(e.amount, e.currency)),
      'Paid By': e.paidBy || 'Common Fund',
      'Split Between': splitInfo,
    }
  })

  const totalExpINR = expenses.reduce((s, e) => s + toINR(e.amount, e.currency), 0)
  expenseRows.push({})
  expenseRows.push({
    Description: 'TOTAL',
    Type: '',
    Amount: '',
    Currency: '',
    'Amount (INR)': fmt(totalExpINR),
    'Paid By': '',
    'Split Between': '',
  })
  expenseRows.push({})
  expenseRows.push({ Description: 'Conversion Rates:', Type: '1 USD = ₹94', Amount: '186 IDR = ₹1' })

  const ws2 = XLSX.utils.json_to_sheet(expenseRows)
  ws2['!cols'] = [{ wch: 28 }, { wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 28 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Expenses')

  // ── Sheet 3: Settlement Summary ──
  const {
    fundContributed,
    fundOriginal,
    cardPaid,
    cardOriginal,
    commonShare,
    personalUsage,
    net,
    totalCommonExpenses,
    perPersonCommonShare,
  } = calculateBalances(contributions, expenses)

  const summaryRows = MEMBERS.map((m) => {
    const balance = net[m]
    const fundOrig = (fundOriginal[m] || [])
      .map((e) => formatCurrency(e.amount, e.currency))
      .join(' + ')
    const cardOrig = (cardOriginal[m] || [])
      .map((e) => formatCurrency(e.amount, e.currency))
      .join(' + ')

    return {
      Member: m,
      'Fund In (INR)': fmt(fundContributed[m]),
      'Fund In (Original)': fundOrig || '—',
      'Card Paid (INR)': fmt(cardPaid[m]),
      'Card Paid (Original)': cardOrig || '—',
      'Common Share (INR)': fmt(commonShare[m]),
      'Personal Use (INR)': fmt(personalUsage[m]) || 0,
      'Should Get (INR)': balance > 0.5 ? fmt(balance) : '',
      'Should Pay (INR)': balance < -0.5 ? fmt(Math.abs(balance)) : '',
    }
  })

  summaryRows.push({})
  summaryRows.push({
    Member: 'TOTALS',
    'Fund In (INR)': fmt(Object.values(fundContributed).reduce((a, b) => a + b, 0)),
    'Fund In (Original)': '',
    'Card Paid (INR)': fmt(Object.values(cardPaid).reduce((a, b) => a + b, 0)),
    'Card Paid (Original)': '',
    'Common Share (INR)': fmt(totalCommonExpenses),
    'Personal Use (INR)': fmt(Object.values(personalUsage).reduce((a, b) => a + b, 0)),
    'Should Get (INR)': '',
    'Should Pay (INR)': '',
  })
  summaryRows.push({})
  summaryRows.push({
    Member: `Common Expense Per Person: ₹${fmt(perPersonCommonShare)}`,
  })
  summaryRows.push({ Member: 'Conversion Rates:', 'Fund In (INR)': '1 USD = ₹94', 'Fund In (Original)': '186 IDR = ₹1' })

  const ws3 = XLSX.utils.json_to_sheet(summaryRows)
  ws3['!cols'] = [
    { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, ws3, 'Settlement Summary')

  // ── Sheet 4: Simplified Settlements ──
  const transactions = simplifyDebts(net)

  const settlementRows = transactions.length > 0
    ? transactions.map((t) => ({
        'Pays': t.from,
        '→': '→',
        'Receives': t.to,
        'Amount (INR)': fmt(t.amount),
      }))
    : [{ 'Pays': 'All settled!', '→': '', 'Receives': '', 'Amount (INR)': '' }]

  settlementRows.push({})
  settlementRows.push({ 'Pays': `Total Transactions: ${transactions.length}` })

  const ws4 = XLSX.utils.json_to_sheet(settlementRows)
  ws4['!cols'] = [{ wch: 14 }, { wch: 4 }, { wch: 14 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'Settlements')

  // ── Download ──
  const today = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `Splitwise_BaliTrip_${today}.xlsx`)
}
