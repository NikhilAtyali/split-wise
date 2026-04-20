export const MEMBERS = ['Nikhil', 'Jeevan', 'Sankalp', 'Santosh', 'Amar']

export const CURRENCIES = {
  INR: { label: 'INR (₹)', symbol: '₹', toINR: (amount) => amount },
  USD: { label: 'USD ($)', symbol: '$', toINR: (amount) => amount * 94 },
  IDR: { label: 'IDR (Rp)', symbol: 'Rp', toINR: (amount) => amount / 186 },
}

export const EXPENSE_TYPES = {
  COMMON_TO_COMMON: 'common_to_common',
  COMMON_TO_PERSONAL: 'common_to_personal',
  PERSONAL_TO_COMMON: 'personal_to_common',
  PERSONAL_TO_PERSONAL: 'personal_to_personal',
}

export const EXPENSE_TYPE_LABELS = {
  [EXPENSE_TYPES.COMMON_TO_COMMON]: 'Common Fund → Common Expense',
  [EXPENSE_TYPES.COMMON_TO_PERSONAL]: 'Common Fund → Personal Expense',
  [EXPENSE_TYPES.PERSONAL_TO_COMMON]: 'Personal Card → Common Expense',
  [EXPENSE_TYPES.PERSONAL_TO_PERSONAL]: 'Personal → Personal',
}
