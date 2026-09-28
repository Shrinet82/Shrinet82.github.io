import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { C, Defs, clamp, ease, lerp, mono, prog, sans, serif, serifItalic } from './kit'

// Plate I (OPSIE). Scroll-scrubbed storyboard. Before: a ticket queue and a
// clock that grinds to 45:00. After: one Backstage golden-path form, a
// Terraform run behind it, and the bucket in the catalog at 08:00.
// Timings are the measured OPSIE numbers.

export const GOLDEN = { width: 960, height: 620, fps: 30, durationInFrames: 300 }
// Phones: the two panels stack and the timings run down one column.
export const GOLDEN_NARROW = { width: 476, height: 1296 }
const ID = 'gp'

const rows = [
  { what: 'S3 bucket', before: 45, after: 8 },
  { what: 'VPC + subnets', before: 60, after: 12 },
  { what: 'App on Kubernetes', before: 30, after: 10 },
]
const oldSteps = ['write Terraform', 'open a ticket', 'wait for review', 'plan', 'apply', 'register it']
const fields = [
  { label: 'Name', value: 'orders-archive' },
  { label: 'Environment', value: 'prod' },
  { label: 'Owner', value: 'team-payments' },
]
const nodes = [
  { label: 'terraform plan', tag: '' },
  { label: 'infracost', tag: 'within budget' },
  { label: 'oidc apply', tag: 'keyless' },
  { label: 'catalog', tag: '' },
]

function Panel({ x, active, title, sub, children }: { x: number; active: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <g opacity={lerp(0.5, 1, active)}>
      <rect x={x} y={20} width={444} height={450} fill={C.paper} stroke={C.ink} strokeWidth={2} filter={`url(#${ID}-rough)`} />
      <text x={x + 22} y={58} fontFamily={serifItalic} fontSize={26} fill={C.ink}>
        {title}
      </text>
      <text x={x + 22 + title.length * 12 + 14} y={57} fontFamily={mono} fontSize={13} fill={C.graphite}>
        {sub}
      </text>
      <line x1={x + 22} y1={72} x2={x + 422} y2={72} stroke={C.rule} strokeWidth={1.4} />
      {children}
    </g>
  )
}

function Clock({ cx, cy, r, minutes, tone }: { cx: number; cy: number; r: number; minutes: number; tone: string }) {
  const a = (minutes / 60) * Math.PI * 2 - Math.PI / 2
  const sweep = Math.min(minutes / 60, 0.9999) * Math.PI * 2
  const large = sweep > Math.PI ? 1 : 0
  const ex = cx + Math.cos(-Math.PI / 2 + sweep) * r
  const ey = cy + Math.sin(-Math.PI / 2 + sweep) * r
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.paper} stroke={C.ink} strokeWidth={2.2} filter={`url(#${ID}-rough)`} />
      {minutes > 0.05 && <path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`} fill={tone} opacity={0.32} />}
      {Array.from({ length: 12 }, (_, i) => {
        const t = (i / 12) * Math.PI * 2
        return <line key={i} x1={cx + Math.cos(t) * r * 0.84} y1={cy + Math.sin(t) * r * 0.84} x2={cx + Math.cos(t) * r * 0.96} y2={cy + Math.sin(t) * r * 0.96} stroke={C.ink} strokeWidth={i % 3 ? 1 : 2.2} />
      })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(a) * r * 0.78} y2={cy + Math.sin(a) * r * 0.78} stroke={C.ink} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill={C.ink} />
    </g>
  )
}

export const GoldenPath: React.FC<{ narrow?: boolean }> = ({ narrow = false }) => {
  const f = useCurrentFrame()
  const before = prog(f, 0, 150, ease.soft)
  const after = prog(f, 150, 270, ease.soft)
  const leftMin = 45 * before
  const rightMin = 8 * after
  const typed = (start: number, text: string) => text.slice(0, Math.round(interpolate(f, [start, start + text.length * 1.1], [0, text.length], clamp)))
  const pressed = f >= 194 && f < 200
  const pipe = prog(f, 202, 252, ease.inOut)
  const card = prog(f, 252, 272, ease.out)
  const bars = prog(f, 262, 298, ease.inOut)

  return (
    <AbsoluteFill>
      <svg viewBox={narrow ? `0 0 ${GOLDEN_NARROW.width} ${GOLDEN_NARROW.height}` : '0 0 960 620'} width="100%" height="100%">
        <Defs id={ID} f={f} />

        {/* BEFORE */}
        <Panel x={16} active={f < 150 ? 1 : 0} title="Before" sub="a ticket for every bucket">
          <Clock cx={130} cy={190} r={74} minutes={leftMin} tone={C.vermWash} />
          <text x={130} y={300} textAnchor="middle" fontFamily={serif} fontSize={34} fill={C.vermilion}>
            {`${String(Math.round(leftMin)).padStart(2, '0')}:00`}
          </text>
          <text x={130} y={320} textAnchor="middle" fontFamily={mono} fontSize={12} fill={C.graphite}>
            minutes waiting
          </text>
          {/* the ticket pile */}
          {Array.from({ length: 6 }, (_, i) => {
            const land = prog(f, i * 20, i * 20 + 16, ease.out)
            const rot = [-6, 4, -3, 7, -5, 2][i]
            return (
              <g key={i} opacity={land > 0 ? 1 : 0} transform={`translate(${282 + (i % 2) * 8} ${lerp(-60, 250 - i * 16, land)}) rotate(${rot * land})`}>
                <rect x={-80} y={-24} width={160} height={48} fill={C.paper} stroke={C.ink} strokeWidth={1.6} />
                <rect x={-80} y={-24} width={8} height={48} fill={C.ochreWash} />
                <text x={-64} y={-5} fontFamily={mono} fontSize={11} fill={C.ink}>{`TICKET-48${i}`}</text>
                <text x={-64} y={12} fontFamily={sans} fontSize={11} fill={C.graphite}>
                  need an S3 bucket
                </text>
              </g>
            )
          })}
          <text x={282} y={300} textAnchor="middle" fontFamily={mono} fontSize={12} fill={C.graphite}>
            the queue
          </text>
          {/* the old way, one slow step at a time */}
          {oldSteps.map((s, i) => {
            const done = f >= 22 + i * 22
            return (
              <g key={s} transform={`translate(${44 + (i % 3) * 140} ${370 + Math.floor(i / 3) * 34})`}>
                <rect x={0} y={-13} width={16} height={16} fill={C.paper} stroke={C.ink} strokeWidth={1.4} />
                {done && <path d="M3 -5 l 4 4 l 7 -9" fill="none" stroke={C.vermilion} strokeWidth={2} />}
                <text x={24} y={0} fontFamily={sans} fontSize={13} fill={done ? C.ink : C.faint}>
                  {s}
                </text>
              </g>
            )
          })}
        </Panel>

        {/* AFTER */}
        <g transform={narrow ? 'translate(-484 470)' : undefined}>
        <Panel x={500} active={f >= 150 ? 1 : 0} title="After" sub="one golden path">
          {/* stopwatch */}
          <Clock cx={872} cy={126} r={30} minutes={rightMin} tone={C.ultraWash} />
          <text x={872} y={182} textAnchor="middle" fontFamily={serif} fontSize={22} fill={C.ultra}>
            {`${String(Math.round(rightMin)).padStart(2, '0')}:00`}
          </text>
          {/* the Backstage window */}
          <g filter={`url(#${ID}-rough)`}>
            <rect x={522} y={90} width={300} height={210} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={1.8} />
            <line x1={522} y1={112} x2={822} y2={112} stroke={C.ink} strokeWidth={1.4} />
          </g>
          {[534, 546, 558].map((x) => (
            <circle key={x} cx={x} cy={101} r={3.4} fill="none" stroke={C.ink} strokeWidth={1.2} />
          ))}
          <text x={574} y={105} fontFamily={mono} fontSize={10.5} fill={C.graphite}>
            backstage · create · s3 bucket
          </text>
          <rect x={536} y={124} width={132} height={22} rx={11} fill={C.ochreSoft} stroke={C.ochre} strokeWidth={1} />
          <text x={548} y={139} fontFamily={mono} fontSize={10.5} fill={C.ochre}>
            ★ golden path
          </text>
          {fields.map((fl, i) => (
            <g key={fl.label} transform={`translate(536 ${160 + i * 36})`}>
              <text x={0} y={10} fontFamily={sans} fontSize={11} fill={C.graphite}>
                {fl.label}
              </text>
              <rect x={88} y={-4} width={184} height={22} rx={3} fill="#fff" stroke={f >= 158 + i * 14 && f < 172 + i * 14 ? C.ultra : C.rule} strokeWidth={1.4} />
              <text x={96} y={11} fontFamily={mono} fontSize={11.5} fill={C.ink}>
                {typed(158 + i * 14, fl.value)}
              </text>
            </g>
          ))}
          <g transform={`translate(740 ${270}) scale(${pressed ? 0.94 : 1})`}>
            <rect x={-38} y={-14} width={76} height={26} rx={13} fill={f >= 194 ? C.ultra : C.ink} />
            <text x={0} y={4} textAnchor="middle" fontFamily={sans} fontSize={12} fill={C.paper}>
              {f >= 200 ? 'Created' : 'Create'}
            </text>
          </g>
          {/* the pipeline behind the button */}
          <line x1={566} y1={346} x2={878} y2={346} stroke={C.rule} strokeWidth={3} strokeLinecap="round" />
          <line x1={566} y1={346} x2={lerp(566, 878, pipe)} y2={346} stroke={C.ultra} strokeWidth={3} strokeLinecap="round" />
          {nodes.map((n, i) => {
            const x = 566 + i * 104
            const lit = pipe >= i / 3 - 0.001 && f >= 202
            return (
              <g key={n.label}>
                <circle cx={x} cy={346} r={11} fill={lit ? C.ultra : C.paper} stroke={C.ink} strokeWidth={1.6} />
                {lit && <path d={`M${x - 5} 346 l 3.5 3.5 l 6.5 -7`} fill="none" stroke={C.paper} strokeWidth={2} />}
                <text x={x} y={376} textAnchor="middle" fontFamily={mono} fontSize={11} fill={lit ? C.ink : C.faint}>
                  {n.label}
                </text>
                {n.tag && (
                  <text x={x} y={392} textAnchor="middle" fontFamily={mono} fontSize={10} fill={C.sap} opacity={lit ? 1 : 0}>
                    {n.tag}
                  </text>
                )}
              </g>
            )
          })}
          {/* the catalog entry */}
          <g opacity={card} transform={`translate(0 ${lerp(18, 0, card)})`}>
            <rect x={522} y={408} width={400} height={46} rx={6} fill={C.sapSoft} stroke={C.sap} strokeWidth={1.4} />
            <text x={538} y={428} fontFamily={serif} fontSize={16} fill={C.ink}>
              orders-archive
            </text>
            <text x={538} y={445} fontFamily={mono} fontSize={10.5} fill={C.graphite}>
              s3 · prod · owner team-payments
            </text>
            <text x={906} y={437} textAnchor="end" fontFamily={mono} fontSize={11} fill={C.sap}>
              ✓ in the catalog
            </text>
          </g>
        </Panel>
        </g>

        {/* the three measured golden paths */}
        {rows.map((r, i) => {
          const x = narrow ? 16 : 16 + i * 316
          const w = 220
          const cur = lerp(r.before, r.after, bars)
          return (
            <Interactive.G key={r.what} name={`Timing ${r.what}`} style={{ translate: narrow ? `0px ${470 + i * 108}px` : '0px 0px' }}>
              <text x={x} y={512} fontFamily={serif} fontSize={17} fill={C.ink}>
                {r.what}
              </text>
              <line x1={x} y1={534} x2={x + (r.before / 60) * w} y2={534} stroke={C.faint} strokeWidth={2} strokeDasharray="4 4" />
              <line x1={x} y1={534} x2={x + (cur / 60) * w} y2={534} stroke={C.ultra} strokeWidth={7} strokeLinecap="round" filter={`url(#${ID}-rough)`} />
              <text x={x} y={566} fontFamily={serif} fontSize={24} fill={C.ultra}>
                {`${Math.round(cur)} min`}
              </text>
              <text x={x} y={588} fontFamily={mono} fontSize={12} fill={C.vermilion} textDecoration="line-through">
                {`was ${r.before} min`}
              </text>
            </Interactive.G>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}
