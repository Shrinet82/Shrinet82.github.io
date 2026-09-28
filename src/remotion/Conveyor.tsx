import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { pipeline } from '../content'

// Plate II. One Docker image rides the belt through the gates, gets flagged
// by Trivy and patched, then a crane lifts it onto the ship (delivery) and
// the flag goes up (verification). On the site this composition is not
// played: the scroll position is mapped onto the frame.

export const WORLD = 1600
export const CONVEYOR = { height: 440, fps: 30, durationInFrames: 360 }

const INK = '#1c1a17'
const PAPER = '#fbf8f2'
const ULTRA = '#26448f'
const SAP = '#3b6636'
const RED = '#b3321c'
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ease = Easing.bezier(0.65, 0, 0.35, 1)
const mono = 'IBM Plex Mono, monospace'
const serif = 'Fraunces, Georgia, serif'

// When the container reaches, and leaves, each stage.
const STAGES = [
  { at: 60, done: 95, x: 250 },
  { at: 125, done: 155, x: 520 },
  { at: 190, done: 250, x: 800 },
  { at: 280, done: 338, x: 1180 },
  { at: 338, done: 358, x: 1420 },
]

function Tag({ x, y, show, ok = true, children }: { x: number; y: number; show: number; ok?: boolean; children: string }) {
  return (
    <g opacity={show} style={{ translate: `0px ${(1 - show) * 8}px` }}>
      <rect x={x} y={y} width={children.length * 8.6 + 20} height={26} rx={13} fill={PAPER} stroke={ok ? SAP : RED} strokeWidth={1.4} />
      <text x={x + 10} y={y + 18} fontFamily={mono} fontSize={14} fill={ok ? SAP : RED}>
        {children}
      </text>
    </g>
  )
}

function Gantry({ x, half, active }: { x: number; half: number; active: number }) {
  const stroke = active > 0 ? ULTRA : INK
  return (
    <g filter="url(#belt-rough)">
      <line x1={x - half} y1={318} x2={x - half} y2={150} stroke={stroke} strokeWidth={3} />
      <line x1={x + half} y1={318} x2={x + half} y2={150} stroke={stroke} strokeWidth={3} />
      <rect x={x - half - 8} y={140} width={half * 2 + 16} height={14} fill={PAPER} stroke={stroke} strokeWidth={2.4} />
      <rect x={x - 26} y={154} width={52} height={16} fill="#c9d3ec" stroke={INK} strokeWidth={1.6} />
    </g>
  )
}

export const Conveyor: React.FC<{ viewWidth: number }> = ({ viewWidth }) => {
  const f = useCurrentFrame()

  // The container's path: drop in, stop at each gate, ride to the crane,
  // get lifted, swung over the water and lowered onto the deck.
  const cx = interpolate(f, [0, 20, 60, 95, 125, 155, 190, 250, 280, 305, 322], [110, 110, 250, 250, 520, 520, 800, 800, 1080, 1080, 1340], {
    ...clamp,
    easing: ease,
  })
  const cy = interpolate(f, [0, 20, 292, 305, 322, 338], [140, 290, 290, 130, 130, 300], {
    ...clamp,
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  })
  const flagged = f >= 200 && f < 228
  const patched = f >= 228
  const flip = interpolate(f, [220, 228, 236], [1, 0, 1], clamp)
  const attached = f >= 288 && f <= 338
  const hookY = attached ? cy - 34 : f < 288 ? interpolate(f, [270, 288], [104, 256], clamp) : interpolate(f, [338, 352], [266, 104], clamp)
  const trolley = interpolate(f, [305, 322], [1080, 1340], { ...clamp, easing: ease })
  const flagY = interpolate(f, [340, 356], [318, 214], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) })

  const activeOf = (i: number) => (f >= STAGES[i].at && f < STAGES[i].done ? 1 : 0)
  const doneOf = (i: number) => (f >= STAGES[i].done ? 1 : 0)
  const show = (a: number, b = a + 8) => interpolate(f, [a, b], [0, 1], clamp)

  // On narrow screens the camera follows the container instead of shrinking the world.
  const camera = viewWidth >= WORLD ? 0 : -Math.min(Math.max(cx - viewWidth / 2, 0), WORLD - viewWidth)

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${viewWidth} 440`} width="100%" height="100%" style={{ overflow: 'hidden' }}>
        <defs>
          <filter id="belt-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" />
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
          <filter id="belt-wash" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="40" result="d" />
            <feGaussianBlur in="d" stdDeviation="6" />
          </filter>
        </defs>
        <g style={{ translate: `${camera}px 0px` }}>
          {/* harbour water */}
          <g filter="url(#belt-wash)">
            <ellipse cx={1430} cy={380} rx={210} ry={60} fill="#7b95cf" opacity={0.55} />
          </g>
          <path
            d={`M1250 356 ${Array.from({ length: 12 }, (_, i) => `q 15 ${i % 2 ? 6 : -6} 30 0`).join(' ')} L 1610 440 L 1250 440 Z`}
            fill="#b9c6e4"
            opacity={0.8}
            style={{ translate: `${Math.sin(f / 8) * 6}px 0px` }}
          />

          {/* belt */}
          <g filter="url(#belt-rough)">
            <rect x={40} y={318} width={1080} height={18} rx={9} fill={PAPER} stroke={INK} strokeWidth={2.2} />
            {Array.from({ length: 18 }, (_, i) => 70 + i * 60).map((x) => (
              <g key={x} style={{ rotate: `${f * 9}deg`, transformBox: 'fill-box', transformOrigin: 'center' }}>
                <circle cx={x} cy={327} r={6} fill={PAPER} stroke={INK} strokeWidth={1.6} />
                <line x1={x - 5} y1={327} x2={x + 5} y2={327} stroke={INK} strokeWidth={1.2} />
              </g>
            ))}
            {[60, 400, 700, 1100].map((x) => (
              <line key={x} x1={x} y1={336} x2={x} y2={366} stroke={INK} strokeWidth={2} />
            ))}
            <line x1={20} y1={366} x2={1250} y2={366} stroke={INK} strokeWidth={2} />
          </g>

          {/* 01 Security gates */}
          <Gantry x={250} half={70} active={activeOf(0)} />
          <path d="M226 170 L 274 170 L 290 318 L 210 318 Z" fill="#7b95cf" opacity={activeOf(0) * (0.25 + 0.15 * Math.sin(f / 2))} />
          <Tag x={176} y={104} show={show(74)}>
            gitleaks ✓
          </Tag>
          <Tag x={262} y={78} show={show(86)}>
            checkov ✓
          </Tag>

          {/* 02 App quality */}
          <Gantry x={520} half={70} active={activeOf(1)} />
          <path d="M496 170 L 544 170 L 560 318 L 480 318 Z" fill="#7b95cf" opacity={activeOf(1) * (0.25 + 0.15 * Math.sin(f / 2))} />
          <Tag x={440} y={104} show={show(136)}>
            backend ✓
          </Tag>
          <Tag x={530} y={78} show={show(146)}>
            frontend ✓
          </Tag>

          {/* 03 Build factory: Trivy finds two criticals, the image is rebuilt */}
          <Gantry x={800} half={92} active={activeOf(2)} />
          <path
            d="M776 170 L 824 170 L 844 318 L 756 318 Z"
            fill={flagged ? '#d9492f' : '#7b95cf'}
            opacity={activeOf(2) * (flagged ? 0.35 : 0.25 + 0.15 * Math.sin(f / 2))}
          />
          <Tag x={690} y={104} show={show(196)}>
            docker build ✓
          </Tag>
          <g opacity={f < 228 ? 1 : 0}>
            <Tag x={808} y={78} show={show(204)} ok={false}>
              trivy: 2 critical
            </Tag>
          </g>
          <g opacity={f >= 228 ? 1 : 0}>
            <Tag x={808} y={78} show={show(230)}>
              trivy ✓ · sbom ✓
            </Tag>
          </g>

          {/* crane */}
          <g filter="url(#belt-rough)">
            <line x1={1210} y1={366} x2={1210} y2={62} stroke={INK} strokeWidth={4} />
            <line x1={1196} y1={366} x2={1210} y2={80} stroke={INK} strokeWidth={1.4} />
            <line x1={1224} y1={366} x2={1210} y2={80} stroke={INK} strokeWidth={1.4} />
            <line x1={1030} y1={70} x2={1420} y2={70} stroke={activeOf(3) ? ULTRA : INK} strokeWidth={4} />
            <line x1={1210} y1={40} x2={1030} y2={70} stroke={INK} strokeWidth={1.4} />
            <line x1={1210} y1={40} x2={1420} y2={70} stroke={INK} strokeWidth={1.4} />
            <rect x={1196} y={80} width={28} height={22} fill="#eed3a0" stroke={INK} strokeWidth={1.6} />
          </g>
          <rect x={(attached ? cx : trolley) - 12} y={64} width={24} height={12} fill={PAPER} stroke={INK} strokeWidth={1.6} />
          <line x1={attached ? cx : trolley} y1={76} x2={attached ? cx : trolley} y2={hookY} stroke={INK} strokeWidth={1.6} />
          <path d={`M${(attached ? cx : trolley) - 8} ${hookY} q 8 10 16 0`} fill="none" stroke={INK} strokeWidth={2} />

          {/* the ship it deploys to */}
          <Interactive.G name="Ship" style={{ translate: `0px ${Math.sin(f / 10) * 2}px` }}>
            <g filter="url(#belt-rough)">
              <path d="M1250 330 L 1470 330 L 1444 372 L 1270 372 Z" fill={PAPER} stroke={INK} strokeWidth={2.4} />
              <line x1={1258} y1={344} x2={1462} y2={344} stroke="#d39b34" strokeWidth={4} />
              <rect x={1270} y={300} width={34} height={30} fill="#c9d3ec" stroke={INK} strokeWidth={1.8} />
              <line x1={1440} y1={330} x2={1440} y2={196} stroke={INK} strokeWidth={2.4} />
            </g>
            <g style={{ translate: `0px ${flagY - 318}px` }}>
              <path d="M1440 318 L 1480 330 L 1440 342 Z" fill="#a9c49b" stroke={INK} strokeWidth={1.6} />
              <path d="M1448 330 l 5 5 l 10 -11" fill="none" stroke={SAP} strokeWidth={2.4} opacity={f > 350 ? 1 : 0} />
            </g>
            {/* the smoke test, literally */}
            {[0, 1, 2].map((i) => {
              const t = interpolate(f, [340 + i * 5, 358], [0, 1], clamp)
              return <circle key={i} cx={1287 + i * 6} cy={296 - t * 60} r={5 + t * 8} fill="#d8cfbf" opacity={t > 0 ? 0.9 - t * 0.6 : 0} />
            })}
          </Interactive.G>

          {/* the container: one image, labelled like the real one */}
          <Interactive.G name="Container" style={{ translate: `${cx}px ${cy}px` }}>
            <g style={{ scale: `${flip} 1` }}>
              <rect
                x={-48}
                y={-28}
                width={96}
                height={56}
                fill={flagged ? '#e98a74' : patched ? '#cfe0c4' : '#eed3a0'}
                stroke={INK}
                strokeWidth={2.2}
                filter="url(#belt-rough)"
              />
              {[-30, -14, 2, 18, 34].map((x) => (
                <line key={x} x1={x} y1={-22} x2={x} y2={22} stroke={INK} strokeWidth={0.9} />
              ))}
              <rect x={-36} y={-9} width={72} height={18} fill={PAPER} stroke={INK} strokeWidth={1.2} />
              <text x={0} y={5} textAnchor="middle" fontFamily={mono} fontSize={13} fill={INK}>
                app:1.4
              </text>
            </g>
            {/* a check for every gate it clears */}
            {[0, 1, 2].map((i) => (
              <g key={i} opacity={doneOf(i)} style={{ scale: `${doneOf(i) ? 1 : 0.4}` }}>
                <circle cx={-30 + i * 22} cy={-40} r={9} fill={PAPER} stroke={SAP} strokeWidth={1.6} />
                <path d={`M${-34 + i * 22} -40 l 3 3 l 6 -7`} fill="none" stroke={SAP} strokeWidth={2} />
              </g>
            ))}
            {patched && (
              <g opacity={show(236)}>
                <rect x={22} y={10} width={36} height={16} rx={3} fill={PAPER} stroke={ULTRA} strokeWidth={1.2} />
                <text x={40} y={22} textAnchor="middle" fontFamily={mono} fontSize={9} fill={ULTRA}>
                  SBOM
                </text>
              </g>
            )}
          </Interactive.G>

          {/* the five plates */}
          {pipeline.stages.map((s, i) => {
            const active = activeOf(i)
            const done = doneOf(i)
            const x = STAGES[i].x - 90
            return (
              <g key={s.name} opacity={active || done ? 1 : 0.4}>
                <text x={x} y={396} fontFamily={mono} fontSize={14} fill={active ? ULTRA : done ? SAP : INK}>
                  {`0${i + 1}${done ? ' ✓' : ''}`}
                </text>
                <text x={x + 38} y={396} fontFamily={serif} fontSize={24} fill={INK}>
                  {s.name}
                </text>
                <text x={x + 38} y={417} fontFamily={mono} fontSize={13} fill="#5b574f">
                  {s.tools}
                </text>
                <text x={x + 38} y={436} fontFamily={mono} fontSize={15} fill={ULTRA}>
                  {s.time}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </AbsoluteFill>
  )
}
