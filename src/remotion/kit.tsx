import type { ReactNode } from 'react'
import { Easing, interpolate } from 'remotion'
import { loadFont as loadGeist } from '@remotion/google-fonts/Geist'
import { loadFont as loadGeistMono } from '@remotion/google-fonts/GeistMono'

// Shared kit for every scene: one palette, one line weight, a few parts.
// Scenes are flat vector with no SVG filters, so a scroll-driven re-render
// costs a few milliseconds and the frame keeps up with the finger.

export const sans = loadGeist('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] }).fontFamily
export const mono = loadGeistMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily

export const C = {
  bg: '#07090c',
  panel: '#0d1117',
  panel2: '#131922',
  line: '#212a36',
  line2: '#2e3947',
  text: '#e8edf3',
  muted: '#8a95a5',
  dim: '#525d6c',
  accent: '#ff6b2c',
  accentSoft: '#3a1c10',
  ok: '#3ddc84',
  okSoft: '#0f2a1b',
  warn: '#ffb224',
  warnSoft: '#33260b',
  crit: '#ff4d5e',
  critSoft: '#35141a',
  info: '#5b9dff',
  infoSoft: '#122442',
}

export type Tone = 'idle' | 'run' | 'ok' | 'warn' | 'crit' | 'info' | 'accent'
export const toneColor: Record<Tone, string> = {
  idle: C.line2,
  run: C.accent,
  ok: C.ok,
  warn: C.warn,
  crit: C.crit,
  info: C.info,
  accent: C.accent,
}
const toneFill: Record<Tone, string> = {
  idle: C.panel2,
  run: C.accentSoft,
  ok: C.okSoft,
  warn: C.warnSoft,
  crit: C.critSoft,
  info: C.infoSoft,
  accent: C.accentSoft,
}

// Every scene is a square so one layout serves phones and desktops.
export const SCENE = { width: 800, height: 800, fps: 60, durationInFrames: 600 }

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
}
// Clamped 0→1 progress between two frames.
export const prog = (f: number, a: number, b: number, easing = ease.inOut) => interpolate(f, [a, b], [0, 1], { ...clamp, easing })
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const mix = (a: string, b: string, t: number) => (t < 0.5 ? a : b)

// A point a fraction t of the way along a polyline.
export function along(pts: [number, number][], t: number): [number, number] {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  let d = Math.max(0, Math.min(1, t)) * lens.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] ? d / lens[i] : 0
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]
    }
    d -= lens[i]
  }
  return pts[pts.length - 1]
}
export const poly = (pts: [number, number][]) => 'M' + pts.map((p) => p.join(' ')).join(' L')

export function Stage({ children }: { children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${SCENE.width} ${SCENE.height}`} width="100%" height="100%" style={{ display: 'block', fontFamily: sans }}>
      {/* a faint dotted grid, the "canvas" every scene sits on */}
      <defs>
        <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1.2" fill={C.line} />
        </pattern>
      </defs>
      <rect width={SCENE.width} height={SCENE.height} fill="url(#dots)" />
      {children}
    </svg>
  )
}

// A labelled block: a pipeline stage, a service, a cloud resource.
export function Node({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone = 'idle',
  opacity = 1,
  r = 14,
  align = 'left',
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  tone?: Tone
  opacity?: number
  r?: number
  align?: 'left' | 'center'
}) {
  const col = toneColor[tone]
  const tx = align === 'center' ? w / 2 : 20
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      {tone !== 'idle' && <rect x={-5} y={-5} width={w + 10} height={h + 10} rx={r + 5} fill="none" stroke={col} strokeOpacity={0.22} strokeWidth={6} />}
      <rect width={w} height={h} rx={r} fill={toneFill[tone]} stroke={col} strokeWidth={2} />
      <text x={tx} y={sub ? h / 2 - 4 : h / 2 + 9} textAnchor={align === 'center' ? 'middle' : 'start'} fontSize={25} fontWeight={600} fill={tone === 'idle' ? C.muted : C.text}>
        {title}
      </text>
      {sub && (
        <text x={tx} y={h / 2 + 24} textAnchor={align === 'center' ? 'middle' : 'start'} fontFamily={mono} fontSize={19} fill={tone === 'idle' ? C.dim : col}>
          {sub}
        </text>
      )}
    </g>
  )
}

// A connection that draws itself from 0 to `t`.
export function Wire({ d, t, tone = 'idle', dashed = false }: { d: string; t: number; tone?: Tone; dashed?: boolean }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={C.line} strokeWidth={3} strokeDasharray={dashed ? '6 10' : undefined} />
      {t > 0 && <path d={d} pathLength={1} stroke={toneColor[tone]} strokeWidth={3} strokeDasharray={`${t} 1`} />}
    </g>
  )
}

export function Packet({ x, y, tone = 'run', r = 9 }: { x: number; y: number; tone?: Tone; r?: number }) {
  const col = toneColor[tone]
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 2.2} fill={col} opacity={0.18} />
      <circle r={r} fill={col} />
    </g>
  )
}

export function Pill({ x, y, text, tone = 'info', opacity = 1, anchor = 'start' }: { x: number; y: number; text: string; tone?: Tone; opacity?: number; anchor?: 'start' | 'middle' | 'end' }) {
  const col = toneColor[tone]
  const w = text.length * 11.4 + 46
  const ox = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0
  return (
    <g transform={`translate(${x + ox} ${y})`} opacity={opacity}>
      <rect width={w} height={38} rx={19} fill={toneFill[tone]} stroke={col} strokeWidth={1.6} />
      <circle cx={21} cy={19} r={5.5} fill={col} />
      <text x={36} y={26} fontFamily={mono} fontSize={19} fill={col}>
        {text}
      </text>
    </g>
  )
}

// Monospace caption; `chars` reveals it like a terminal typing.
export function Mono({ x, y, text, size = 20, fill = C.muted, chars, weight = 400, anchor = 'start', opacity = 1 }: { x: number; y: number; text: string; size?: number; fill?: string; chars?: number; weight?: number; anchor?: 'start' | 'middle' | 'end'; opacity?: number }) {
  const shown = chars === undefined ? text : text.slice(0, Math.max(0, Math.floor(chars)))
  return (
    <text x={x} y={y} fontFamily={mono} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} opacity={opacity} style={{ whiteSpace: 'pre' }}>
      {shown}
    </text>
  )
}

export function Check({ x, y, s = 1, color = C.ok }: { x: number; y: number; s?: number; color?: string }) {
  return <path d="M-8 0 L-2 6 L9 -6" transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
}

// A small panel with a title bar, like a window in a dashboard.
export function Panel({ x, y, w, h, title, children, opacity = 1, tone }: { x: number; y: number; w: number; h: number; title: string; children?: ReactNode; opacity?: number; tone?: Tone }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect width={w} height={h} rx={16} fill={C.panel} stroke={tone ? toneColor[tone] : C.line2} strokeWidth={tone ? 2 : 1.5} />
      <line x1={0} x2={w} y1={46} y2={46} stroke={C.line} strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={22 + i * 18} cy={23} r={5} fill={C.line2} />
      ))}
      <text x={84} y={30} fontFamily={mono} fontSize={18} fill={C.muted}>
        {title}
      </text>
      {children}
    </g>
  )
}
