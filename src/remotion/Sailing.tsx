import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from 'remotion'

// Hero loop. Kubernetes means "helmsman": the boat steers itself through the
// night while the Docker whale carries the containers. A storm cracks one
// container, the helm spins, the same image is rescheduled, the sky clears.
// 8s at 30fps; frame 0 and frame 240 are identical so it loops seamlessly.

export const SAILING = { width: 520, height: 440, fps: 30, durationInFrames: 240 }

const INK = '#1c1a17'
const PAPER = '#fbf8f2'
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const wave = (f: number, period: number, phase = 0) => Math.sin(((f / period) * 2 + phase) * Math.PI)

// A periodic wave long enough that shifting by whole wavelengths never shows its end.
function seaPath(y: number, amp: number, len: number) {
  let d = `M ${-len} ${y}`
  const end = 520 + len * 4
  for (let x = -len; x < end; x += len) {
    d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`
  }
  return `${d} L ${end} 440 L ${-len} 440 Z`
}

const stars = [
  [60, 50],
  [118, 96],
  [180, 40],
  [250, 84],
  [320, 36],
  [470, 130],
  [36, 150],
]

function Wheel({ r, spokes = 7 }: { r: number; spokes?: number }) {
  return (
    <>
      <circle r={r} fill="none" stroke={INK} strokeWidth={2.4} />
      <circle r={r * 0.3} fill={PAPER} stroke={INK} strokeWidth={2} />
      {Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2
        return (
          <line
            key={i}
            x1={Math.cos(a) * r * 0.3}
            y1={Math.sin(a) * r * 0.3}
            x2={Math.cos(a) * r * 1.3}
            y2={Math.sin(a) * r * 1.3}
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        )
      })}
    </>
  )
}

function Container({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={24} height={15} fill={fill} stroke={INK} strokeWidth={1.6} />
      {[6, 12, 18].map((rx) => (
        <line key={rx} x1={rx} y1={3} x2={rx} y2={12} stroke={INK} strokeWidth={0.8} />
      ))}
    </g>
  )
}

export const Sailing: React.FC = () => {
  const f = useCurrentFrame()

  // Storm timeline
  const cloudX = interpolate(f, [55, 90, 170, 215], [620, 300, 300, -260], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  const flash = interpolate(f, [96, 99, 104, 108], [0, 1, 0.2, 0], clamp)
  const storm = interpolate(f, [60, 95, 170, 210], [0, 1, 1, 0], clamp)
  const heal = interpolate(f, [112, 160], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) })
  const crashed = f >= 100 && f < 150

  // Boat and whale bob on the same 4s swell, half a wave apart.
  const boatY = wave(f, 120) * 5
  const boatTilt = wave(f, 120, 0.4) * 3 + storm * wave(f, 30) * 3
  const whaleY = wave(f, 120, 1) * 6
  const tail = wave(f, 40) * 10

  return (
    <AbsoluteFill>
      <svg viewBox="0 0 520 440" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="sail-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
          <filter id="sail-wash" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="44" result="d" />
            <feGaussianBlur in="d" stdDeviation="7" />
          </filter>
        </defs>

        {/* night sky wash, darker while the storm passes */}
        <g filter="url(#sail-wash)">
          <ellipse cx={260} cy={120} rx={250} ry={120} fill="#3d5ba8" opacity={0.55 + storm * 0.25} />
          <ellipse cx={420} cy={80} rx={90} ry={70} fill="#d39b34" opacity={0.35 * (1 - storm)} />
        </g>
        <circle cx={428} cy={78} r={24} fill="#f6e2a8" stroke={INK} strokeWidth={2} opacity={1 - storm * 0.7} />
        {stars.map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6} Z`}
            fill="#f6e2a8"
            opacity={(0.45 + 0.55 * Math.abs(wave(f, 60, i * 0.37))) * (1 - storm)}
          />
        ))}

        {/* storm cloud with lightning */}
        <Interactive.G name="Storm" style={{ translate: `${cloudX}px 0px` }}>
          <path
            d="M-10 96 C -40 96, -44 64, -16 58 C -12 30, 30 22, 44 44 C 64 24, 104 36, 98 64 C 124 68, 122 98, 96 98 Z"
            fill="#8c93a3"
            stroke={INK}
            strokeWidth={2}
            filter="url(#sail-rough)"
          />
          <path d="M40 98 L 26 136 L 44 134 L 30 176" fill="none" stroke="#d9492f" strokeWidth={4} strokeLinejoin="round" opacity={flash} />
        </Interactive.G>
        <rect x={0} y={0} width={520} height={440} fill="#fff" opacity={flash * 0.25} />

        {/* back sea */}
        <path d={seaPath(292, 10, 130)} fill="#b9c6e4" style={{ translate: `${-(f / 240) * 130 * 2}px 0px` }} />

        {/* the boat */}
        <Interactive.G name="Boat" style={{ translate: `180px ${300 + boatY}px`, rotate: `${boatTilt}deg` }}>
          <g filter="url(#sail-rough)">
            <line x1={0} y1={-6} x2={0} y2={-178} stroke={INK} strokeWidth={3} strokeLinecap="round" />
            <path d="M6 -172 C 66 -128, 82 -64, 76 -20 L 6 -20 Z" fill={PAPER} stroke={INK} strokeWidth={2} />
            <path d="M-6 -164 L -6 -22 L -78 -22 C -66 -74, -36 -134, -6 -164 Z" fill="#eed3a0" stroke={INK} strokeWidth={2} />
            <path
              d="M0 -178 L 26 -171 L 0 -164 Z"
              fill="#d9492f"
              stroke={INK}
              strokeWidth={1.4}
              style={{ scale: `${1 + wave(f, 20) * 0.12} 1`, transformBox: 'fill-box', transformOrigin: '0% 50%' }}
            />
            <path d="M-96 -12 L 96 -12 L 68 22 L -74 22 Z" fill={PAPER} stroke={INK} strokeWidth={2.2} />
            <line x1={-86} y1={0} x2={84} y2={0} stroke="#d39b34" strokeWidth={4} />
          </g>
          {/* the Kubernetes wheel on the sail */}
          <g transform="translate(40 -76)" opacity={0.9}>
            <Wheel r={11} />
          </g>
          {/* the helm: sways, and spins hard while it heals the cluster */}
          <g transform="translate(-60 -26)">
            <g
              style={{
                rotate: `${wave(f, 120, 0.2) * 14 + heal * 720}deg`,
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
            >
              <Wheel r={10} />
            </g>
          </g>
        </Interactive.G>

        {/* the Docker whale, carrying containers */}
        <Interactive.G name="Whale" style={{ translate: `${392 + wave(f, 240) * 6}px ${338 + whaleY}px` }}>
          <g filter="url(#sail-rough)">
            <path
              d="M58 -16 L 82 -34 C 88 -24, 88 -12, 78 -6 Z"
              fill="#7b95cf"
              stroke={INK}
              strokeWidth={2}
              style={{ rotate: `${tail}deg`, transformBox: 'fill-box', transformOrigin: '0% 100%' }}
            />
            <path
              d="M-72 -6 C -72 -44, 36 -48, 60 -18 C 66 -10, 60 14, 0 14 C -40 14, -72 8, -72 -6 Z"
              fill="#7b95cf"
              stroke={INK}
              strokeWidth={2.2}
            />
            <path d="M-60 2 C -48 8, -30 8, -18 4" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
          </g>
          <circle cx={-50} cy={-12} r={3} fill={INK} />
          <Container x={-44} y={-58} fill="#eed3a0" />
          <Container x={-18} y={-58} fill="#a9c49b" />
          {/* the container the storm cracks, then Kubernetes reschedules */}
          <g
            style={{
              translate: crashed
                ? `${interpolate(f, [100, 125], [0, 16], clamp)}px ${interpolate(f, [100, 125], [0, 70], { ...clamp, easing: Easing.in(Easing.quad) })}px`
                : '0px 0px',
              rotate: crashed ? `${interpolate(f, [100, 125], [0, 40], clamp)}deg` : '0deg',
              opacity: f < 100 ? 1 : crashed ? interpolate(f, [100, 125], [1, 0], clamp) : interpolate(f, [150, 162], [0, 1], clamp),
              scale: !crashed && f >= 150 ? `${interpolate(f, [150, 168], [0.2, 1], { ...clamp, easing: Easing.spring({ damping: 12 }) })}` : '1',
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          >
            <Container x={8} y={-58} fill={crashed ? '#e98a74' : '#eed3a0'} />
          </g>
          <Container x={-31} y={-73} fill="#c9d3ec" />
          <Container x={-5} y={-73} fill="#fbf8f2" />
          {/* spout, every 4s */}
          {[0, 1, 2].map((i) => {
            const t = interpolate(f % 120, [10, 40], [0, 1], clamp)
            return (
              <circle
                key={i}
                cx={-58 + (i - 1) * 8 * t}
                cy={-40 - t * 34 + i * 4}
                r={3}
                fill="#c9d3ec"
                stroke={INK}
                strokeWidth={1}
                opacity={t > 0 && t < 1 ? 1 - t * 0.6 : 0}
              />
            )
          })}
        </Interactive.G>

        {/* front sea */}
        <path d={seaPath(352, 12, 170)} fill="#7b95cf" opacity={0.75} style={{ translate: `${-(f / 240) * 170}px 0px` }} />
        <path d={seaPath(392, 8, 110)} fill="#3d5ba8" opacity={0.85} style={{ translate: `${-(f / 240) * 110 * 3}px 0px` }} />

        {/* status chip, like a dashboard in the corner of the sky */}
        <g opacity={interpolate(f, [100, 108, 196, 206], [0, 1, 1, 0], clamp)}>
          <rect x={18} y={196} width={160} height={26} rx={13} fill={PAPER} stroke={INK} strokeWidth={1.4} />
          <circle cx={34} cy={209} r={5} fill={f < 150 ? '#d9492f' : '#6f9a5f'} />
          <text x={46} y={214} fontFamily="IBM Plex Mono, monospace" fontSize={12} fill={INK}>
            {f < 150 ? 'container crashed' : 'rescheduled, healthy'}
          </text>
        </g>
        <Interactive.Text name="Caption" x={18} y={430} fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize={16} fill="#f3eee4">
          03:12. The ship steers itself.
        </Interactive.Text>
      </svg>
    </AbsoluteFill>
  )
}
