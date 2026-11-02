import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { Box, C, Chip, Defs, Helm, clamp, ease, lerp, osc, prog, seaPath, serifItalic, serif, useRaster, washSrc, type Blob } from './kit'

// Hero. Kubernetes is Greek for "helmsman": the cluster is a container ship,
// its cargo is Docker containers (pods), and the helm holds the desired
// state. A rogue wave knocks one container overboard; the helm turns, the
// ship's crane lifts an identical container out of the hold and sets it in
// the empty slot. pods 7/7 -> 6/7 -> 7/7.
//
// Rendered at 60 fps, timed in beats of 1/30 s (two frames each): a 12 s
// loop of 360 beats, and beat 360 draws exactly like beat 0. Every periodic
// motion divides 360, and everything that travels does whole laps.

export const HARBOUR = { width: 640, height: 520, fps: 60, durationInFrames: 720 }
const ID = 'hb'

// Crane geometry (pivot, boom length, the three boom angles).
const PIVOT = { x: 520, y: 226 }
const BOOM = 140
const A_REST = -70
const A_HOLD = -78.9
const A_SLOT = -126.4
const SLOT = { x: 405, y: 258 } // top-left of the top-tier container the wave takes
const HOLD = { x: 515, y: 333 }

const tip = (deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: PIVOT.x + Math.cos(a) * BOOM, y: PIVOT.y + Math.sin(a) * BOOM }
}
const craneAngle = (T: number) =>
  interpolate(T, [0, 120, 135, 172, 195, 228, 252, 360], [A_REST, A_REST, A_HOLD, A_HOLD, A_SLOT, A_SLOT, A_REST, A_REST], {
    ...clamp,
    easing: ease.inOut,
  })
// The ship rides two swells at once, so it never moves like a metronome.
const bobAt = (T: number) => osc(T, 120) * 3 + osc(T, 40, 0.3) * 0.8

const bottomTier = [
  { x: 240, fill: C.ochreSoft },
  { x: 306, fill: C.ultraSoft, whale: true },
  { x: 372, fill: C.sapSoft },
  { x: 438, fill: C.vermSoft },
]
const topTier = [
  { x: 273, fill: C.paper },
  { x: 339, fill: C.ochreSoft, whale: true },
]
const stars = [
  [70, 60],
  [150, 110],
  [228, 48],
  [300, 96],
  [372, 40],
  [420, 128],
  [604, 170],
  [24, 150],
]
// Night sky, baked once into an image: it no longer re-filters every frame.
const SKY: Blob[] = [
  { cx: 300, cy: 140, rx: 330, ry: 170, fill: C.night, opacity: 0.62 },
  { cx: 520, cy: 96, rx: 90, ry: 72, fill: C.moon, opacity: 0.28 },
]
const SKY_SRC = washSrc(SKY, { w: 640, h: 520 })

// Parts that never change shape are baked into images with the same ink
// wobble and hatching, then into bitmaps (useRaster), so each frame only
// copies pixels. Filtered live, they held the loop to about 30 fps.
const DEFS =
  `<pattern id='h' width='5' height='5' patternUnits='userSpaceOnUse' patternTransform='rotate(40)'><line x1='0' y1='0' x2='0' y2='5' stroke='${C.ink}' stroke-width='0.9' opacity='0.55'/></pattern>` +
  `<pattern id='hl' width='7' height='7' patternUnits='userSpaceOnUse' patternTransform='rotate(40)'><line x1='0' y1='0' x2='0' y2='7' stroke='${C.ink}' stroke-width='0.7' opacity='0.3'/></pattern>` +
  `<filter id='r' x='-5%' y='-5%' width='110%' height='110%'><feTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='1' seed='3'/><feDisplacementMap in='SourceGraphic' scale='1.5'/></filter>`
const bake = (body: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 520' width='640' height='520'><defs>${DEFS}</defs>${body}</svg>`)}`
const ink = (w: number) => `stroke='${C.ink}' stroke-width='${w}'`


// The torn paper edge, as a clip path: slow drift plus fibrous jitter from a
// fixed hash, so it reads as torn rather than scalloped. Far cheaper per
// frame than a filtered mask.
const grain = (k: number) => {
  const h = Math.sin(k * 12.9898) * 43758.5453
  return h - Math.floor(h) - 0.5
}
const tear = (k: number) => Math.sin(k * 0.047 + 1) * 2.6 + Math.sin(k * 0.19 + 2) * 1.2 + grain(k) * 2.8 + grain(k * 0.5 + 7) * 1.4
const DECKLE = (() => {
  const pts: string[] = []
  for (let x = 12; x <= 628; x += 4) pts.push(`${x} ${(12 + tear(x)).toFixed(1)}`)
  for (let y = 12; y <= 508; y += 4) pts.push(`${(628 + tear(y + 300)).toFixed(1)} ${y}`)
  for (let x = 628; x >= 12; x -= 4) pts.push(`${x} ${(508 + tear(x + 700)).toFixed(1)}`)
  for (let y = 508; y >= 12; y -= 4) pts.push(`${(12 + tear(y + 1100)).toFixed(1)} ${y}`)
  return `M ${pts.join(' L ')} Z`
})()
const HEADLAND = 'M-20 360 C 10 320, 40 300, 90 306 C 120 310, 140 330, 160 360 Z'
const HEADLAND_SRC = bake(
  `<g filter='url(#r)'>` +
    `<path d='${HEADLAND}' fill='${C.paper2}' ${ink(1.8)}/><path d='${HEADLAND}' fill='url(#hl)'/>` +
    `<path d='M40 304 L 46 232 L 58 232 L 64 304 Z' fill='${C.paper}' ${ink(1.8)}/>` +
    [248, 272, 292].map((y) => `<rect x='${44 + (304 - y) * 0.05}' y='${y}' width='${16 - (304 - y) * 0.1}' height='8' fill='${C.vermWash}'/>`).join('') +
    `<rect x='45' y='216' width='14' height='16' fill='${C.moon}' ${ink(1.6)}/><path d='M42 216 L 52 206 L 62 216 Z' fill='${C.ink}'/>` +
    `</g>`,
)
const HULL = 'M108 318 L 566 318 L 606 302 L 584 386 L 134 386 C 120 386, 110 374, 108 358 Z'
const SHIP_SRC = bake(
  `<g filter='url(#r)'>` +
    `<rect x='122' y='240' width='76' height='80' fill='${C.paper}' ${ink(2)}/><rect x='122' y='240' width='76' height='80' fill='url(#hl)'/>` +
    `<rect x='116' y='232' width='88' height='10' fill='${C.paper}' ${ink(2)}/>` +
    [128, 142, 156, 170, 184].map((x) => `<rect x='${x}' y='250' width='10' height='9' fill='${C.moon}' ${ink(1.2)}/>`).join('') +
    [138, 170].map((x) => `<rect x='${x}' y='278' width='10' height='9' fill='${C.moon}' ${ink(1.1)}/>`).join('') +
    `<path d='M150 232 L 154 206 L 174 206 L 178 232 Z' fill='${C.paper}' ${ink(2)}/><rect x='153' y='212' width='22' height='6' fill='${C.vermWash}'/>` +
    `<path d='${HULL}' fill='${C.hull}' ${ink(2.4)}/><path d='${HULL}' fill='url(#h)'/>` +
    `<path d='M109 362 L 590 362 L 584 386 L 134 386 C 120 386, 111 376, 109 362 Z' fill='${C.vermWash}' ${ink(1.6)}/>` +
    `<line x1='110' y1='330' x2='574' y2='330' stroke='${C.paper}' stroke-width='2'/>` +
    `</g>`,
)

// What the caption says, beat by beat. The last line repeats the first so
// the loop closes on the same words.
const STORY = [
  { from: 0, text: 'The helm keeps the desired state.' },
  { from: 82, text: 'A rogue wave takes a pod overboard.' },
  { from: 126, text: 'Six of seven. The helm sees the drift.' },
  { from: 150, text: 'The crane lifts an identical pod from the hold.' },
  { from: 214, text: 'Seven of seven. Desired state, restored.' },
  { from: 320, text: 'The helm keeps the desired state.' },
]

// The wave that curls over the bow and breaks across the top tier.
function RogueWave({ t }: { t: number }) {
  if (t < 0 || t > 44) return null
  const rise = prog(t, 0, 19, ease.out)
  const fall = prog(t, 19, 36, ease.inOut)
  const px = lerp(lerp(566, 446, rise), 416, fall)
  const py = lerp(lerp(392, 226, rise), 338, fall)
  const d = `M ${px + 120} 408 C ${px + 96} ${py + 96}, ${px + 58} ${py}, ${px} ${py} C ${px - 20} ${py}, ${px - 28} ${py + 20}, ${px - 10} ${py + 28} C ${px + 12} ${py + 32}, ${px + 30} ${py + 64}, ${px + 44} 408 Z`
  const breaking = prog(t, 16, 34, ease.out)
  return (
    <g opacity={interpolate(t, [0, 4, 30, 42], [0, 1, 1, 0], clamp)}>
      <path d={d} fill={C.ultraWash} stroke={C.ink} strokeWidth={2} filter={`url(#${ID}-rough)`} />
      <path d={d} fill={`url(#${ID}-hatch-light)`} />
      {/* the white lip of the curl, and lace along its back */}
      <path d={`M ${px - 10} ${py + 28} C ${px - 28} ${py + 20}, ${px - 20} ${py}, ${px} ${py} C ${px + 30} ${py}, ${px + 62} ${py + 30}, ${px + 80} ${py + 70}`} fill="none" stroke={C.paper} strokeWidth={3.2} strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={px - 8 + i * 8} cy={py + 3 - (i % 2) * 4 + i * 1.6} r={3.2 - (i % 3) * 0.5} fill={C.paper} stroke={C.ink} strokeWidth={0.9} />
      ))}
      {/* spray thrown forward as it breaks, falling under its own weight */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (-160 + i * 13) * (Math.PI / 180)
        const sp = 46 + (i % 3) * 14
        const x = px + Math.cos(a) * sp * breaking
        const y = py + Math.sin(a) * sp * 0.8 * breaking + 40 * breaking * breaking
        return <circle key={`s${i}`} cx={x} cy={y} r={2.6 - (i % 3) * 0.6} fill={C.paper} stroke={C.ink} strokeWidth={0.7} opacity={breaking > 0 && breaking < 1 ? 1 - breaking : 0} />
      })}
    </g>
  )
}

// Where the lost container hits the water: droplets, then rings that spread.
function Splash({ t }: { t: number }) {
  if (t < 0 || t > 60) return null
  const burst = prog(t, 0, 22, ease.out)
  return (
    <g>
      <g opacity={1 - prog(t, 12, 26)}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (-165 + i * 19) * (Math.PI / 180)
          const r = 34 + (i % 3) * 10
          return <circle key={i} cx={350 + Math.cos(a) * r * burst} cy={396 + Math.sin(a) * r * 0.9 * burst + 26 * burst * burst} r={3 - (i % 2)} fill={C.paper} stroke={C.ink} strokeWidth={0.8} />
        })}
      </g>
      {[0, 1].map((k) => {
        const g = prog(t, 6 + k * 10, 54 + k * 6, ease.out)
        return g > 0 && g < 1 ? <ellipse key={k} cx={350 - 30 * g} cy={410} rx={14 + 54 * g} ry={3 + 6 * g} fill="none" stroke={C.paper} strokeWidth={1.6} opacity={0.8 * (1 - g)} /> : null
      })}
    </g>
  )
}

// A crane boom drawn as a lattice: two chords and zig-zag bracing.
function Lattice({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  const nx = (-dy / len) * 4
  const ny = (dx / len) * 4
  const n = 9
  let zig = `M ${x1 + nx} ${y1 + ny}`
  for (let i = 1; i <= n; i++) {
    const k = i / n
    const side = i % 2 ? -1 : 1
    zig += ` L ${x1 + dx * k + nx * side} ${y1 + dy * k + ny * side}`
  }
  return (
    <g>
      <line x1={x1 + nx} y1={y1 + ny} x2={x2} y2={y2} stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
      <line x1={x1 - nx} y1={y1 - ny} x2={x2} y2={y2} stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
      <path d={zig} fill="none" stroke={C.ink} strokeWidth={0.9} />
    </g>
  )
}

// Two gulls following the ship, wings beating. One lap of a 760px track per
// loop, entering and leaving off-canvas.
function Gulls({ T }: { T: number }) {
  return (
    <g fill="none" stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {[
        { x0: 120, y0: 150, ph: 0 },
        { x0: 470, y0: 178, ph: 0.4 },
      ].map(({ x0, y0, ph }, i) => {
        const x = ((x0 + (T * 760) / 360) % 760) - 60
        const y = y0 + osc(T, 90, ph) * 6
        const w = osc(T, 12, ph) * 4
        return <path key={i} d={`M ${x - 10} ${y - 1 + w} Q ${x - 5} ${y - 6 + w * 0.4} ${x} ${y} Q ${x + 5} ${y - 6 + w * 0.4} ${x + 10} ${y - 1 + w}`} />
      })}
    </g>
  )
}

// Moonlight on the water and foam lines drifting past, so the sea is never a flat block.
function SeaDetail({ T }: { T: number }) {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const w = 26 - i * 3 + osc(T, 45, i * 0.3) * 6
        return <line key={i} x1={520 - w / 2} y1={414 + i * 11} x2={520 + w / 2} y2={414 + i * 11} stroke={C.moon} strokeWidth={2.2} strokeLinecap="round" opacity={0.75 - i * 0.1} />
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        // two full laps of a 760px track per loop, so beat 360 matches beat 0
        const x = ((((i * 157 - (T / 360) * 760 * 2) % 760) + 760) % 760) - 60
        const y = 430 + (i % 3) * 22
        return <path key={`fm${i}`} d={`M ${x} ${y} q 12 -5 24 0 t 24 0`} fill="none" stroke={C.paper} strokeWidth={1.4} strokeLinecap="round" opacity={0.45} />
      })}
    </g>
  )
}

// White water where the bow cuts the sea, and the wake streaming off the stern.
function Wash({ T, bob }: { T: number; bob: number }) {
  return (
    <g fill="none" stroke={C.paper} strokeLinecap="round">
      <path d={`M 578 ${380 + bob} q 14 ${-9 + osc(T, 30) * 2} 28 -4 q 8 3 16 ${1 + osc(T, 30, 0.3)}`} strokeWidth={2.4} />
      <path d={`M 586 ${388 + bob} q 12 -5 24 -1 t 20 2`} strokeWidth={1.6} opacity={0.7} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={610 + i * 7} cy={376 + bob - Math.abs(osc(T, 30, i * 0.3)) * 6} r={1.8} fill={C.paper} stroke="none" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        // 2px a beat over a 120px track: six whole laps per loop
        const d = (i * 20 + T * 2) % 120
        return <line key={`w${i}`} x1={104 - d} y1={378 + (i % 2) * 7} x2={104 - d - (18 - d / 9)} y2={378 + (i % 2) * 7} strokeWidth={1.8} opacity={0.75 * (1 - d / 120)} />
      })}
    </g>
  )
}

export const Harbour: React.FC = () => {
  const T = useCurrentFrame() / 2
  const sky = useRaster(SKY_SRC, 640, 520)
  const headland = useRaster(HEADLAND_SRC, 640, 520)
  const ship = useRaster(SHIP_SRC, 640, 520)

  // --- the crane's replacement run ---
  const angle = craneAngle(T)
  const t = tip(angle)
  // the load lags the boom while it swings, and catches up as it stops
  const lag = -(angle - craneAngle(T - 4)) * 1.6
  const hookX = t.x + lag
  const carrying = T >= 150 && T < 210
  const newY = interpolate(T, [150, 172, 195, 210], [HOLD.y + 15, 164, 164, SLOT.y + 15], { ...clamp, easing: ease.inOut })
  const newX = carrying ? hookX : T >= 210 ? SLOT.x + 32 : HOLD.x + 32
  const hookY = carrying
    ? newY - 15
    : T < 150
      ? interpolate(T, [0, 135, 150], [t.y + 40, t.y + 40, HOLD.y], { ...clamp, easing: ease.inOut })
      : interpolate(T, [210, 228], [SLOT.y, t.y + 40], { ...clamp, easing: ease.inOut })
  const hatch = interpolate(T, [116, 130, 212, 224], [0, 1, 1, 0], { ...clamp, easing: ease.inOut })
  const settle = T >= 204 && T < 216 ? Math.sin(prog(T, 204, 216, ease.out) * Math.PI) * -3 : 0

  // --- the helm: small corrections, then a hard turn to hold course ---
  const helm =
    osc(T, 120, 0.1) * 9 +
    interpolate(T, [116, 126, 176, 192], [0, -26, 384, 360], { ...clamp, easing: [ease.out, ease.inOut, ease.out] }) -
    (T >= 192 ? 360 : 0)

  // --- the container the wave takes: it falls, floats a while, then sinks ---
  const bob = bobAt(T)
  const roll = osc(T, 120, 0.25) * 1.1
  const gone = prog(T, 96, 124, ease.in)
  const afloat = prog(T, 124, 146, ease.out)
  const drift = prog(T, 124, 240, (x) => x)
  const sink = prog(T, 176, 236, ease.in)
  const lost =
    T < 124
      ? { x: lerp(SLOT.x, 318, gone), y: lerp(SLOT.y + bobAt(96), 380, gone * gone), r: -58 * gone }
      : { x: lerp(318, 214, drift), y: lerp(380, 366, afloat) + osc(T, 60) * 3 * afloat + sink * 56, r: lerp(-58, -16, afloat) + osc(T, 60, 0.2) * 4 * afloat }
  const lostShown = T >= 96 && T < 240

  const missing = T >= 100 && T < 210
  const zoom = interpolate(T, [104, 150, 226, 272], [1, 1.16, 1.16, 1], { ...clamp, easing: ease.inOut })
  const beam = Math.max(0, osc(T, 180, 0.25))
  const radar = Math.abs(Math.cos((T / 60) * Math.PI * 2))
  const flag = osc(T, 20) * 2.2
  const shoot = prog(T, 296, 312, ease.out)

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 640 520" width="100%" height="100%">
        <Defs id={ID} f={T} />
        <clipPath id={`${ID}-edge`}>
          <path d={DECKLE} />
        </clipPath>
        <linearGradient id={`${ID}-beam`} gradientUnits="userSpaceOnUse" x1={52} y1={224} x2={640} y2={224}>
          <stop offset="0" stopColor={C.moon} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.moon} stopOpacity={0} />
        </linearGradient>
        <g clipPath={`url(#${ID}-edge)`}>
        <g transform={`translate(330 300) scale(${zoom}) translate(-330 -300)`}>
          {/* night sky, moon and stars */}
          <image href={sky} x={0} y={0} width={640} height={520} />
          <circle cx={520} cy={92} r={26} fill={C.moon} stroke={C.ink} strokeWidth={2} />
          <path d="M520 66 A 26 26 0 0 1 520 118 A 18 26 0 0 0 520 66 Z" fill={`url(#${ID}-hatch-light)`} />
          {stars.map(([x, y], i) => {
            const tw = 0.35 + 0.65 * Math.abs(osc(T, 90, i * 0.21))
            return (
              <path
                key={i}
                d={`M${x} ${y - 5} L${x + 1.3} ${y - 1.3} L${x + 5} ${y} L${x + 1.3} ${y + 1.3} L${x} ${y + 5} L${x - 1.3} ${y + 1.3} L${x - 5} ${y} L${x - 1.3} ${y - 1.3} Z`}
                fill={C.moon}
                opacity={tw}
              />
            )
          })}
          {/* once a loop, a shooting star */}
          {shoot > 0 && shoot < 1 && (
            <line
              x1={lerp(110, 250, shoot)}
              y1={lerp(30, 86, shoot)}
              x2={lerp(110, 250, shoot) - 34}
              y2={lerp(30, 86, shoot) - 13.6}
              stroke={C.moon}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={Math.sin(shoot * Math.PI)}
            />
          )}
          <Gulls T={T} />

          {/* headland and lighthouse; the beam comes from the lamp and sweeps twice a loop */}
          <path d={`M 52 224 L 640 ${196 + osc(T, 180) * 4} L 640 ${252 - osc(T, 180) * 4} Z`} fill={`url(#${ID}-beam)`} opacity={beam * 0.32} />
          <image href={headland} x={0} y={0} width={640} height={520} />
          <circle cx={52} cy={224} r={9} fill={C.moon} opacity={0.25 + beam * 0.35} />

          {/* back sea */}
          <path d={seaPath(640, 350, 7, 90, 520)} fill={C.ultraSoft} style={{ translate: `${-(T / 360) * 90 * 2}px 0px` }} />

          {/* the ship */}
          <Interactive.G name="Ship" style={{ translate: `0px ${bob}px`, rotate: `${roll}deg`, transformOrigin: '350px 370px' }}>
            {/* the new container, rising out of the hold behind the hull */}
            {T >= 150 && T < 160 && <Box id={ID} x={newX - 32} y={newY - 15} w={64} fill={C.ultraSoft} />}

            {/* smoke streams aft: the ship is making way to the right */}
            {[0, 1, 2].map((i) => {
              const s = ((T + i * 30) % 90) / 90
              return <circle key={i} cx={164 - s * 44} cy={204 - s * 46} r={6 + s * 12} fill={C.rule} opacity={Math.sin(s * Math.PI) * 0.65} />
            })}

            {/* bridge, funnel and hull, baked */}
            <image href={ship} x={0} y={0} width={640} height={520} />
            {/* hull plating seams, portholes, draft marks and the anchor */}
            {[176, 252, 328, 404].map((x) => (
              <line key={x} x1={x} y1={333} x2={x} y2={361} stroke={C.ink} strokeWidth={1} opacity={0.35} />
            ))}
            {Array.from({ length: 15 }, (_, i) => (
              <circle key={i} cx={140 + i * 22} cy={344} r={2.8} fill={C.moon} stroke={C.ink} strokeWidth={1} opacity={0.9} />
            ))}
            {[367, 373, 379].map((y) => (
              <line key={y} x1={574} y1={y} x2={580} y2={y} stroke={C.paper} strokeWidth={1.2} />
            ))}
            <g fill="none" stroke={C.paper} strokeWidth={1.5} strokeLinecap="round">
              <circle cx={586} cy={333} r={2.4} />
              <line x1={586} y1={335.5} x2={586} y2={347} />
              <line x1={582} y1={338} x2={590} y2={338} />
              <path d="M 580 343 Q 586 351 592 343" />
            </g>
            <text x={474} y={356} fontFamily={serif} fontSize={12} letterSpacing={1.6} fill={C.paper}>
              ΚΥΒΕΡΝΗΤΗΣ
            </text>
            {/* the hold: dark below as its lid slides open */}
            <rect x={506} y={312} width={52} height={6} fill={C.ink} opacity={0.85 * hatch} />
            <rect x={506 + hatch * 36} y={312} width={52} height={7} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.4} />

            {/* mast, radar and masthead light on the bridge roof */}
            <line x1={192} y1={232} x2={192} y2={196} stroke={C.ink} strokeWidth={2} />
            <line x1={185} y1={208} x2={199} y2={208} stroke={C.ink} strokeWidth={1.4} />
            <rect x={192 - 9 * radar} y={198} width={18 * radar + 0.5} height={3} fill={C.ink} />
            <circle cx={192} cy={192} r={5} fill={C.moon} opacity={0.35} />
            <circle cx={192} cy={192} r={2.2} fill={C.moon} stroke={C.ink} strokeWidth={0.8} />
            {/* the ensign at the stern, streaming aft */}
            <line x1={114} y1={318} x2={114} y2={286} stroke={C.ink} strokeWidth={1.6} />
            <path d={`M 114 287 Q ${104 + flag * 0.5} ${287 + flag} 94 ${290 + flag} L ${95 + flag * 0.3} ${297 + flag} Q ${104} ${298 - flag * 0.5} 114 297 Z`} fill={C.vermWash} stroke={C.ink} strokeWidth={1.1} />
            {/* a rail along the foredeck */}
            <path d="M 532 309 L 566 309 L 600 295" fill="none" stroke={C.ink} strokeWidth={1.2} />
            {[536, 546, 556, 566, 577, 588, 598].map((x) => {
              const top = x <= 566 ? 309 : 309 - ((x - 566) / 34) * 14
              const deck = x <= 566 ? 318 : 318 - ((x - 566) / 40) * 16
              return <line key={x} x1={x} y1={top} x2={x} y2={deck} stroke={C.ink} strokeWidth={1} />
            })}

            {/* cargo */}
            {bottomTier.map((b) => (
              <Box key={b.x} id={ID} x={b.x} y={288} w={64} fill={b.fill} whale={b.whale} />
            ))}
            {topTier.map((b) => (
              <Box key={b.x} id={ID} x={b.x} y={258} w={64} fill={b.fill} whale={b.whale} />
            ))}
            {/* the desired slot, drawn while it is empty */}
            <rect
              x={SLOT.x}
              y={SLOT.y}
              width={64}
              height={30}
              fill="none"
              stroke={C.ultra}
              strokeWidth={1.6}
              strokeDasharray="5 4"
              opacity={missing ? 0.5 + 0.5 * Math.abs(osc(T, 30)) : 0}
            />
            {/* the original container, until the wave takes it */}
            {T < 96 && <Box id={ID} x={SLOT.x} y={SLOT.y} w={64} fill={C.ultraSoft} />}

            {/* the helm, in front of the bridge */}
            <line x1={214} y1={318} x2={214} y2={292} stroke={C.ink} strokeWidth={4} />
            <g transform="translate(214 286)">
              <g style={{ rotate: `${helm}deg` }}>
                <Helm r={17} />
              </g>
            </g>

            {/* the ship's crane */}
            <g filter={`url(#${ID}-rough)`}>
              <path d={`M${PIVOT.x - 7} 318 L ${PIVOT.x - 4} ${PIVOT.y} L ${PIVOT.x + 4} ${PIVOT.y} L ${PIVOT.x + 7} 318 Z`} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.8} />
              <Lattice x1={PIVOT.x} y1={PIVOT.y} x2={t.x} y2={t.y} />
              <line x1={PIVOT.x} y1={PIVOT.y - 22} x2={t.x} y2={t.y} stroke={C.ink} strokeWidth={1.2} />
              <line x1={PIVOT.x} y1={PIVOT.y - 22} x2={PIVOT.x} y2={PIVOT.y} stroke={C.ink} strokeWidth={2} />
              <rect x={PIVOT.x - 10} y={PIVOT.y - 6} width={20} height={14} fill={C.ochreWash} stroke={C.ink} strokeWidth={1.6} />
            </g>
            <line x1={t.x} y1={t.y} x2={hookX} y2={hookY} stroke={C.ink} strokeWidth={1.4} />
            <path d={`M${hookX - 6} ${hookY} q 6 8 12 0`} fill="none" stroke={C.ink} strokeWidth={2} />
            {/* the replacement: on the hook, then set down in the slot */}
            {T >= 160 && <Box id={ID} x={newX - 32} y={newY - 15 + settle} w={64} fill={C.ultraSoft} />}
          </Interactive.G>

          <RogueWave t={T - 78} />

          {/* front seas */}
          <path d={seaPath(640, 374, 9, 130, 520)} fill={C.ultraWash} opacity={0.85} style={{ translate: `${-(T / 360) * 130 * 3}px 0px` }} />
          <path d={seaPath(640, 374, 9, 130, 520)} fill={`url(#${ID}-hatch-light)`} style={{ translate: `${-(T / 360) * 130 * 3}px 0px` }} />
          <Wash T={T} bob={bob} />
          {/* the lost container: tumbling in, afloat on the near swell, then gone
              under the front sea */}
          {lostShown && (
            <g transform={`translate(${lost.x + 32} ${lost.y + 15}) rotate(${lost.r}) translate(-32 -15)`} opacity={1 - prog(T, 214, 238)}>
              <Box id={ID} x={0} y={0} w={64} fill={C.ultraSoft} />
            </g>
          )}
          {T >= 180 && T < 252 &&
            [0, 1, 2, 3].map((i) => {
              const b = prog(T, 180 + i * 12, 206 + i * 12, ease.out)
              return b > 0 && b < 1 ? <circle key={i} cx={lerp(300, 246, prog(T, 180, 240)) + (i % 2 ? 8 : -4) + osc(T, 20, i * 0.25) * 2} cy={398 - b * 22} r={2 + (i % 2)} fill="none" stroke={C.paper} strokeWidth={1.2} opacity={1 - b} /> : null
            })}

          <path d={seaPath(640, 404, 11, 170, 520)} fill={C.night} opacity={0.92} style={{ translate: `${-(T / 360) * 170 * 4}px 0px` }} />
          <Splash t={T - 122} />
          <SeaDetail T={T} />
        </g>
        </g>

        {/* status: the cluster's view of the cargo */}
        <Chip x={20} y={20} tone={missing ? 'bad' : 'ok'} text={missing ? 'pods 6/7 · reconciling' : 'pods 7/7 · desired state'} />
        {STORY.map((s, i) => {
          const next = STORY[i + 1]
          const fadeIn = i === 0 ? 1 : prog(T, s.from, s.from + 8, ease.out)
          const fadeOut = next ? 1 - prog(T, next.from - 6, next.from, ease.inOut) : 1
          const o = fadeIn * fadeOut
          return o > 0.001 ? (
            <Interactive.Text key={i} name={`Caption ${i + 1}`} x={22} y={496} fontFamily={serifItalic} fontSize={17} fill={C.paper} opacity={o}>
              {s.text}
            </Interactive.Text>
          ) : null
        })}
      </svg>
    </AbsoluteFill>
  )
}
