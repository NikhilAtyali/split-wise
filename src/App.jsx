import { useState } from 'react'
import { HandCoins, Receipt, BarChart3, Download } from 'lucide-react'
import { useAppContext } from './context/AppContext'
import { exportToExcel } from './utils/exportExcel'
import Contributions from './components/Contributions'
import Expenses from './components/Expenses'
import Summary from './components/Summary'

const TABS = [
  { id: 'contributions', label: 'Common Fund', icon: HandCoins },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'summary', label: 'Settlement', icon: BarChart3 },
]

function App() {
  const [activeTab, setActiveTab] = useState('contributions')
  const { state, dispatch } = useAppContext()
  const [showReset, setShowReset] = useState(false)

  const handleExport = () => {
    exportToExcel(state.contributions, state.expenses)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <HandCoins size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-tight">
                  SplitWise
                </h1>
                <p className="text-[10px] text-teal-200 leading-tight">
                  Bali Trip — 5 Couples
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Download size={14} />
                Export Excel
              </button>
              <button
                onClick={() => setShowReset(!showReset)}
                className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Reset All
              </button>
              {showReset && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72 z-50">
                  <p className="text-sm text-gray-700 font-semibold mb-1">
                    Reset all data?
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    This will permanently clear all contributions and expenses.
                    This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReset(false)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        dispatch({ type: 'RESET_ALL' })
                        setShowReset(false)
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'contributions' && <Contributions />}
        {activeTab === 'expenses' && <Expenses />}
        {activeTab === 'summary' && <Summary />}
      </main>
    </div>
  )
}

export default App
