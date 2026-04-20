import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function MultiSelect({ options, selected, onChange, label }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (value) => {
    if (selected.includes(value)) {
      if (selected.length === 1) return
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectAll = () => {
    onChange(selected.length === options.length ? [options[0]] : [...options])
  }

  const displayText =
    selected.length === options.length
      ? `All ${label}`
      : selected.length <= 2
        ? selected.join(', ')
        : `${selected.length} ${label}`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-left focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none cursor-pointer"
      >
        <span className="truncate text-gray-700">{displayText}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform shrink-0 ml-1 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={selectAll}
            className="w-full text-left px-3 py-2 text-xs font-medium text-teal-600 hover:bg-teal-50 border-b border-gray-100 cursor-pointer"
          >
            {selected.length === options.length ? 'Deselect all' : 'Select all'}
          </button>
          <div className="max-h-48 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = selected.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 text-teal-800'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-teal-600 border-teal-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
