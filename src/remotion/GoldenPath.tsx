import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { C, Defs, clamp, ease, lerp, mono, prog, sans, serif, serifItalic } from './kit'

// Plate I (OPSIE). Scroll-scrubbed storyboard, true to the OPSIE README.
// Before: Terraform by hand behind a ticket queue, about 45 minutes for a
// bucket. After: one Backstage golden-path form. The template locks the
// bucket private and encrypted, GitHub Actions signs in keyless over OIDC,
// runs terraform plan, Infracost prices it before apply, apply runs and the
// bucket registers itself in the catalog, tagged. 8 minutes.
//
// 60 fps, timed in beats of 1/30 s (two frames each), 300 beats in all.

export const GOLDEN = { width: 960, height: 620, fps: 60, durationInFrames: 600 }
// Phones: one panel at a time. The camera holds on Before, then pans to
// After; the timings run down one column underneath. Short enough to pin.
export const GOLDEN_NARROW = { width: 476, height: 840 }
const ID = 'gp'

const rows = [
  { what: 'S3 bucket', before: 45, after: 8 },
  { what: 'VPC + subnets', before: 60, after: 12 },
  { what: 'App on Kubernetes', before: 30, after: 10 },
]
// The README's manual path: a ticket, copy-pasted provider config,
// Terraform from scratch, plan and apply, tags you may forget, catalog YAML.
const oldSteps = ['open a ticket', 'copy old config', 'write Terraform', 'plan + apply', 'tag it (maybe)', 'catalog YAML']
const fields = [
  { label: 'Name', value: 'orders-archive' },
  { label: 'Environment', value: 'prod' },
  { label: 'Owner', value: 'team-payments' },
]
const nodes = [
  { label: 'oidc', tag: 'keyless' },
  { label: 'plan', tag: '' },
  { label: 'infracost', tag: '$0.023/GB·mo' },
  { label: 'apply', tag: '' },
  { label: 'catalog', tag: 'auto' },
]
const PIPE = { x0: 548, x1: 892, y: 352 }

// Beats where each part of the After panel happens.
const TYPE_AT = 158
const LOCKS_AT = 200
const PRESS_AT = 208
const PIPE_AT = [216, 262]
const CARD_AT = [262, 280]
const BARS_AT = [268, 296]

function Panel({ x, active, title, sub, children }: { x: number; active: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <g opacity={lerp(0.45, 1, active)}>
      <rect x={x} y={20} width={444} height={450} fill={C.paper} stroke={C.ink} strokeWidth={2} filter={`url(#${ID}-rough)`} />
      <text x={x + 22} y={58} fontFamily={serifItalic} fontSize={26} fill={C.ink}>
        {title}
      </text>
      <text x={x + 22 + title.length * 12 + 14} y={57} fontFamily={mono} fontSize={14} fill={C.graphite}>
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

// A small padlock, for the settings the template does not let you change.
function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-5} y={-1} width={10} height={8} rx={1.5} fill={C.ochreWash} stroke={C.ink} strokeWidth={1.1} />
      <path d="M -3 -1 L -3 -4 A 3 3 0 0 1 3 -4 L 3 -1" fill="none" stroke={C.ink} strokeWidth={1.2} />
    </g>
  )
}

export const GoldenPath: React.FC<{ narrow?: boolean }> = ({ narrow = false }) => {
  const T = useCurrentFrame() / 2
  const before = prog(T, 0, 150, ease.soft)
  const after = prog(T, 150, 272, ease.soft)
  const leftMin = 45 * before
  const rightMin = 8 * after
  const typed = (start: number, text: string) => text.slice(0, Math.round(interpolate(T, [start, start + text.length * 1.1], [0, text.length], clamp)))
  const typing = fields.findIndex((fl, i) => T >= TYPE_AT + i * 14 && T < TYPE_AT + i * 14 + fl.value.length * 1.1)
  const press = interpolate(T, [PRESS_AT, PRESS_AT + 3, PRESS_AT + 8], [1, 0.92, 1], clamp)
  const pipe = prog(T, PIPE_AT[0], PIPE_AT[1], ease.inOut)
  const card = prog(T, CARD_AT[0], CARD_AT[1], ease.out)
  const bars = prog(T, BARS_AT[0], BARS_AT[1], ease.inOut)
  const camX = narrow ? interpolate(T, [128, 162], [0, -484], { ...clamp, easing: ease.inOut }) : 0
  const packetX = lerp(PIPE.x0, PIPE.x1, pipe)

  return (
    <AbsoluteFill>
      <svg viewBox={narrow ? `0 0 ${GOLDEN_NARROW.width} ${GOLDEN_NARROW.height}` : '0 0 960 620'} width="100%" height="100%">
        <Defs id={ID} f={T} />

        <g transform={`translate(${camX} 0)`}>
          {/* BEFORE */}
          <Panel x={16} active={T < 150 ? 1 : 0} title="Before" sub="Terraform by hand">
            <Clock cx={130} cy={190} r={74} minutes={leftMin} tone={C.vermWash} />
            <text x={130} y={300} textAnchor="middle" fontFamily={serif} fontSize={34} fill={C.vermilion}>
              {`${String(Math.round(leftMin)).padStart(2, '0')}:00`}
            </text>
            <text x={130} y={320} textAnchor="middle" fontFamily={mono} fontSize={14} fill={C.graphite}>
              minutes, by hand
            </text>
            {/* the ticket pile: each lands, settles, and waits */}
            {Array.from({ length: 6 }, (_, i) => {
              const land = prog(T, i * 20, i * 20 + 16, ease.out)
              const settle = Math.sin(prog(T, i * 20 + 12, i * 20 + 22) * Math.PI) * 3
              const rot = [-6, 4, -3, 7, -5, 2][i]
              return (
                <g key={i} opacity={land > 0 ? 1 : 0} transform={`translate(${282 + (i % 2) * 8} ${lerp(-60, 250 - i * 16, land) + settle}) rotate(${rot * land})`}>
                  <rect x={-80} y={-24} width={160} height={48} fill={C.paper} stroke={C.ink} strokeWidth={1.6} />
                  <rect x={-80} y={-24} width={8} height={48} fill={C.ochreWash} />
                  <text x={-64} y={-5} fontFamily={mono} fontSize={13} fill={C.ink}>{`TICKET-48${i}`}</text>
                  <text x={-64} y={12} fontFamily={sans} fontSize={13} fill={C.graphite}>
                    need an S3 bucket
                  </text>
                </g>
              )
            })}
            {/* the top ticket gets stamped */}
            <g opacity={prog(T, 118, 124)} transform={`translate(318 ${250 - 5 * 16 + 12}) rotate(-8) scale(${interpolate(T, [118, 124], [1.25, 1], clamp)})`}>
              <rect x={-44} y={-13} width={88} height={24} rx={3} fill="none" stroke={C.vermilion} strokeWidth={2} />
              <text x={0} y={4} textAnchor="middle" fontFamily={mono} fontSize={13} fill={C.vermilion} letterSpacing={1}>
                IN QUEUE
              </text>
            </g>
            <text x={282} y={300} textAnchor="middle" fontFamily={mono} fontSize={14} fill={C.graphite}>
              the queue
            </text>
            {/* the old way, one slow step at a time */}
            {oldSteps.map((s, i) => {
              const done = prog(T, 22 + i * 22, 26 + i * 22)
              return (
                <g key={s} transform={`translate(${44 + (i % 3) * 140} ${370 + Math.floor(i / 3) * 34})`}>
                  <rect x={0} y={-13} width={16} height={16} fill={C.paper} stroke={C.ink} strokeWidth={1.4} />
                  {done > 0 && <path d="M3 -5 l 4 4 l 7 -9" fill="none" stroke={C.vermilion} strokeWidth={2} pathLength={1} strokeDasharray={`${done} 1`} />}
                  <text x={24} y={0} fontFamily={sans} fontSize={14} fill={done >= 1 ? C.ink : C.faint}>
                    {s}
                  </text>
                </g>
              )
            })}
          </Panel>

          {/* AFTER */}
          <Panel x={500} active={T >= 150 ? 1 : 0} title="After" sub="one golden path">
            {/* stopwatch */}
            <Clock cx={872} cy={126} r={30} minutes={rightMin} tone={C.ochreWash} />
            <text x={872} y={182} textAnchor="middle" fontFamily={serif} fontSize={22} fill={C.ultra}>
              {`${String(Math.round(rightMin)).padStart(2, '0')}:00`}
            </text>
            {/* the Backstage scaffolder window */}
            <g filter={`url(#${ID}-rough)`}>
              <rect x={522} y={90} width={300} height={218} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={1.8} />
              <line x1={522} y1={112} x2={822} y2={112} stroke={C.ink} strokeWidth={1.4} />
            </g>
            {[534, 546, 558].map((x) => (
              <circle key={x} cx={x} cy={101} r={3.4} fill="none" stroke={C.ink} strokeWidth={1.2} />
            ))}
            <text x={574} y={105} fontFamily={mono} fontSize={13} fill={C.graphite}>
              backstage · create · s3 bucket
            </text>
            <rect x={536} y={122} width={132} height={22} rx={11} fill={C.ochreSoft} stroke={C.ochre} strokeWidth={1} />
            <text x={548} y={137} fontFamily={mono} fontSize={13} fill={C.ochre}>
              ★ golden path
            </text>
            {fields.map((fl, i) => {
              const text = typed(TYPE_AT + i * 14, fl.value)
              const focus = typing === i
              return (
                <g key={fl.label} transform={`translate(536 ${158 + i * 32})`}>
                  <text x={0} y={10} fontFamily={sans} fontSize={13} fill={C.graphite}>
                    {fl.label}
                  </text>
                  <rect x={88} y={-4} width={184} height={22} rx={3} fill="#fff" stroke={focus ? C.ultra : C.rule} strokeWidth={1.4} />
                  <text x={96} y={11} fontFamily={mono} fontSize={13.5} fill={C.ink}>
                    {text}
                  </text>
                  {focus && Math.floor(T / 8) % 2 === 0 && <rect x={97 + text.length * 8.1} y={0} width={1.6} height={14} fill={C.ink} />}
                </g>
              )
            })}
            {/* what the template decides for you */}
            {['encrypted', 'private'].map((s, i) => (
              <g key={s} opacity={prog(T, LOCKS_AT + i * 4, LOCKS_AT + i * 4 + 6)} transform={`translate(${536 + i * 104} 256)`}>
                <rect x={0} y={0} width={96} height={20} rx={10} fill={C.sapSoft} stroke={C.sap} strokeWidth={1} />
                <Lock x={14} y={7} />
                <text x={26} y={14.5} fontFamily={mono} fontSize={12} fill={C.sap}>
                  {s}
                </text>
              </g>
            ))}
            <g transform={`translate(768 ${288}) scale(${press})`}>
              <rect x={-38} y={-13} width={76} height={26} rx={13} fill={T >= PRESS_AT ? C.ultra : C.ink} />
              <text x={0} y={5} textAnchor="middle" fontFamily={sans} fontSize={14} fill={C.paper}>
                {T >= PRESS_AT + 4 ? 'Created' : 'Create'}
              </text>
            </g>

            {/* the GitHub Actions run behind the button: the golden path itself */}
            <text x={PIPE.x0 - 14} y={PIPE.y - 22} fontFamily={mono} fontSize={12} fill={C.graphite} opacity={T >= PRESS_AT ? 1 : 0.5}>
              github actions · provision-s3
            </text>
            <line x1={PIPE.x0} y1={PIPE.y} x2={PIPE.x1} y2={PIPE.y} stroke={C.rule} strokeWidth={3} strokeLinecap="round" />
            {pipe > 0 && <line x1={PIPE.x0} y1={PIPE.y} x2={packetX} y2={PIPE.y} stroke={C.ochreWash} strokeWidth={5} strokeLinecap="round" />}
            {nodes.map((n, i) => {
              const x = PIPE.x0 + (i * (PIPE.x1 - PIPE.x0)) / (nodes.length - 1)
              const at = i / (nodes.length - 1)
              const lit = pipe >= at - 0.001 && T >= PIPE_AT[0]
              const pop = lit ? interpolate(pipe, [at, at + 0.06], [1.25, 1], clamp) : 1
              return (
                <g key={n.label}>
                  <g transform={`translate(${x} ${PIPE.y}) scale(${pop})`}>
                    <circle r={11} fill={lit ? C.ochreWash : C.paper} stroke={C.ink} strokeWidth={1.6} />
                    {lit && <path d="M-5 0 l 3.5 3.5 l 6.5 -7" fill="none" stroke={C.ink} strokeWidth={2} />}
                  </g>
                  <text x={x} y={PIPE.y + 30} textAnchor="middle" fontFamily={mono} fontSize={13} fill={lit ? C.ink : C.faint}>
                    {n.label}
                  </text>
                  {n.tag && (
                    <text x={x} y={PIPE.y + 46} textAnchor="middle" fontFamily={mono} fontSize={12} fill={C.sap} opacity={lit ? 1 : 0}>
                      {n.tag}
                    </text>
                  )}
                </g>
              )
            })}
            {pipe > 0 && pipe < 1 && <circle cx={packetX} cy={PIPE.y} r={5} fill={C.ink} />}

            {/* the catalog entry, written on apply */}
            <g opacity={card} transform={`translate(0 ${lerp(18, 0, card)})`}>
              <rect x={522} y={412} width={400} height={46} rx={6} fill={C.sapSoft} stroke={C.sap} strokeWidth={1.4} />
              <text x={538} y={432} fontFamily={serif} fontSize={16} fill={C.ink}>
                orders-archive
              </text>
              <text x={538} y={449} fontFamily={mono} fontSize={12.5} fill={C.graphite}>
                s3 · prod · encrypted · tagged owner + cost-centre
              </text>
              <text x={906} y={432} textAnchor="end" fontFamily={mono} fontSize={13} fill={C.sap}>
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
          const cut = Math.round((1 - r.after / r.before) * 100)
          return (
            <Interactive.G key={r.what} name={`Timing ${r.what}`} style={{ translate: narrow ? `0px ${i * 112}px` : '0px 0px' }}>
              <text x={x} y={512} fontFamily={serif} fontSize={17} fill={C.ink}>
                {r.what}
              </text>
              <line x1={x} y1={534} x2={x + (r.before / 60) * w} y2={534} stroke={C.faint} strokeWidth={2} strokeDasharray="4 4" />
              <line x1={x} y1={534} x2={x + (cur / 60) * w} y2={534} stroke={C.ultra} strokeWidth={7} strokeLinecap="round" filter={`url(#${ID}-rough)`} />
              <text x={x} y={566} fontFamily={serif} fontSize={24} fill={C.ultra}>
                {`${Math.round(cur)} min`}
              </text>
              <text x={x + 96} y={566} fontFamily={serif} fontSize={20} fill={C.sap} opacity={prog(T, BARS_AT[1] - 6, BARS_AT[1] + 2)}>
                {`−${cut}%`}
              </text>
              <text x={x} y={588} fontFamily={mono} fontSize={14} fill={C.vermilion} textDecoration="line-through">
                {`was ${r.before} min`}
              </text>
            </Interactive.G>
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}
