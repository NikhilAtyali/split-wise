import { useState } from 'react'
import { PlusCircle, Trash2, Wallet } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { MEMBERS, CURRENCIES } from '../utils/constants'
import { formatINR, formatCurrency, toINR } from '../utils/currency'

export default function Contributions() {
  const { state, dispatch } = useAppContext()
  const [member, setMember] = useState(MEMBERS[0])
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [note, setNote] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    dispatch({
      type: 'ADD_CONTRIBUTION',
      payload: { member, amount: Number(amount), currency, note },
    })
    setAmount('')
    setNote('')
  }

  const totalINR = state.contributions.reduce(
    (sum, c) => sum + toINR(c.amount, c.currency),
    0
  )

  const perMember = {}
  MEMBERS.forEach((m) => (perMember[m] = 0))
  state.contributions.forEach((c) => {
    perMember[c.member] += toINR(c.amount, c.currency)
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 text-teal-100 text-xs font-medium uppercase tracking-wider mb-1">
            <Wallet size={14} />
            Total Fund
          </div>
          <div className="text-xl font-bold">{formatINR(totalINR)}</div>
        </div>
        {MEMBERS.map((m) => (
          <div
            key={m}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
              {m}
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {formatINR(perMember[m])}
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Add Contribution to Common Fund
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={member}
            onChange={(e) => setMember(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50"
          >
            {MEMBERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50"
              required
            />
          </div>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50"
          >
            {Object.entries(CURRENCIES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <PlusCircle size={16} />
            Add
          </button>
        </div>
      </form>

      {/* Contributions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            All Contributions ({state.contributions.length})
          </h3>
        </div>
        {state.contributions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No contributions yet. Add the first one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {state.contributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                    {c.member[0]}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 text-sm">
                      {c.member}
                    </span>
                    {c.note && (
                      <span className="text-gray-400 text-xs ml-2">
                        — {c.note}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-800 text-sm">
                      {formatCurrency(c.amount, c.currency)}
                    </div>
                    {c.currency !== 'INR' && (
                      <div className="text-xs text-gray-400">
                        = {formatINR(toINR(c.amount, c.currency))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: 'DELETE_CONTRIBUTION', payload: c.id })
                    }
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
