import { useState, useEffect } from 'react'

export interface Match {
  index: number
  length: number
  text: string
  groups: string[]
  named: Record<string, string>
}

export function getMatches(pattern: string, flags: string, text: string): { matches: Match[]; error: string | null } {
  if (!pattern) return { matches: [], error: null }
  try {
    const re = new RegExp(pattern, flags)
    const matches: Match[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const named: Record<string, string> = {}
      if (m.groups) Object.assign(named, m.groups)
      matches.push({ index: m.index, length: m[0].length, text: m[0], groups: [...m], named })
      if (!re.global) break
      if (m.index === re.lastIndex) re.lastIndex++
    }
    return { matches, error: null }
  } catch (e: unknown) {
    return { matches: [], error: String(e instanceof Error ? e.message : e) }
  }
}

const LIGHT = [
  'rgba(67, 97, 238, 0.25)', 'rgba(45, 106, 79, 0.25)',
  'rgba(181, 131, 52, 0.25)', 'rgba(230, 57, 70, 0.25)',
  'rgba(130, 80, 223, 0.25)', 'rgba(230, 126, 34, 0.25)',
]
const DARK = [
  'rgba(88, 166, 255, 0.3)', 'rgba(63, 185, 80, 0.3)',
  'rgba(210, 153, 34, 0.3)', 'rgba(248, 81, 73, 0.3)',
  'rgba(188, 140, 255, 0.3)', 'rgba(255, 140, 0, 0.3)',
]

export function useMatchColors(): string[] {
  const [dark, setDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const h = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return dark ? DARK : LIGHT
}
