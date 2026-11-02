import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { C, Defs, WashLayer, clamp, ease, lerp, mono, osc, prog, seaPath, serif, serifItalic } from './kit'

// Plate III (Project Aegis), true to the README. A platform glitch keeps
// stacking buckets and servers on the quay at night, one of them with SSH
// open to the world. Every create is a CloudTrail event; EventBridge carries
// it to the Aegis lighthouse, whose Lambda runs the Cloud Custodian policies.
// Mark and sweep: the beam tags each resource that breaks a rule, a grace
// period runs, then the sweep removes them and revokes the open rule. The
// Powerpipe board counts pending and recent kills. Along the bottom, the
// on-call path's seven manual steps (4-24h) against Aegis (under 2 minutes).
//
// 60 fps, timed in beats of 1/30 s (two frames each), 360 beats in all.

export const LIGHTHOUSE = { width: 1000, height: 600, fps: 60, durationInFrames: 720 }
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
      <text x={0} y={-12} textAnchor="middle" fontFamily={mono} fontSize={11.5} fill={C.paper}>
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
      <text x={0} y={-43} textAnchor="middle" fontFamily={mono} fontSize={11} fill={C.graphite}>
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

const NIGHT = [{ cx: 480, cy: 220, rx: 520, ry: 210, fill: C.night, opacity: 0.72 }]

export const Lighthouse: React.FC<{ narrow?: boolean; viewWidth?: number }> = ({ narrow = false, viewWidth = LIGHTHOUSE_NARROW.width }) => {
  const f = useCurrentFrame() / 2 // in beats
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
  const focus = interpolate(f, [0, 110, 166, 180, 222, 262, 300], [220, 330, 820, 640, 250, 300, 420], { ...clamp, easing: ease.inOut })
  const camX = narrow ? Math.min(0, Math.max(viewWidth - 1000, viewWidth / 2 - focus)) : 0
  const chipW = narrow ? 84 : 88
  const perRow = narrow ? 4 : 7
  const viewBox = narrow ? `0 0 ${viewWidth} ${LIGHTHOUSE_NARROW.height}` : '0 0 1000 600'

  return (
    <AbsoluteFill>
      {/* night over the quay */}
      <WashLayer blobs={NIGHT} world={{ w: 1000, h: narrow ? LIGHTHOUSE_NARROW.height : 600 }} viewWidth={narrow ? viewWidth : 1000} camera={camX} />
      <svg viewBox={viewBox} width="100%" height="100%" style={{ position: 'absolute' }}>
        <Defs id={ID} f={f} />
        <g transform={`translate(${camX} 0)`}>
        {[
          [120, 70],
          [330, 44],
          [560, 90],
          [700, 52],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} fill={C.moon} opacity={0.5 + 0.5 * Math.abs(osc(f, 50, i * 0.3))} />
        ))}

        {/* the beam, drawn under the quay objects so they catch its light;
            bright at the lamp and fading with distance */}
        <linearGradient id={`${ID}-beam`} gradientUnits="userSpaceOnUse" x1={LAMP.x} y1={LAMP.y} x2={LAMP.x + Math.cos(beamRad) * 820} y2={LAMP.y + Math.sin(beamRad) * 820}>
          <stop offset="0" stopColor={C.moon} stopOpacity={0.85} />
          <stop offset="0.55" stopColor={C.moon} stopOpacity={0.4} />
          <stop offset="1" stopColor={C.moon} stopOpacity={0.06} />
        </linearGradient>
        <clipPath id={`${ID}-sky`}>
          <rect x={-20} y={0} width={1040} height={QUAY + 22} />
        </clipPath>
        <path
          clipPath={`url(#${ID}-sky)`}
          d={`M ${LAMP.x} ${LAMP.y} L ${LAMP.x + Math.cos(beamRad - 0.08) * 1000} ${LAMP.y + Math.sin(beamRad - 0.08) * 1000} L ${LAMP.x + Math.cos(beamRad + 0.08) * 1000} ${LAMP.y + Math.sin(beamRad + 0.08) * 1000} Z`}
          fill={`url(#${ID}-beam)`}
          opacity={lampOn * 0.7}
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
        <text x={888} y={468} textAnchor="middle" fontFamily={serifItalic} fontSize={20} fill={C.ink}>
          Aegis
        </text>
        <text x={888} y={486} textAnchor="middle" fontFamily={mono} fontSize={13} fill={C.graphite}>
          cloud custodian
        </text>
        <text x={888} y={503} textAnchor="middle" fontFamily={mono} fontSize={11.5} fill={C.faint}>
          cloudtrail → eventbridge → λ
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
        <text x={40} y={96} fontFamily={mono} fontSize={13} fill={glitching ? C.vermSoft : C.sapSoft}>
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
                {/* mark: a luggage tag, and an hourglass for the grace period; the open
                    server's tag says what was done */}
                {marked &&
                  (t.open ? (
                    <g transform="translate(-6 -62)" opacity={prog(f, markAt(t), markAt(t) + 6)}>
                      <path d="M0 0 L 88 0 L 95 9 L 88 18 L 0 18 Z" fill={C.sapSoft} stroke={C.sap} strokeWidth={1.2} />
                      <text x={6} y={13} fontFamily={mono} fontSize={12} fill={C.sap}>
                        ssh revoked
                      </text>
                    </g>
                  ) : (
                    <g transform={`translate(${t.kind === 'bucket' ? 10 : 16} -46) rotate(14)`} opacity={prog(f, markAt(t), markAt(t) + 6)}>
                      <path d="M0 0 L 14 0 L 18 6 L 14 12 L 0 12 Z" fill={C.vermSoft} stroke={C.vermilion} strokeWidth={1.1} />
                      <circle cx={13} cy={6} r={1.6} fill={C.paper} stroke={C.vermilion} strokeWidth={0.8} />
                      <line x1={4} y1={4} x2={9} y2={4} stroke={C.vermilion} strokeWidth={1} />
                      <line x1={4} y1={8} x2={8} y2={8} stroke={C.vermilion} strokeWidth={1} />
                      {(() => {
                        const g = prog(f, markAt(t), sweepAt(i))
                        return (
                          <g transform="translate(22 -1) scale(0.8)">
                            <path d="M0 0 L 10 0 L 5 8 L 10 16 L 0 16 L 5 8 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.2} />
                            <path d={`M ${1 + g * 4} ${g * 7.5} L ${9 - g * 4} ${g * 7.5} L 5 8 Z`} fill={C.ochreWash} />
                            <path d={`M ${5 - g * 4} ${16 - g * 3} L ${5 + g * 4} ${16 - g * 3} L 10 16 L 0 16 Z`} fill={C.ochreWash} opacity={g > 0.02 ? 1 : 0} />
                          </g>
                        )
                      })()}
                    </g>
                  ))}
              </g>
              {/* falling line from the crane hook */}
              {land < 1 && <line x1={t.x} y1={118} x2={t.x} y2={y - 34} stroke={C.ink} strokeWidth={1} opacity={0.6} />}
            </Interactive.G>
          )
        })}
        {/* one legend for all the marks, while the grace period runs */}
        <g opacity={prog(f, 176, 186) * (1 - prog(f, 262, 272))} transform="translate(196 222)">
          <path d="M0 0 L 14 0 L 18 6 L 14 12 L 0 12 Z" fill={C.vermSoft} stroke={C.vermilion} strokeWidth={1.1} />
          <text x={26} y={11} fontFamily={mono} fontSize={13} fill={C.vermSoft}>
            marked: no owner tag · swept after a grace period
          </text>
        </g>
        {/* every create is a CloudTrail event; EventBridge carries it to the lighthouse */}
        {things.map((t, i) => {
          const e = prog(f, dropAt(i) + 10, dropAt(i) + 30, ease.inOut)
          if (e <= 0 || e >= 1) return null
          const ex = lerp(t.x, 872, e)
          const ey = lerp(t.y - 20, 300, e) - Math.sin(e * Math.PI) * 70
          return <circle key={`ev${i}`} cx={ex} cy={ey} r={3.4} fill={C.ochreWash} stroke={C.ink} strokeWidth={0.8} opacity={Math.sin(e * Math.PI) * 0.4 + 0.6} />
        })}
        {/* the Powerpipe board on the rock: pending and recent kills */}
        {(() => {
          let pending = 0
          let kills = 0
          things.forEach((t, i) => {
            const marked = f >= markAt(t)
            const swept = t.open ? f >= markAt(t) + 10 : f >= sweepAt(i) + 13
            if (swept) kills++
            else if (marked) pending++
          })
          return (
            <g transform="translate(918 252)">
              <rect x={0} y={0} width={78} height={92} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={1.6} />
              <text x={39} y={16} textAnchor="middle" fontFamily={mono} fontSize={11} fill={C.graphite}>
                powerpipe
              </text>
              <line x1={6} y1={22} x2={72} y2={22} stroke={C.rule} strokeWidth={1} />
              <text x={39} y={46} textAnchor="middle" fontFamily={serif} fontSize={22} fill={pending ? C.vermilion : C.faint}>
                {pending}
              </text>
              <text x={39} y={57} textAnchor="middle" fontFamily={mono} fontSize={9.5} fill={C.graphite}>
                pending
              </text>
              <text x={39} y={78} textAnchor="middle" fontFamily={serif} fontSize={18} fill={kills ? C.sap : C.faint}>
                {kills}
              </text>
              <text x={39} y={88} textAnchor="middle" fontFamily={mono} fontSize={9.5} fill={C.graphite}>
                recent kills
              </text>
              <line x1={39} y1={92} x2={39} y2={118} stroke={C.ink} strokeWidth={2} />
            </g>
          )
        })()}
        {/* the open rule on the exposed server, until it is revoked */}
        <text x={452} y={QUAY - 70} fontFamily={mono} fontSize={13} fill={C.vermSoft} opacity={f >= dropAt(4) + 12 && f < markAt(things[4]) ? 1 : 0}>
          22 · 0.0.0.0/0
        </text>

        </g>

        {/* the two paths, to scale in steps rather than hours */}
        <g transform={`translate(20 ${narrow ? 492 : 490})`}>
          <text x={0} y={0} fontFamily={serif} fontSize={16} fill={C.ink}>
            On-call path
          </text>
          <text x={130} y={0} fontFamily={mono} fontSize={13} fill={C.vermilion}>
            4 to 24 hours
          </text>
          {onCallSteps.map((s, i) => {
            const lit = i < onCallLit
            return (
              <g key={s} transform={`translate(${(i % perRow) * (chipW + 8)} ${12 + Math.floor(i / perRow) * 30})`}>
                <rect x={0} y={0} width={chipW} height={24} rx={12} fill={lit ? C.vermSoft : C.paper} stroke={lit ? C.vermilion : C.rule} strokeWidth={1.2} />
                <text x={chipW / 2} y={16} textAnchor="middle" fontFamily={mono} fontSize={13} fill={lit ? C.vermilion : C.faint}>
                  {s}
                </text>
              </g>
            )
          })}
          <text x={Math.max(0, onCallLit - 1) * (chipW + 8) + 4} y={narrow ? 82 : 52} fontFamily={mono} fontSize={12.5} fill={C.vermilion} opacity={f > 262 ? 1 : 0}>
            ↑ still here when Aegis is done
          </text>
          <g transform={`translate(0 ${narrow ? 44 : 0})`}>
          <text x={0} y={70} fontFamily={serif} fontSize={16} fill={C.ink}>
            Aegis
          </text>
          <text x={130} y={70} fontFamily={mono} fontSize={13} fill={C.sap}>
            under 2 minutes, 0 manual steps
          </text>
          {['detect', 'mark', 'sweep'].map((s, i) => {
            const lit = aegis >= (i + 1) / 3 - 0.02
            return (
              <g key={s} transform={`translate(${i * (chipW + 8)} 82)`}>
                <rect x={0} y={0} width={chipW} height={24} rx={12} fill={lit ? C.sapSoft : C.paper} stroke={lit ? C.sap : C.rule} strokeWidth={1.2} />
                <text x={chipW / 2} y={16} textAnchor="middle" fontFamily={mono} fontSize={13} fill={lit ? C.sap : C.faint}>
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
