import { useState, useCallback } from 'react'

const STORAGE_KEY = 'regex-progress'

function load(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useProgress() {
  const [completed, setCompleted] = useState<string[]>(load)

  const toggle = useCallback((id: string) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      save(next)
      return next
    })
  }, [])

  const markDone = useCallback((id: string) => {
    setCompleted(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      save(next)
      return next
    })
  }, [])

  const isDone = useCallback((id: string) => completed.includes(id), [completed])

  const reset = useCallback(() => {
    save([])
    setCompleted([])
  }, [])

  return { completed, toggle, markDone, isDone, reset }
}
