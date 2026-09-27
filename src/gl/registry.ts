// Shared state between the DOM and the two WebGL layers.
// DOM elements register as glass panels; the Stage canvas draws glass at
// their on-screen rects, refracting the live shader-gradient background.

export type GlassEntry = {
  el: HTMLElement
  radius: number
  tint: number
  dark: number
  strength: number
  priority: number
}

export const glassEntries = new Set<GlassEntry>()

export type Palette = { color1: string; color2: string; color3: string }

export const palettes: Record<string, Palette> = {
  hero: { color1: '#5606ff', color2: '#fe8989', color3: '#000000' },
  proof: { color1: '#3d12d6', color2: '#d9607a', color3: '#000000' },
  experience: { color1: '#2a0fd6', color2: '#0e8fa8', color3: '#02010a' },
  work: { color1: '#5b21b6', color2: '#c2410c', color3: '#000000' },
  oss: { color1: '#1e3aff', color2: '#0f9f74', color3: '#01020a' },
  stack: { color1: '#4c1d95', color2: '#1d7fb8', color3: '#000000' },
  contact: { color1: '#e0401f', color2: '#6d28d9', color3: '#000000' },
}

type Listener = (p: Palette) => void
let current: Palette = palettes.hero
const listeners = new Set<Listener>()

export const paletteStore = {
  get: () => current,
  set(name: string) {
    const next = palettes[name]
    if (!next || next === current) return
    current = next
    listeners.forEach((l) => l(current))
  },
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

// The gradient's <canvas>, published by Background once it mounts.
export const gradientSource: { canvas: HTMLCanvasElement | null } = { canvas: null }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}
