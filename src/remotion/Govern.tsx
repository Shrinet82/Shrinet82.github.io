import { useCurrentFrame } from 'remotion'
import { C, Mono, Panel, Stage, lerp, prog } from './kit'

// Aegis governance: a platform glitch spawns buckets and instances nobody
// owns, a Cloud Custodian policy marks them, and the sweep clears them.

const COLS = 8
const ROWS = 4
const CELLS = COLS * ROWS
const LEGIT = new Set([0, 9, 18, 27]) // tagged, owned, left alone

const POLICY = [
  '- name: runaway-resources',
  '  resource: aws.s3',
  '  filters:',
  '    - "tag:owner": absent',
  '  actions:',
  '    - type: mark-for-op',
  '    - type: delete',
]

function Bucket({ col }: { col: string }) {
  return <path d="M-20 -14 L20 -14 L15 18 L-15 18 Z M-20 -14 Q0 -22 20 -14" fill="none" stroke={col} strokeWidth={2.4} strokeLinejoin="round" />
}
function Instance({ col }: { col: string }) {
  return (
    <g fill="none" stroke={col} strokeWidth={2.4}>
      <rect x={-16} y={-16} width={32} height={32} rx={5} />
      <rect x={-7} y={-7} width={14} height={14} rx={2} />
      {[-9, 0, 9].map((k) => (
        <path key={k} d={`M${k} -16 v-6 M${k} 16 v6 M-16 ${k} h-6 M16 ${k} h6`} />
      ))}
    </g>
  )
}

export function Govern() {
  const f = useCurrentFrame()
  // the scan line marks offenders; the sweeper removes them after the grace period
  const sweep = prog(f, 300, 430)
  const sweepX = lerp(60, 760, sweep)
  let buckets = 0
  let instances = 0

  const cells = Array.from({ length: CELLS }, (_, i) => {
    const c = i % COLS
    const r = Math.floor(i / COLS)
    const x = 92 + c * 88
    const y = 130 + r * 74
    const legit = LEGIT.has(i)
    const born = legit ? 1 : prog(f, 20 + i * 5, 34 + i * 5)
    const marked = !legit && sweepX > x - 10
    const gone = legit ? 0 : prog(f, 445 + c * 5, 470 + c * 5)
    const isBucket = (i * 7) % 3 !== 0
    if (born > 0.5 && gone < 0.5 && !legit) isBucket ? buckets++ : instances++
    const col = legit ? C.info : marked ? C.warn : C.crit
    const s = born * (1 - gone)
    if (s <= 0.01) return null
    return (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={s}>
        {isBucket ? <Bucket col={col} /> : <Instance col={col} />}
        {legit && <circle cx={20} cy={-18} r={5} fill={C.ok} />}
      </g>
    )
  })

  const alarm = buckets + instances > 6
  const done = f >= 490

  return (
    <Stage>
      <Panel x={40} y={40} w={720} h={380} title="aws · us-east-1" tone={alarm && !done ? 'crit' : done ? 'ok' : undefined}>
        <Mono x={700} y={30} text={`untagged  s3 ${buckets}  ec2 ${instances}`} size={17} fill={alarm ? C.crit : C.muted} anchor="end" />
      </Panel>
      {cells}
      {sweep > 0 && sweep < 1 && (
        <g>
          <rect x={sweepX - 60} y={96} width={60} height={312} fill={C.warn} opacity={0.08} />
          <line x1={sweepX} x2={sweepX} y1={96} y2={408} stroke={C.warn} strokeWidth={2.5} />
        </g>
      )}

      <Panel x={40} y={448} w={440} h={312} title="policies/runaway.yml" tone={f >= 210 && f < 330 ? 'accent' : undefined}>
        {POLICY.map((line, i) => {
          const typed = prog(f, 200 + i * 16, 226 + i * 16) * line.length
          return <Mono key={i} x={22} y={88 + i * 30} text={line} chars={typed} size={17} fill={line.includes('delete') || line.includes('mark') ? C.warn : C.text} />
        })}
      </Panel>

      <Panel x={500} y={448} w={260} h={312} title="time to fix">
        <Mono x={22} y={96} text="by hand" size={16} fill={C.dim} />
        <text x={22} y={140} fontSize={36} fontWeight={700} fill={C.muted}>
          4–24 h
        </text>
        <line x1={20} x2={lerp(20, 162, prog(f, 470, 500))} y1={128} y2={128} stroke={C.crit} strokeWidth={3} />
        <Mono x={22} y={192} text="with Aegis" size={16} fill={C.dim} />
        <text x={22} y={238} fontSize={40} fontWeight={700} fill={C.ok} opacity={prog(f, 480, 510)}>
          {'< 2 min'}
        </text>
        <Mono x={22} y={282} text="≈ 720× faster" size={17} fill={C.accent} opacity={prog(f, 520, 545)} />
      </Panel>

    </Stage>
  )
}
