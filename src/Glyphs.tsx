import type { Glyph as GlyphKind } from './content'

// Tiny diagrams of what each project actually does. Drawn in their finished
// state; motion.ts animates them in and replays them on hover.

const W = 168
const H = 72

function Roc() {
  return (
    <>
      <rect className="g-frame" x="8" y="6" width="60" height="60" />
      <line className="g-dash" x1="8" y1="66" x2="68" y2="6" />
      <path className="g-draw g-amber" d="M8 66 C 12 40, 22 24, 38 17 S 60 9, 68 6" />
      <text className="g-text" x="80" y="32">AUC</text>
      <text className="g-num g-amber" x="80" y="54">0.78</text>
    </>
  )
}

const spans = [
  { name: 'sensor.read', x: 8, w: 34 },
  { name: 'controller.decide', x: 42, w: 40 },
  { name: 'pump.actuate', x: 82, w: 52 },
  { name: 'sensor.verify', x: 134, w: 26 },
]
function Trace() {
  return (
    <>
      <rect className="g-span g-root" x="8" y="6" width="152" height="8" />
      {spans.map((s, i) => (
        <rect key={s.name} className="g-span g-bar" x={s.x} y={20 + i * 12} width={s.w} height="8">
          <title>{s.name}</title>
        </rect>
      ))}
    </>
  )
}

function Stream() {
  return (
    <>
      <line className="g-dash" x1="6" y1="24" x2="162" y2="24" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} className={`g-evt ${i === 2 ? 'g-hot' : ''}`} cx={20 + i * 30} cy="24" r="4" />
      ))}
      <rect className="g-alert" x="44" y="42" width="122" height="22" rx="3" />
      <text className="g-text g-err g-alert-t" x="52" y="57">force-push · HIGH</text>
    </>
  )
}

const base = [6, 14, 26, 34, 24, 12, 6, 3]
const drifted = [2, 4, 9, 16, 26, 32, 22, 11]
function Drift() {
  return (
    <>
      <line className="g-axis" x1="6" y1="64" x2="162" y2="64" />
      {base.map((h, i) => (
        <rect key={`b${i}`} className="g-hist-base" x={8 + i * 19} y={64 - h} width="8" height={h} />
      ))}
      {drifted.map((h, i) => (
        <rect key={`d${i}`} className="g-hist g-amber-fill" x={17 + i * 19} y={64 - h} width="8" height={h} />
      ))}
    </>
  )
}

const nodes = [
  [22, 36],
  [60, 14],
  [64, 56],
  [104, 30],
  [140, 12],
  [146, 56],
] as const
const edges = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [1, 4],
]
function Graph() {
  return (
    <>
      {edges.map(([a, b], i) => (
        <line key={i} className="g-edge" x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} className={`g-node ${i === 3 ? 'g-node-hub' : ''}`} cx={x} cy={y} r={i === 3 ? 6 : 4} />
      ))}
    </>
  )
}

function Pods() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <rect key={i} className={`g-pod ${i === 1 ? 'g-pod-sick' : ''}`} x={8 + i * 34} y="18" width="26" height="26" rx="3" />
      ))}
      <text className="g-text g-restarts" x="8" y="62">
        restarts <tspan className="g-count">4</tspan> in 5m
      </text>
      <text className="g-text g-ok g-fix" x="112" y="36">
        rollout
      </text>
      <text className="g-text g-ok g-fix" x="112" y="50">
        restart
      </text>
    </>
  )
}

function Rule() {
  return (
    <>
      <text className="g-text g-kw" x="6" y="28">
        WHEN
      </text>
      <text className="g-text g-type" x="44" y="28" data-full="spend > 500,000">
        spend &gt; 500,000
      </text>
      <text className="g-text g-kw" x="6" y="52">
        THEN
      </text>
      <text className="g-text g-type g-amber" x="44" y="52" data-full="Finance signs off">
        Finance signs off
      </text>
    </>
  )
}

const map: Record<GlyphKind, () => React.JSX.Element> = {
  roc: Roc,
  trace: Trace,
  stream: Stream,
  drift: Drift,
  graph: Graph,
  pods: Pods,
  rule: Rule,
}

export default function Glyph({ kind }: { kind: GlyphKind }) {
  const Body = map[kind]
  return (
    <svg className="glyph" data-glyph={kind} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <Body />
    </svg>
  )
}
