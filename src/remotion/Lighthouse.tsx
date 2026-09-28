import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { C, Defs, clamp, ease, lerp, mono, osc, prog, seaPath, serif, serifItalic } from './kit'

// Plate III (Project Aegis). Scroll-scrubbed. A platform glitch keeps
// stacking buckets and servers on the quay at night, one of them with SSH
// open to the world. The Aegis lighthouse runs its Cloud Custodian policies:
// the beam marks every resource that breaks a rule, then sweeps them away and
// revokes the open rule. Along the bottom, the on-call path's seven manual
// steps (4-24h) against Aegis (under 2 minutes).

export const LIGHTHOUSE = { width: 1000, height: 600, fps: 30, durationInFrames: 360 }
// Phones: a 600px camera follows the action and the two paths wrap onto more rows.
export const LIGHTHOUSE_NARROW = { width: 600, height: 700 }
const ID = 'lh'
const QUAY = 400
const LAMP = { x: 888, y: 168 }

// Resources the glitch drops, in order. `open` is the one with 0.0.0.0/0:22.
type Thing = { kind: 'bucket' | 'server'; x: number; y: number; open?: boolean }
const things: Thing[] = [
  { kind: 'bucket', x: 196, y: QUAY },
  { kind: 'server', x: 262, y: QUAY },
  { kind: 'bucket', x: 330, y: QUAY },
  { kind: 'bucket', x: 392, y: QUAY },
  { kind: 'server', x: 460, y: QUAY, open: true },
  { kind: 'bucket', x: 528, y: QUAY },
  { kind: 'bucket', x: 226, y: QUAY - 44 },
  { kind: 'server', x: 296, y: QUAY - 44 },
  { kind: 'bucket', x: 362, y: QUAY - 44 },
  { kind: 'bucket', x: 590, y: QUAY },
  { kind: 'server', x: 424, y: QUAY - 44 },
  { kind: 'bucket', x: 262, y: QUAY - 88 },
]
const dropAt = (i: number) => 14 + i * 11
// the beam sweeps right to left, so it reaches the rightmost things first
const markAt = (t: Thing) => interpolate(t.x, [180, 620], [220, 168], clamp)
const sweepAt = (i: number) => 236 + i * 3
const onCallSteps = ['alert', 'ack', 'log in', 'find', 'fix', 'verify', 'close']

function Bucket() {
  return (
    <g>
      <path d="M-18 -34 L 18 -34 L 14 0 L -14 0 Z" fill={C.ultraWash} stroke={C.ink} strokeWidth={1.8} />
      <path d="M-16 -32 C -16 -52, 16 -52, 16 -32" fill="none" stroke={C.ink} strokeWidth={1.6} />
      <text x={0} y={-12} textAnchor="middle" fontFamily={mono} fontSize={9.5} fill={C.paper}>
        s3
      </text>
    </g>
  )
}

function Server({ f, lock }: { f: number; lock: number }) {
  return (
    <g>
      <rect x={-24} y={-40} width={48} height={40} rx={3} fill={C.paper} stroke={C.ink} strokeWidth={1.8} />
      {[-30, -20, -10].map((y) => (
        <g key={y}>
          <line x1={-17} y1={y} x2={6} y2={y} stroke={C.ink} strokeWidth={1} />
          <circle cx={14} cy={y} r={2.2} fill={Math.floor(f / 5 + y) % 2 ? C.sapWash : C.rule} />
        </g>
      ))}
      <text x={0} y={-43} textAnchor="middle" fontFamily={mono} fontSize={9} fill={C.graphite}>
        ec2
      </text>
      {lock >= 0 && (
        <g transform="translate(30 -30)">
          <rect x={-8} y={-2} width={16} height={13} rx={2} fill={lock > 0.5 ? C.sapWash : C.vermWash} stroke={C.ink} strokeWidth={1.4} />
          <path d={`M -5 -2 L -5 -7 A 5 5 0 0 1 5 -7 L 5 ${lerp(-4, -2, lock)}`} fill="none" stroke={C.ink} strokeWidth={1.6} transform={`translate(0 ${lerp(-5, 0, lock)})`} />
        </g>
      )}
    </g>
  )
}

export const Lighthouse: React.FC<{ narrow?: boolean }> = ({ narrow = false }) => {
  const f = useCurrentFrame()
  const lampOn = prog(f, 150, 164, ease.out)
  // beam angle: points at the quay's right end, sweeps to its left end, returns to idle
  // SVG angles (y down): 144deg hits the quay's right end, 164deg its left end, 176deg the horizon
  const beamAngle = interpolate(f, [150, 166, 222, 262, 300], [176, 144, 164, 164, 176], { ...clamp, easing: ease.inOut })
  const glitching = f < 236
  const craneJerk = glitching ? osc(f, 11) * 4 + (Math.floor(f / 7) % 3 === 0 ? 3 : 0) : 0
  // A human is still at step two when Aegis has finished: 4-24h against under 2 minutes.
  const onCallLit = Math.floor(interpolate(f, [30, 330], [0, 2.99], clamp))
  const aegis = prog(f, 150, 262, ease.inOut)
  const beamRad = (beamAngle * Math.PI) / 180
  // narrow camera: the quay, the lighthouse lighting up, then along the beam
  const focus = interpolate(f, [0, 140, 166, 180, 222, 262, 300], [360, 360, 820, 640, 250, 300, 420], { ...clamp, easing: ease.inOut })
  const camX = narrow ? Math.min(0, Math.max(600 - 1000, 300 - focus)) : 0
  const chipW = narrow ? 84 : 88
  const perRow = narrow ? 4 : 7

  return (
    <AbsoluteFill>
      <svg viewBox={narrow ? '0 0 600 700' : '0 0 1000 600'} width="100%" height="100%">
        <Defs id={ID} f={f} />
        <g transform={`translate(${camX} 0)`}>

        {/* night over the quay */}
        <g filter={`url(#${ID}-wash)`}>
          <ellipse cx={480} cy={220} rx={520} ry={210} fill={C.night} opacity={0.72} />
        </g>
        {[
          [120, 70],
          [330, 44],
          [560, 90],
          [700, 52],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} fill={C.moon} opacity={0.5 + 0.5 * Math.abs(osc(f, 50, i * 0.3))} />
        ))}

        {/* the beam, drawn under the quay objects so they catch its light */}
        <path
          d={`M ${LAMP.x} ${LAMP.y} L ${LAMP.x + Math.cos(beamRad - 0.08) * 1000} ${LAMP.y + Math.sin(beamRad - 0.08) * 1000} L ${LAMP.x + Math.cos(beamRad + 0.08) * 1000} ${LAMP.y + Math.sin(beamRad + 0.08) * 1000} Z`}
          fill={C.moon}
          opacity={lampOn * 0.34}
        />

        {/* sea and the lighthouse rock */}
        <clipPath id={`${ID}-sea`}>
          <rect x={700} y={380} width={300} height={62} />
        </clipPath>
        <g clipPath={`url(#${ID}-sea)`}>
          <path d={seaPath(1000, 408, 6, 70, 600)} fill={C.ultraWash} stroke={C.ultra} strokeWidth={1.4} style={{ translate: `${-(f % 70)}px 0px` }} />
          <path d={seaPath(1000, 424, 5, 90, 600)} fill={C.night} opacity={0.8} style={{ translate: `${-(f % 90)}px 0px` }} />
        </g>
        <g filter={`url(#${ID}-rough)`}>
          <path d="M800 420 C 820 360, 860 340, 900 346 C 940 350, 970 380, 990 420 Z" fill={C.paper2} stroke={C.ink} strokeWidth={2} />
          <path d="M800 420 C 820 360, 860 340, 900 346 C 940 350, 970 380, 990 420 Z" fill={`url(#${ID}-hatch)`} />
          <path d="M866 350 L 874 186 L 902 186 L 910 350 Z" fill={C.paper} stroke={C.ink} strokeWidth={2.2} />
          {[214, 258, 302].map((y) => (
            <path key={y} d={`M ${868 + (350 - y) * 0.05} ${y} L ${908 - (350 - y) * 0.05} ${y} L ${908 - (350 - y - 20) * 0.05} ${y + 20} L ${868 + (350 - y - 20) * 0.05} ${y + 20} Z`} fill={C.vermWash} />
          ))}
          <rect x={870} y={154} width={36} height={32} fill={lampOn > 0 ? C.moon : C.rule} stroke={C.ink} strokeWidth={2} />
          <path d="M864 154 L 888 132 L 912 154 Z" fill={C.ink} />
          <rect x={860} y={186} width={56} height={8} fill={C.paper} stroke={C.ink} strokeWidth={1.6} />
        </g>
        <circle cx={LAMP.x} cy={LAMP.y} r={30 * lampOn} fill={C.moon} opacity={0.35 * lampOn} filter={`url(#${ID}-wash)`} />
        <text x={888} y={446} textAnchor="middle" fontFamily={serifItalic} fontSize={18} fill={C.ink}>
          Aegis
        </text>
        <text x={888} y={462} textAnchor="middle" fontFamily={mono} fontSize={10.5} fill={C.graphite}>
          cloud custodian
        </text>

        {/* the quay */}
        <g filter={`url(#${ID}-rough)`}>
          <rect x={20} y={QUAY} width={680} height={22} fill={C.paper2} stroke={C.ink} strokeWidth={2} />
          <rect x={20} y={QUAY} width={680} height={22} fill={`url(#${ID}-hatch-light)`} />
          {/* the glitching crane */}
          <path d="M70 400 L 84 120 L 100 120 L 114 400" fill="none" stroke={C.ink} strokeWidth={2.2} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={72 + i * 1.8} y1={400 - i * 40} x2={112 - i * 1.8} y2={360 - i * 40} stroke={C.ink} strokeWidth={0.9} />
          ))}
          <line x1={92} y1={126 + craneJerk} x2={640} y2={112 + craneJerk} stroke={C.ink} strokeWidth={4} />
          <rect x={80} y={132} width={30} height={22} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.8} />
        </g>
        <circle cx={96} cy={112} r={6} fill={glitching ? (Math.floor(f / 4) % 2 ? C.vermWash : C.vermilion) : C.sapWash} stroke={C.ink} strokeWidth={1.2} />
        <text x={40} y={96} fontFamily={mono} fontSize={11} fill={glitching ? C.vermSoft : C.sapSoft}>
          {glitching ? 'platform glitch: create, create, create' : 'glitch contained'}
        </text>

        {/* the resources it keeps dropping */}
        {things.map((t, i) => {
          const land = prog(f, dropAt(i), dropAt(i) + 12, ease.in)
          const marked = f >= markAt(t)
          const gone = t.open ? 0 : prog(f, sweepAt(i), sweepAt(i) + 26, ease.in)
          const lock = t.open ? prog(f, markAt(t), markAt(t) + 10, ease.out) : -1
          const y = lerp(130, t.y, land) - gone * 70
          if (land <= 0) return null
          return (
            <Interactive.G key={i} name={`${t.kind} ${i}`} style={{ opacity: 1 - gone }}>
              <g transform={`translate(${t.x} ${y}) scale(${1 - gone * 0.3})`}>
                {t.kind === 'bucket' ? <Bucket /> : <Server f={f} lock={t.open ? lock : -1} />}
                {/* mark: a paper tag with the rule it broke */}
                {marked && (
                  <g transform="translate(-6 -58)" opacity={prog(f, markAt(t), markAt(t) + 6)}>
                    <path d="M0 0 L 58 0 L 64 7 L 58 14 L 0 14 Z" fill={t.open ? C.sapSoft : C.vermSoft} stroke={t.open ? C.sap : C.vermilion} strokeWidth={1.2} />
                    <text x={5} y={10.5} fontFamily={mono} fontSize={8.5} fill={t.open ? C.sap : C.vermilion}>
                      {t.open ? 'ssh revoked' : 'no owner'}
                    </text>
                  </g>
                )}
              </g>
              {/* falling line from the crane hook */}
              {land < 1 && <line x1={t.x} y1={118} x2={t.x} y2={y - 34} stroke={C.ink} strokeWidth={1} opacity={0.6} />}
            </Interactive.G>
          )
        })}
        {/* the open rule on the exposed server, until it is revoked */}
        <text x={494} y={QUAY - 54} fontFamily={mono} fontSize={10} fill={C.vermSoft} opacity={f >= dropAt(4) + 12 && f < markAt(things[4]) ? 1 : 0}>
          22 · 0.0.0.0/0
        </text>

        </g>

        {/* the two paths, to scale in steps rather than hours */}
        <g transform={`translate(20 ${narrow ? 492 : 490})`}>
          <text x={0} y={0} fontFamily={serif} fontSize={16} fill={C.ink}>
            On-call path
          </text>
          <text x={130} y={0} fontFamily={mono} fontSize={11} fill={C.vermilion}>
            4 to 24 hours
          </text>
          {onCallSteps.map((s, i) => {
            const lit = i < onCallLit
            return (
              <g key={s} transform={`translate(${(i % perRow) * (chipW + 8)} ${12 + Math.floor(i / perRow) * 30})`}>
                <rect x={0} y={0} width={chipW} height={24} rx={12} fill={lit ? C.vermSoft : C.paper} stroke={lit ? C.vermilion : C.rule} strokeWidth={1.2} />
                <text x={chipW / 2} y={16} textAnchor="middle" fontFamily={mono} fontSize={11} fill={lit ? C.vermilion : C.faint}>
                  {s}
                </text>
              </g>
            )
          })}
          <text x={Math.max(0, onCallLit - 1) * (chipW + 8) + 4} y={narrow ? 82 : 52} fontFamily={mono} fontSize={10.5} fill={C.vermilion} opacity={f > 262 ? 1 : 0}>
            ↑ still here when Aegis is done
          </text>
          <g transform={`translate(0 ${narrow ? 44 : 0})`}>
          <text x={0} y={70} fontFamily={serif} fontSize={16} fill={C.ink}>
            Aegis
          </text>
          <text x={130} y={70} fontFamily={mono} fontSize={11} fill={C.sap}>
            under 2 minutes, 0 manual steps
          </text>
          {['detect', 'mark', 'sweep'].map((s, i) => {
            const lit = aegis >= (i + 1) / 3 - 0.02
            return (
              <g key={s} transform={`translate(${i * (chipW + 8)} 82)`}>
                <rect x={0} y={0} width={chipW} height={24} rx={12} fill={lit ? C.sapSoft : C.paper} stroke={lit ? C.sap : C.rule} strokeWidth={1.2} />
                <text x={chipW / 2} y={16} textAnchor="middle" fontFamily={mono} fontSize={11} fill={lit ? C.sap : C.faint}>
                  {s}
                </text>
              </g>
            )
          })}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  )
}
