'use client'

import _ from 'lodash'
import { useEffect } from 'react'

export const usePersistForm = ({ value, localStorageKey }: { value: unknown; localStorageKey: string }) => {
  useEffect(() => {
    if (_.isEmpty(value)) {
      localStorage.removeItem(localStorageKey)
    } else {
      localStorage.setItem(localStorageKey, JSON.stringify(value))
    }
  }, [value, localStorageKey])
}

export const getPersistedData = <T>({
  defaultValue,
  localStorageKey,
}: {
  defaultValue: T
  localStorageKey: string
}): T => {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const data = localStorage.getItem(localStorageKey)

  if (data) {
    try {
      const savedData = JSON.parse(data) as T
      if (_.isEmpty(savedData)) {
        return defaultValue
      }
      return savedData
    } catch (err) {
      return defaultValue
    }
  }
  return defaultValue
}

export function clearPresistedData({ localStorageKey }: { localStorageKey: string }) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(localStorageKey)
}
