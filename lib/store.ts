import { create } from 'zustand'

export type Line = { id: string; name: string; price: number; qty: number; max: number }
type S = {
  lines: Line[]
  disc: number
  add: (l: Omit<Line, 'qty'>) => void
  inc: (id: string, d: number) => void
  setDisc: (n: number) => void
  clear: () => void
}

export const useCart = create<S>((set) => ({
  lines: [],
  disc: 0,
  add: (l) => set((s) => {
    if (l.max < 1) return s
    const x = s.lines.find((a) => a.id === l.id)
    if (x) return { lines: s.lines.map((a) => (a.id === l.id ? { ...a, qty: Math.min(a.max, a.qty + 1) } : a)) }
    return { lines: [...s.lines, { ...l, qty: 1 }] }
  }),
  inc: (id, d) => set((s) => ({
    lines: s.lines.map((a) => (a.id === id ? { ...a, qty: Math.min(a.max, a.qty + d) } : a)).filter((a) => a.qty > 0),
  })),
  setDisc: (n) => set({ disc: Math.min(100, Math.max(0, n || 0)) }),
  clear: () => set({ lines: [], disc: 0 }),
}))

/** Display-only estimate. The database recomputes the authoritative totals in checkout(). */
export function totals(lines: Line[], disc: number, vat: number) {
  const sub = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const d = (sub * disc) / 100
  const tax = ((sub - d) * vat) / 100
  return { sub, d, tax, total: sub - d + tax }
}
