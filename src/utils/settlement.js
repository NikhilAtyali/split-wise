import { MEMBERS, EXPENSE_TYPES } from './constants'
import { toINR } from './currency'

export function calculateBalances(contributions, expenses) {
  const memberCount = MEMBERS.length

  const fundContributed = {}
  const fundOriginal = {}
  const cardPaid = {}
  const cardOriginal = {}
  const commonShare = {}
  const personalUsage = {}
  MEMBERS.forEach((m) => {
    fundContributed[m] = 0
    fundOriginal[m] = []
    cardPaid[m] = 0
    cardOriginal[m] = []
    commonShare[m] = 0
    personalUsage[m] = 0
  })

  contributions.forEach((c) => {
    fundContributed[c.member] += toINR(c.amount, c.currency)
    if (c.currency !== 'INR') {
      fundOriginal[c.member].push({ amount: c.amount, currency: c.currency })
    }
  })

  let totalCommonExpenses = 0

  expenses.forEach((e) => {
    const amountINR = toINR(e.amount, e.currency)

    switch (e.type) {
      case EXPENSE_TYPES.COMMON_TO_COMMON:
        totalCommonExpenses += amountINR
        break

      case EXPENSE_TYPES.COMMON_TO_PERSONAL: {
        const beneficiaries = Array.isArray(e.beneficiaries) ? e.beneficiaries : [e.beneficiary]
        const perPerson = amountINR / beneficiaries.length
        beneficiaries.forEach((b) => { personalUsage[b] += perPerson })
        break
      }

      case EXPENSE_TYPES.PERSONAL_TO_COMMON:
        cardPaid[e.paidBy] += amountINR
        if (e.currency !== 'INR') {
          cardOriginal[e.paidBy].push({ amount: e.amount, currency: e.currency })
        }
        totalCommonExpenses += amountINR
        break

      case EXPENSE_TYPES.PERSONAL_TO_PERSONAL: {
        const beneficiariesPP = Array.isArray(e.beneficiaries) ? e.beneficiaries : [e.beneficiary]
        const perPersonPP = amountINR / beneficiariesPP.length
        cardPaid[e.paidBy] += amountINR
        if (e.currency !== 'INR') {
          cardOriginal[e.paidBy].push({ amount: e.amount, currency: e.currency })
        }
        beneficiariesPP.forEach((b) => { personalUsage[b] += perPersonPP })
        break
      }
    }
  })

  const perPersonCommonShare = totalCommonExpenses / memberCount

  const net = {}
  MEMBERS.forEach((m) => {
    commonShare[m] = perPersonCommonShare
    const totalPutIn = fundContributed[m] + cardPaid[m]
    const totalOwes = commonShare[m] + personalUsage[m]
    net[m] = totalPutIn - totalOwes
  })

  return {
    fundContributed,
    fundOriginal,
    cardPaid,
    cardOriginal,
    commonShare,
    personalUsage,
    net,
    totalCommonExpenses,
    perPersonCommonShare,
  }
}

/**
 * Greedy min-cash-flow algorithm to minimize the number of transactions.
 * Returns an array of { from, to, amount } objects.
 */
export function simplifyDebts(netBalances) {
  const balances = MEMBERS.map((m) => ({ member: m, amount: netBalances[m] }))
  const transactions = []

  const debtors = balances
    .filter((b) => b.amount < -0.5)
    .sort((a, b) => a.amount - b.amount)
  const creditors = balances
    .filter((b) => b.amount > 0.5)
    .sort((a, b) => b.amount - a.amount)

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const owed = creditors[j].amount
    const debt = -debtors[i].amount
    const settle = Math.min(owed, debt)

    if (settle > 0.5) {
      transactions.push({
        from: debtors[i].member,
        to: creditors[j].member,
        amount: Math.round(settle * 100) / 100,
      })
    }

    creditors[j].amount -= settle
    debtors[i].amount += settle

    if (Math.abs(creditors[j].amount) < 0.5) j++
    if (Math.abs(debtors[i].amount) < 0.5) i++
  }

  return transactions
}
