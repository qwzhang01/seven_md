import { useEffect, useRef } from 'react'

interface InlineInputProps {
  defaultValue?: string
  placeholder?: string
  error?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export default function InlineInput({
  defaultValue = '',
  placeholder = '',
  error,
  onConfirm,
  onCancel,
}: InlineInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus and select all text on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      onConfirm(inputRef.current?.value ?? '')
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onCancel()
    }
  }

  return (
    <div className="flex flex-col">
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onBlur={() => onCancel()}
        className={`text-sm px-1 py-0.5 rounded border outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-blue-400 dark:border-blue-500'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? 'inline-input-error' : undefined}
      />
      {error && (
        <span
          id="inline-input-error"
          role="alert"
          className="text-xs text-red-500 dark:text-red-400 mt-0.5 px-1"
        >
          {error}
        </span>
      )}
    </div>
  )
}
