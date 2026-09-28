import { Easing, interpolate } from 'remotion'
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces'
import { loadFont as loadPlexMono } from '@remotion/google-fonts/IBMPlexMono'
import { loadFont as loadInstrument } from '@remotion/google-fonts/InstrumentSans'

// Shared drawing kit for every composition: one palette, one line quality,
// one set of props. Everything here is drawn as if in ink on paper, shaded
// with hatching and washed with pigment, so all scenes read as one hand.

export const serif = loadFraunces('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily
export const serifItalic = loadFraunces('italic', { weights: ['400'], subsets: ['latin'] }).fontFamily
export const mono = loadPlexMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily
export const sans = loadInstrument('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily

export const C = {
  ink: '#1c1a17',
  graphite: '#5b574f',
  faint: '#8d877c',
  paper: '#fbf8f2',
  paper2: '#f3eee4',
  rule: '#d8cfbf',
  night: '#24386f',
  hull: '#33456f',
  ultra: '#26448f',
  ultraWash: '#7b95cf',
  ultraSoft: '#c9d3ec',
  vermilion: '#b3321c',
  vermWash: '#e07a62',
  vermSoft: '#f1c4b6',
  sap: '#3b6636',
  sapWash: '#8fb07f',
  sapSoft: '#d3e2c8',
  ochre: '#8a5d12',
  ochreWash: '#d39b34',
  ochreSoft: '#eed3a0',
  moon: '#f6e2a8',
}

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
}

// A clamped 0→1 progress between two frames.
export const prog = (f: number, a: number, b: number, easing = ease.inOut) => interpolate(f, [a, b], [0, 1], { ...clamp, easing })
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const osc = (f: number, period: number, phase = 0) => Math.sin((f / period + phase) * Math.PI * 2)

// Ink lines "boil" like hand-drawn animation: the wobble changes every few
// frames, never smoothly.
export const boilSeed = (f: number) => 3 + (Math.floor(f / 4) % 3)

export function Defs({ id, f, deckle }: { id: string; f: number; deckle?: { w: number; h: number } }) {
  return (
    <defs>
      {deckle && (
        // a torn, deckled paper edge for scenes that fill their frame
        <>
          <filter id={`${id}-deckle-f`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="16" />
          </filter>
          <mask id={`${id}-deckle`} maskUnits="userSpaceOnUse" x="0" y="0" width={deckle.w} height={deckle.h}>
            <rect x={10} y={10} width={deckle.w - 20} height={deckle.h - 20} rx={6} fill="#fff" filter={`url(#${id}-deckle-f)`} />
          </mask>
        </>
      )}
      <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={boilSeed(f)} />
        <feDisplacementMap in="SourceGraphic" scale="2.4" />
      </filter>
      <filter id={`${id}-wash`} x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46" result="d" />
        <feGaussianBlur in="d" stdDeviation="7" />
      </filter>
      <pattern id={`${id}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <line x1="0" y1="0" x2="0" y2="5" stroke={C.ink} strokeWidth="0.9" opacity="0.55" />
      </pattern>
      <pattern id={`${id}-hatch-light`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <line x1="0" y1="0" x2="0" y2="7" stroke={C.ink} strokeWidth="0.7" opacity="0.3" />
      </pattern>
      <pattern id={`${id}-cross`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <line x1="0" y1="0" x2="0" y2="5" stroke={C.ink} strokeWidth="0.8" opacity="0.5" />
        <line x1="0" y1="0" x2="5" y2="0" stroke={C.ink} strokeWidth="0.8" opacity="0.5" />
      </pattern>
    </defs>
  )
}

// A shipping container: corrugated sides, door rods on the right end, a
// hatched shadow along the bottom and an optional Docker stencil.
export function Box({
  id,
  x,
  y,
  w = 62,
  h = 30,
  fill,
  label,
  whale = false,
  stroke = C.ink,
}: {
  id: string
  x: number
  y: number
  w?: number
  h?: number
  fill: string
  label?: string
  whale?: boolean
  stroke?: string
}) {
  const ribs = Math.floor((w - 14) / 6)
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} fill={fill} stroke={stroke} strokeWidth={1.8} />
      <rect x={0} y={0} width={w} height={3} fill={stroke} opacity={0.25} />
      {Array.from({ length: ribs }, (_, i) => (
        <line key={i} x1={5 + i * 6} y1={4} x2={5 + i * 6} y2={h - 4} stroke={stroke} strokeWidth={0.7} opacity={0.55} />
      ))}
      <line x1={w - 7} y1={3} x2={w - 7} y2={h - 3} stroke={stroke} strokeWidth={1.1} />
      <line x1={w - 3.5} y1={3} x2={w - 3.5} y2={h - 3} stroke={stroke} strokeWidth={1.1} />
      <rect x={0} y={h - 5} width={w} height={5} fill={`url(#${id}-hatch)`} />
      {whale && <Whale x={w / 2 - 10} y={h / 2 - 5} scale={0.5} />}
      {label && (
        <text x={w / 2 - 3} y={h / 2 + 4} textAnchor="middle" fontFamily={mono} fontSize={Math.min(11, h * 0.36)} fill={stroke}>
          {label}
        </text>
      )}
    </g>
  )
}

// A tiny Docker whale stencil, drawn not traced.
export function Whale({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.8}>
      <path d="M0 12 C 0 4, 26 2, 34 8 L 40 2 C 42 6, 42 10, 38 12 C 34 22, 4 22, 0 12 Z" fill="none" stroke={C.ink} strokeWidth={2.4} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={6 + i * 8} y={-4} width={6} height={5} fill="none" stroke={C.ink} strokeWidth={1.8} />
      ))}
    </g>
  )
}

// The helm. Seven spokes like the Kubernetes mark, turned handles like a
// real ship's wheel. Rotation is applied by the caller.
export function Helm({ r, hub = C.ochreWash }: { r: number; hub?: string }) {
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2
        const c = Math.cos(a)
        const s = Math.sin(a)
        return (
          <g key={i}>
            <line x1={c * r * 0.22} y1={s * r * 0.22} x2={c * r * 1.34} y2={s * r * 1.34} stroke={C.ink} strokeWidth={r * 0.1} strokeLinecap="round" />
            <ellipse
              cx={c * r * 1.3}
              cy={s * r * 1.3}
              rx={r * 0.12}
              ry={r * 0.2}
              fill={C.ochreSoft}
              stroke={C.ink}
              strokeWidth={r * 0.05}
              transform={`rotate(${(a * 180) / Math.PI + 90} ${c * r * 1.3} ${s * r * 1.3})`}
            />
          </g>
        )
      })}
      <circle r={r} fill="none" stroke={C.ink} strokeWidth={r * 0.14} />
      <circle r={r} fill="none" stroke={C.ochreWash} strokeWidth={r * 0.06} />
      <circle r={r * 0.26} fill={hub} stroke={C.ink} strokeWidth={r * 0.07} />
    </g>
  )
}

// A layered, periodic sea. Shift by whole wavelengths and it loops forever.
export function seaPath(width: number, y: number, amp: number, len: number, bottom: number) {
  let d = `M ${-len} ${y}`
  const end = width + len * 5
  for (let x = -len; x < end; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`
  return `${d} L ${end} ${bottom} L ${-len} ${bottom} Z`
}

export function Chip({ x, y, tone, text, opacity = 1 }: { x: number; y: number; tone: 'ok' | 'bad' | 'info'; text: string; opacity?: number }) {
  const col = tone === 'ok' ? C.sap : tone === 'bad' ? C.vermilion : C.ultra
  const w = text.length * 7.6 + 34
  return (
    <g opacity={opacity} transform={`translate(${x} ${y})`}>
      <rect width={w} height={26} rx={13} fill={C.paper} stroke={col} strokeWidth={1.4} />
      <circle cx={14} cy={13} r={4.5} fill={col} />
      <text x={26} y={17.5} fontFamily={mono} fontSize={12.5} fill={col}>
        {text}
      </text>
    </g>
  )
}
