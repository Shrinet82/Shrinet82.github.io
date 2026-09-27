import { useEffect, type RefObject } from 'react'
import { glassEntries, type GlassEntry } from './registry'

type Options = Partial<Pick<GlassEntry, 'tint' | 'dark' | 'strength' | 'priority'>>

// Registers an element as a liquid-glass panel. Corner radius is read from CSS.
export function useGlass(ref: RefObject<HTMLElement | null>, opts: Options = {}) {
  const { tint = 0.06, dark = 0.35, strength = 1, priority = 0 } = opts
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const entry: GlassEntry = {
      el,
      radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0,
      tint,
      dark,
      strength,
      priority,
    }
    glassEntries.add(entry)
    return () => {
      glassEntries.delete(entry)
    }
  }, [ref, tint, dark, strength, priority])
}
