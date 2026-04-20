import { useState } from 'react'
import { PlusCircle, Trash2, ArrowRight } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { MEMBERS, CURRENCIES, EXPENSE_TYPES, EXPENSE_TYPE_LABELS } from '../utils/constants'
import { formatINR, formatCurrency, toINR } from '../utils/currency'
import MultiSelect from './MultiSelect'

function getBeneficiaryNames(e) {
  if (e.beneficiaries) return e.beneficiaries
  if (e.beneficiary) return [e.beneficiary]
  return []
}

export default function Expenses() {
  const { state, dispatch } = useAppContext()
  const [type, setType] = useState(EXPENSE_TYPES.COMMON_TO_COMMON)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('IDR')
  const [description, setDescription] = useState('')
  const [paidBy, setPaidBy] = useState(MEMBERS[0])
  const [beneficiaries, setBeneficiaries] = useState([MEMBERS[0]])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    if (!description.trim()) return

    const payload = {
      type,
      amount: Number(amount),
      currency,
      description: description.trim(),
    }

    if (type === EXPENSE_TYPES.PERSONAL_TO_COMMON || type === EXPENSE_TYPES.PERSONAL_TO_PERSONAL) {
      payload.paidBy = paidBy
    }
    if (type === EXPENSE_TYPES.COMMON_TO_PERSONAL || type === EXPENSE_TYPES.PERSONAL_TO_PERSONAL) {
      payload.beneficiaries = [...beneficiaries]
    }

    dispatch({ type: 'ADD_EXPENSE', payload })
    setAmount('')
    setDescription('')
  }

  const typeColors = {
    [EXPENSE_TYPES.COMMON_TO_COMMON]: 'bg-blue-50 text-blue-700 border-blue-200',
    [EXPENSE_TYPES.COMMON_TO_PERSONAL]: 'bg-amber-50 text-amber-700 border-amber-200',
    [EXPENSE_TYPES.PERSONAL_TO_COMMON]: 'bg-purple-50 text-purple-700 border-purple-200',
    [EXPENSE_TYPES.PERSONAL_TO_PERSONAL]: 'bg-rose-50 text-rose-700 border-rose-200',
  }

  const typeBadgeColors = {
    [EXPENSE_TYPES.COMMON_TO_COMMON]: 'bg-blue-100 text-blue-700',
    [EXPENSE_TYPES.COMMON_TO_PERSONAL]: 'bg-amber-100 text-amber-700',
    [EXPENSE_TYPES.PERSONAL_TO_COMMON]: 'bg-purple-100 text-purple-700',
    [EXPENSE_TYPES.PERSONAL_TO_PERSONAL]: 'bg-rose-100 text-rose-700',
  }

  const needsPaidBy = type === EXPENSE_TYPES.PERSONAL_TO_COMMON || type === EXPENSE_TYPES.PERSONAL_TO_PERSONAL
  const needsBeneficiary = type === EXPENSE_TYPES.COMMON_TO_PERSONAL || type === EXPENSE_TYPES.PERSONAL_TO_PERSONAL

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
              type === key
                ? `${typeColors[key]} border-current shadow-sm`
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
            }`}
          >
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs mt-1 opacity-70">
              {key === EXPENSE_TYPES.COMMON_TO_COMMON && 'Pool money spent for everyone'}
              {key === EXPENSE_TYPES.COMMON_TO_PERSONAL && 'Pool money used by select people'}
              {key === EXPENSE_TYPES.PERSONAL_TO_COMMON && "Someone's card for group expense"}
              {key === EXPENSE_TYPES.PERSONAL_TO_PERSONAL && 'Someone paid for select people'}
            </div>
          </button>
        ))}
      </div>

      {/* Add Expense Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Add Expense
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Description (e.g. Dinner at Bali)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="sm:col-span-2 lg:col-span-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50"
            required
          />

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

          {needsPaidBy && (
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50"
            >
              {MEMBERS.map((m) => (
                <option key={m} value={m}>
                  Paid by: {m}
                </option>
              ))}
            </select>
          )}

          {needsBeneficiary && (
            <MultiSelect
              options={MEMBERS}
              selected={beneficiaries}
              onChange={setBeneficiaries}
              label="people"
            />
          )}

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <PlusCircle size={16} />
            Add Expense
          </button>
        </div>
        {amount && currency && (
          <div className="mt-3 text-xs text-gray-400">
            {currency !== 'INR' && (
              <span>
                {formatCurrency(amount, currency)} ={' '}
                {formatINR(toINR(Number(amount), currency))}
              </span>
            )}
            {needsBeneficiary && beneficiaries.length > 1 && Number(amount) > 0 && (
              <span className="ml-3">
                Split: {formatINR(toINR(Number(amount), currency) / beneficiaries.length)} each
                ({beneficiaries.length} people)
              </span>
            )}
          </div>
        )}
      </form>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            All Expenses ({state.expenses.length})
          </h3>
        </div>
        {state.expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No expenses yet. Add the first one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {state.expenses.map((e) => {
              const names = getBeneficiaryNames(e)
              const namesDisplay =
                names.length === MEMBERS.length
                  ? 'Everyone'
                  : names.length <= 2
                    ? names.join(', ')
                    : `${names.length} people`

              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${typeBadgeColors[e.type]}`}
                      >
                        {e.type === EXPENSE_TYPES.COMMON_TO_COMMON && 'Common'}
                        {e.type === EXPENSE_TYPES.COMMON_TO_PERSONAL && 'Fund→P'}
                        {e.type === EXPENSE_TYPES.PERSONAL_TO_COMMON && 'Card'}
                        {e.type === EXPENSE_TYPES.PERSONAL_TO_PERSONAL && 'P→P'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {e.description}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
                        {e.type === EXPENSE_TYPES.PERSONAL_TO_COMMON && (
                          <>
                            {e.paidBy} <ArrowRight size={10} /> Split equally
                          </>
                        )}
                        {e.type === EXPENSE_TYPES.COMMON_TO_PERSONAL && (
                          <>
                            Common Fund <ArrowRight size={10} /> {namesDisplay}
                          </>
                        )}
                        {e.type === EXPENSE_TYPES.COMMON_TO_COMMON && (
                          <>Common Fund <ArrowRight size={10} /> Everyone</>
                        )}
                        {e.type === EXPENSE_TYPES.PERSONAL_TO_PERSONAL && (
                          <>
                            {e.paidBy} <ArrowRight size={10} /> {namesDisplay}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-semibold text-gray-800 text-sm">
                        {formatCurrency(e.amount, e.currency)}
                      </div>
                      {e.currency !== 'INR' && (
                        <div className="text-xs text-gray-400">
                          = {formatINR(toINR(e.amount, e.currency))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        dispatch({ type: 'DELETE_EXPENSE', payload: e.id })
                      }
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
