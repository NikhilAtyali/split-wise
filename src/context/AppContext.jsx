import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const STORAGE_KEY = 'splitwise_data'

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch {}
  return null
}

const initialState = loadFromStorage() || {
  contributions: [],
  expenses: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CONTRIBUTION':
      return {
        ...state,
        contributions: [...state.contributions, { ...action.payload, id: crypto.randomUUID() }],
      }
    case 'DELETE_CONTRIBUTION':
      return {
        ...state,
        contributions: state.contributions.filter((c) => c.id !== action.payload),
      }
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, { ...action.payload, id: crypto.randomUUID() }],
      }
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      }
    case 'RESET_ALL':
      return { contributions: [], expenses: [] }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
