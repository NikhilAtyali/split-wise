import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Receipt,
  Wallet,
  Scale,
  CreditCard,
} from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { MEMBERS } from '../utils/constants'
import { formatINR, formatCurrency, toINR } from '../utils/currency'
import { calculateBalances, simplifyDebts } from '../utils/settlement'

function OriginalBadges({ entries }) {
  if (!entries || entries.length === 0) return null
  return (
    <div className="text-[10px] text-gray-400 mt-0.5">
      {entries.map((e, i) => (
        <span key={i}>
          {i > 0 && ' + '}
          {formatCurrency(e.amount, e.currency)}
        </span>
      ))}
    </div>
  )
}

export default function Summary() {
  const { state } = useAppContext()
  const { contributions, expenses } = state

  if (contributions.length === 0 && expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <Scale size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-1">
          No data yet
        </h3>
        <p className="text-sm text-gray-400">
          Add contributions and expenses first to see the settlement summary.
        </p>
      </div>
    )
  }

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
  const transactions = simplifyDebts(net)

  const totalContributions = contributions.reduce(
    (sum, c) => sum + toINR(c.amount, c.currency),
    0
  )
  const totalCardPayments = Object.values(cardPaid).reduce((a, b) => a + b, 0)
  const totalPersonalUsage = Object.values(personalUsage).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Top-level Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-1.5 text-teal-100 text-[10px] font-medium uppercase tracking-wider mb-1">
            <Wallet size={12} />
            Common Fund
          </div>
          <div className="text-xl font-bold">{formatINR(totalContributions)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-1.5 text-purple-100 text-[10px] font-medium uppercase tracking-wider mb-1">
            <CreditCard size={12} />
            Card Payments
          </div>
          <div className="text-xl font-bold">{formatINR(totalCardPayments)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-medium uppercase tracking-wider mb-1">
            <Scale size={12} />
            Common Exp / Person
          </div>
          <div className="text-xl font-bold">{formatINR(perPersonCommonShare)}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-1.5 text-orange-100 text-[10px] font-medium uppercase tracking-wider mb-1">
            <Receipt size={12} />
            Total Expenses
          </div>
          <div className="text-xl font-bold">
            {formatINR(totalCommonExpenses + totalPersonalUsage)}
          </div>
        </div>
      </div>

      {/* Per-person Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Individual Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Member</th>
                <th className="text-right px-3 py-3 font-medium">
                  <span className="text-teal-600">Fund In</span>
                </th>
                <th className="text-right px-3 py-3 font-medium">
                  <span className="text-purple-600">Card Paid</span>
                </th>
                <th className="text-right px-3 py-3 font-medium">
                  <span className="text-blue-600">Common Share</span>
                </th>
                <th className="text-right px-3 py-3 font-medium">
                  <span className="text-amber-600">Personal Use</span>
                </th>
                <th className="text-right px-3 py-3 font-medium">
                  <span className="text-green-600">Should Get</span>
                </th>
                <th className="text-right px-4 py-3 font-medium">
                  <span className="text-red-600">Should Pay</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MEMBERS.map((m) => {
                const balance = net[m]
                const shouldGet = balance > 0.5 ? balance : 0
                const shouldPay = balance < -0.5 ? Math.abs(balance) : 0
                return (
                  <tr key={m} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {m[0]}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{m}</span>
                      </div>
                    </td>
                    <td className="text-right px-3 py-3">
                      {fundContributed[m] > 0 ? (
                        <div>
                          <div className="text-teal-700 text-sm">{formatINR(fundContributed[m])}</div>
                          <OriginalBadges entries={fundOriginal[m]} />
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-right px-3 py-3">
                      {cardPaid[m] > 0 ? (
                        <div>
                          <div className="text-purple-700 text-sm">{formatINR(cardPaid[m])}</div>
                          <OriginalBadges entries={cardOriginal[m]} />
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-right px-3 py-3 text-blue-700 text-sm">
                      {formatINR(commonShare[m])}
                    </td>
                    <td className="text-right px-3 py-3 text-amber-700 text-sm">
                      {personalUsage[m] > 0 ? formatINR(personalUsage[m]) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="text-right px-3 py-3">
                      {shouldGet > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-sm text-green-600">
                          <TrendingUp size={14} />
                          {formatINR(shouldGet)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="text-right px-4 py-3">
                      {shouldPay > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-sm text-red-600">
                          <TrendingDown size={14} />
                          {formatINR(shouldPay)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-gray-50 text-[11px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
          <span><strong className="text-teal-600">Fund In</strong> = common pool contribution</span>
          <span><strong className="text-purple-600">Card Paid</strong> = personal card for others</span>
          <span><strong className="text-blue-600">Common Share</strong> = equal split of group expenses</span>
          <span><strong className="text-amber-600">Personal Use</strong> = personal expense from fund/others</span>
          <span><strong className="text-green-600">Should Get</strong> / <strong className="text-red-600">Should Pay</strong> = (Fund In + Card Paid) − (Common Share + Personal Use)</span>
        </div>
      </div>

      {/* Settlement Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Simplified Settlements
          </h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2
              size={40}
              className="mx-auto text-green-400 mb-2"
            />
            <p className="text-sm text-gray-500 font-medium">
              All settled! No payments needed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                    {t.from[0]}
                  </div>
                  <span className="font-medium text-gray-700 text-sm">
                    {t.from}
                  </span>
                  <ArrowRight size={16} className="text-gray-400" />
                  <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                    {t.to[0]}
                  </div>
                  <span className="font-medium text-gray-700 text-sm">
                    {t.to}
                  </span>
                </div>
                <div className="font-bold text-gray-800">
                  {formatINR(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Currency Reference */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div className="font-semibold text-gray-500 mb-1">
          Conversion Rates Used
        </div>
        <div>1 USD = ₹93.00</div>
        <div>186 IDR = ₹1.00</div>
      </div>
    </div>
  )
}
