import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

// One scroll loop for the whole page. Each scene reports how far the reader
// is through its section, 0 to 1. The update is flushed synchronously inside
// the same animation frame that moved the page, so a scene is never a frame
// behind the scroll and nothing eases along after you have stopped.

type Sub = { el: HTMLElement; set: (p: number) => void; last: number }
const subs = new Set<Sub>()
const listeners = new Set<(y: number) => void>()
let queued = false

function progressOf(el: HTMLElement, vh: number) {
  const r = el.getBoundingClientRect()
  const span = r.height - vh
  // a tall section with a sticky stage: 0 when it reaches the top, 1 when it leaves
  if (span > 1) return Math.min(1, Math.max(0, -r.top / span))
  return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
}

function measure() {
  queued = false
  const vh = window.innerHeight
  const changed: [Sub, number][] = []
  for (const s of subs) {
    const p = progressOf(s.el, vh)
    if (p !== s.last) changed.push([s, p])
  }
  for (const fn of listeners) fn(window.scrollY)
  if (!changed.length) return
  flushSync(() => {
    for (const [s, p] of changed) {
      s.last = p
      s.set(p)
    }
  })
}

const schedule = () => {
  if (!queued) {
    queued = true
    requestAnimationFrame(measure)
  }
}

let wired = false
function wire() {
  if (wired) return
  wired = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    wire()
    const sub: Sub = { el, set: setP, last: -1 }
    subs.add(sub)
    schedule()
    return () => {
      subs.delete(sub)
    }
  }, [])
  return [ref, p] as const
}

// For cheap DOM-only effects (the top progress bar, the header state).
export function onScroll(fn: (y: number) => void) {
  wire()
  listeners.add(fn)
  schedule()
  return () => {
    listeners.delete(fn)
  }
}
