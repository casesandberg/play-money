'use client'

// Source: https://github.com/mxkaske/mxkaske.dev/blob/main/hooks/use-local-storage.ts
import { useEffect, useState, useCallback } from 'react'

function getItemFromLocalStorage<T>(key: string) {
  // FIXME: !!!!!!!!!
  if (typeof window === 'undefined') return null

  const item = window.localStorage.getItem(key)
  if (item) return JSON.parse(item) as T

  return null
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(getItemFromLocalStorage(key) ?? initialValue)

  useEffect(() => {
    // Retrieve from localStorage
    const item = getItemFromLocalStorage<T>(key)
    if (item) setStoredValue(item)
  }, [key])

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value) => {
      if (value instanceof Function) {
        setStoredValue((prev: T) => {
          const newValue = value(prev)
          // Save to localStorage
          window.localStorage.setItem(key, JSON.stringify(newValue))
          return newValue
        })
      } else {
        setStoredValue(value)
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(value))
      }
      return setStoredValue
    },
    [key, setStoredValue]
  )

  return [storedValue, setValue]
}
