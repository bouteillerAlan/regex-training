import { exercises, type Exercise } from '../exercises'

const DAY_MS = 86_400_000
const STORAGE_KEY = 'regex-daily'

interface DailyState {
  lastCompletedDay: number
  streak: number
}

function todayIndex(): number {
  return Math.floor(Date.now() / DAY_MS)
}

function load(): DailyState {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') ?? { lastCompletedDay: -1, streak: 0 }
  } catch {
    return { lastCompletedDay: -1, streak: 0 }
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function getDailyExercise(): Exercise {
  const idx = Math.floor(seededRandom(todayIndex()) * exercises.length)
  return exercises[idx]
}

export function getRandomExercise(excludeId: string): Exercise {
  const pool = exercises.filter(e => e.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function isTodayDone(): boolean {
  return load().lastCompletedDay === todayIndex()
}

export function getStreak(): number {
  return load().streak
}

export function completeDailyExercise(): number {
  const today = todayIndex()
  const prev = load()
  if (prev.lastCompletedDay === today) return prev.streak
  const streak = prev.lastCompletedDay === today - 1 ? prev.streak + 1 : 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastCompletedDay: today, streak }))
  return streak
}

export function resetDaily(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
