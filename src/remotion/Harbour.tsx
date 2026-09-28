import { AbsoluteFill, Interactive, Sequence, interpolate, useCurrentFrame } from 'remotion'
import { Box, C, Chip, Defs, Helm, clamp, ease, lerp, osc, prog, seaPath, serifItalic, serif } from './kit'

// Hero. Kubernetes is Greek for "helmsman": the cluster is a container ship,
// its cargo is Docker containers (pods), and the helm holds the desired
// state. A rogue wave knocks one container overboard; the helm turns, the
// ship's crane lifts an identical container out of the hold and sets it in
// the empty slot. pods 7/7 -> 6/7 -> 7/7. 12s loop; frame 0 == frame 360.

export const HARBOUR = { width: 640, height: 520, fps: 30, durationInFrames: 360 }
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

// The wave that curls over the bow and breaks across the top tier.
function RogueWave() {
  const f = useCurrentFrame()
  const rise = prog(f, 0, 19, ease.out)
  const fall = prog(f, 19, 36, ease.in)
  const px = lerp(lerp(566, 446, rise), 416, fall)
  const py = lerp(lerp(392, 226, rise), 338, fall)
  const d = `M ${px + 120} 408 C ${px + 96} ${py + 96}, ${px + 58} ${py}, ${px} ${py} C ${px - 20} ${py}, ${px - 28} ${py + 20}, ${px - 10} ${py + 28} C ${px + 12} ${py + 32}, ${px + 30} ${py + 64}, ${px + 44} 408 Z`
  return (
    <g opacity={interpolate(f, [0, 4, 30, 40], [0, 1, 1, 0], clamp)}>
      <path d={d} fill={C.ultraWash} stroke={C.ink} strokeWidth={2} filter={`url(#${ID}-rough)`} />
      <path d={d} fill={`url(#${ID}-hatch-light)`} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={px - 6 + i * 9} cy={py + 4 - (i % 2) * 5} r={3.4} fill={C.paper} stroke={C.ink} strokeWidth={1} />
      ))}
      {/* spray as it breaks */}
      {Array.from({ length: 9 }, (_, i) => {
        const t = prog(f, 18, 34, ease.out)
        const a = (-150 + i * 16) * (Math.PI / 180)
        return <circle key={`s${i}`} cx={px + Math.cos(a) * 60 * t} cy={py + Math.sin(a) * 50 * t} r={2.4} fill={C.paper} stroke={C.ink} strokeWidth={0.8} opacity={t > 0 && t < 1 ? 1 - t : 0} />
      })}
    </g>
  )
}

function Splash() {
  const f = useCurrentFrame()
  const t = prog(f, 0, 22, ease.out)
  return (
    <g opacity={1 - prog(f, 12, 24)}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (-160 + i * 23) * (Math.PI / 180)
        return <circle key={i} cx={348 + Math.cos(a) * 40 * t} cy={392 + Math.sin(a) * 34 * t - 10 * t} r={3} fill={C.paper} stroke={C.ink} strokeWidth={0.9} />
      })}
      <ellipse cx={348} cy={394} rx={30 * t} ry={6 * t} fill="none" stroke={C.paper} strokeWidth={2} />
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

// Moonlight on the water and foam lines drifting past, so the sea is never a flat block.
function SeaDetail({ f }: { f: number }) {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const w = 26 - i * 3 + osc(f, 45, i * 0.3) * 6
        return <line key={i} x1={520 - w / 2} y1={414 + i * 11} x2={520 + w / 2} y2={414 + i * 11} stroke={C.moon} strokeWidth={2.2} strokeLinecap="round" opacity={0.75 - i * 0.1} />
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        // two full laps of a 760px track per loop, so frame 360 matches frame 0
        const x = ((((i * 157 - (f / 360) * 760 * 2) % 760) + 760) % 760) - 60
        const y = 430 + (i % 3) * 22
        return <path key={`fm${i}`} d={`M ${x} ${y} q 12 -5 24 0 t 24 0`} fill="none" stroke={C.paper} strokeWidth={1.4} strokeLinecap="round" opacity={0.45} />
      })}
    </g>
  )
}

export const Harbour: React.FC = () => {
  const f = useCurrentFrame()

  // --- the crane's replacement run (frames are absolute here) ---
  const angle = interpolate(f, [0, 120, 135, 172, 195, 228, 252, 360], [A_REST, A_REST, A_HOLD, A_HOLD, A_SLOT, A_SLOT, A_REST, A_REST], {
    ...clamp,
    easing: ease.inOut,
  })
  const t = tip(angle)
  const carrying = f >= 150 && f < 210
  // container centre while it is on the hook
  const newY = interpolate(f, [150, 172, 195, 210], [HOLD.y + 15, 164, 164, SLOT.y + 15], { ...clamp, easing: ease.inOut })
  const newX = carrying ? t.x : f >= 210 ? SLOT.x + 32 : HOLD.x + 32
  const hookY = carrying
    ? newY - 15
    : f < 150
      ? interpolate(f, [0, 135, 150], [t.y + 40, t.y + 40, HOLD.y], { ...clamp, easing: ease.inOut })
      : interpolate(f, [210, 228], [SLOT.y, t.y + 40], { ...clamp, easing: ease.inOut })
  const hatch = interpolate(f, [116, 130, 212, 224], [0, 1, 1, 0], clamp)
  const settle = f >= 204 && f < 216 ? Math.sin(prog(f, 204, 216, ease.out) * Math.PI) * -3 : 0

  // --- the helm: small corrections, then a hard turn to hold course ---
  const helm =
    osc(f, 120, 0.1) * 9 +
    interpolate(f, [116, 126, 176, 192], [0, -26, 384, 360], { ...clamp, easing: [ease.out, ease.inOut, ease.out] }) -
    (f >= 192 ? 360 : 0)

  // --- the container the wave takes ---
  const gone = prog(f, 96, 124, ease.in)
  const lost = f >= 96 ? { x: lerp(SLOT.x, 318, gone), y: lerp(SLOT.y, 402, gone * gone), r: -58 * gone } : { x: SLOT.x, y: SLOT.y, r: 0 }

  const missing = f >= 100 && f < 210
  const zoom = interpolate(f, [104, 150, 226, 272], [1, 1.16, 1.16, 1], { ...clamp, easing: ease.inOut })
  const bob = osc(f, 120) * 3
  const roll = osc(f, 120, 0.25) * 1.1

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 640 520" width="100%" height="100%">
        <Defs id={ID} f={f} deckle={{ w: 640, h: 520 }} />
        <g mask={`url(#${ID}-deckle)`}>
        <g transform={`translate(330 300) scale(${zoom}) translate(-330 -300)`}>
          {/* night sky */}
          <g filter={`url(#${ID}-wash)`}>
            <ellipse cx={300} cy={140} rx={330} ry={170} fill={C.night} opacity={0.62} />
            <ellipse cx={520} cy={96} rx={90} ry={72} fill={C.moon} opacity={0.28} />
          </g>
          <circle cx={520} cy={92} r={26} fill={C.moon} stroke={C.ink} strokeWidth={2} />
          <path d="M520 66 A 26 26 0 0 1 520 118 A 18 26 0 0 0 520 66 Z" fill={`url(#${ID}-hatch-light)`} />
          {stars.map(([x, y], i) => {
            const tw = 0.35 + 0.65 * Math.abs(osc(f, 90, i * 0.21))
            return (
              <path
                key={i}
                d={`M${x} ${y - 5} L${x + 1.3} ${y - 1.3} L${x + 5} ${y} L${x + 1.3} ${y + 1.3} L${x} ${y + 5} L${x - 1.3} ${y + 1.3} L${x - 5} ${y} L${x - 1.3} ${y - 1.3} Z`}
                fill={C.moon}
                opacity={tw}
              />
            )
          })}

          {/* headland and lighthouse, beam sweeping twice a loop */}
          <path
            d={`M 20 222 L 640 ${196 + osc(f, 180) * 4} L 640 ${252 - osc(f, 180) * 4} Z`}
            fill={C.moon}
            opacity={Math.max(0, osc(f, 180, 0.25)) * 0.22}
          />
          <g filter={`url(#${ID}-rough)`}>
            <path d="M-20 360 C 10 320, 40 300, 90 306 C 120 310, 140 330, 160 360 Z" fill={C.paper2} stroke={C.ink} strokeWidth={1.8} />
            <path d="M-20 360 C 10 320, 40 300, 90 306 C 120 310, 140 330, 160 360 Z" fill={`url(#${ID}-hatch-light)`} />
            <path d="M40 304 L 46 232 L 58 232 L 64 304 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.8} />
            {[248, 272, 292].map((y) => (
              <rect key={y} x={44 + (304 - y) * 0.05} y={y} width={16 - (304 - y) * 0.1} height={8} fill={C.vermWash} />
            ))}
            <rect x={45} y={216} width={14} height={16} fill={C.moon} stroke={C.ink} strokeWidth={1.6} />
            <path d="M42 216 L 52 206 L 62 216 Z" fill={C.ink} />
          </g>

          {/* back sea */}
          <path d={seaPath(640, 350, 7, 90, 520)} fill={C.ultraSoft} style={{ translate: `${-(f / 360) * 90 * 2}px 0px` }} />

          {/* the ship */}
          <Interactive.G name="Ship" style={{ translate: `0px ${bob}px`, rotate: `${roll}deg`, transformOrigin: '350px 370px' }}>
            {/* the new container, rising out of the hold behind the hull */}
            {f >= 150 && f < 160 && <Box id={ID} x={newX - 32} y={newY - 15} w={64} fill={C.ultraSoft} />}

            <g filter={`url(#${ID}-rough)`}>
              {/* smoke */}
              {[0, 1, 2].map((i) => {
                const s = ((f + i * 30) % 90) / 90
                return <circle key={i} cx={162 + s * 36} cy={206 - s * 58} r={6 + s * 12} fill={C.rule} opacity={(1 - s) * 0.7} />
              })}
              {/* bridge */}
              <rect x={122} y={240} width={76} height={80} fill={C.paper} stroke={C.ink} strokeWidth={2} />
              <rect x={122} y={240} width={76} height={80} fill={`url(#${ID}-hatch-light)`} />
              <rect x={116} y={232} width={88} height={10} fill={C.paper} stroke={C.ink} strokeWidth={2} />
              {[128, 142, 156, 170, 184].map((x) => (
                <rect key={x} x={x} y={250} width={10} height={9} fill={C.moon} stroke={C.ink} strokeWidth={1.2} />
              ))}
              <path d="M150 232 L 154 206 L 174 206 L 178 232 Z" fill={C.paper} stroke={C.ink} strokeWidth={2} />
              <rect x={153} y={212} width={22} height={6} fill={C.vermWash} />

              {/* hull */}
              <path d="M108 318 L 566 318 L 606 302 L 584 386 L 134 386 C 120 386, 110 374, 108 358 Z" fill={C.hull} stroke={C.ink} strokeWidth={2.4} />
              <path d="M108 318 L 566 318 L 606 302 L 584 386 L 134 386 C 120 386, 110 374, 108 358 Z" fill={`url(#${ID}-hatch)`} />
              <path d="M109 362 L 590 362 L 584 386 L 134 386 C 120 386, 111 376, 109 362 Z" fill={C.vermWash} stroke={C.ink} strokeWidth={1.6} />
              <line x1={110} y1={330} x2={574} y2={330} stroke={C.paper} strokeWidth={2} />
              {/* hold hatch lid slides open for the replacement */}
              <rect x={506 + hatch * 36} y={312} width={52} height={7} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.4} />
            </g>
            <text x={492} y={350} fontFamily={serif} fontSize={10} letterSpacing={1.6} fill={C.paper}>
              ΚΥΒΕΡΝΗΤΗΣ
            </text>

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
              opacity={missing ? 0.5 + 0.5 * Math.abs(osc(f, 30)) : 0}
            />
            {/* the original container, until the wave takes it */}
            {f < 96 && <Box id={ID} x={SLOT.x} y={SLOT.y} w={64} fill={C.ultraSoft} />}

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
            <line x1={t.x} y1={t.y} x2={carrying ? newX : t.x} y2={hookY} stroke={C.ink} strokeWidth={1.4} />
            <path d={`M${(carrying ? newX : t.x) - 6} ${hookY} q 6 8 12 0`} fill="none" stroke={C.ink} strokeWidth={2} />
            {/* the replacement: on the hook, then set down in the slot */}
            {f >= 160 && <Box id={ID} x={newX - 32} y={newY - 15 + settle} w={64} fill={C.ultraSoft} />}
          </Interactive.G>

          {/* the lost container, tumbling into the sea */}
          {f >= 96 && f < 130 && (
            <g transform={`translate(${lost.x + 32} ${lost.y + 15}) rotate(${lost.r}) translate(-32 -15)`}>
              <Box id={ID} x={0} y={0} w={64} fill={C.ultraSoft} />
            </g>
          )}

          <Sequence from={78} durationInFrames={44} layout="none" name="Rogue wave">
            <RogueWave />
          </Sequence>

          {/* front seas */}
          <path d={seaPath(640, 374, 9, 130, 520)} fill={C.ultraWash} opacity={0.85} style={{ translate: `${-(f / 360) * 130 * 3}px 0px` }} />
          <path d={seaPath(640, 374, 9, 130, 520)} fill={`url(#${ID}-hatch-light)`} style={{ translate: `${-(f / 360) * 130 * 3}px 0px` }} />
          <Sequence from={120} durationInFrames={26} layout="none" name="Splash">
            <Splash />
          </Sequence>
          <path d={seaPath(640, 404, 11, 170, 520)} fill={C.night} opacity={0.92} style={{ translate: `${-(f / 360) * 170 * 4}px 0px` }} />
          <SeaDetail f={f} />
        </g>

        </g>

        {/* status: the cluster's view of the cargo */}
        <Chip x={20} y={20} tone={missing ? 'bad' : 'ok'} text={missing ? 'pods 6/7 · reconciling' : 'pods 7/7 · desired state'} />
        <Interactive.Text name="Caption" x={22} y={496} fontFamily={serifItalic} fontSize={17} fill={C.paper}>
          The helm keeps the desired state.
        </Interactive.Text>
      </svg>
    </AbsoluteFill>
  )
}
