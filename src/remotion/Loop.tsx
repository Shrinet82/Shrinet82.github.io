import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion'
import { Box, C, Defs, Helm, clamp, ease, lerp, mono, prog, sans, serif } from './kit'

// Plate IV (Aegis Observe). The SRE loop as a five-panel film, scrubbed by
// the pinned scroll: the camera pans from panel to panel while each panel
// plays its own sequence. Everything shown follows the project README:
// SigNoz MCP log search, one LLM-selected tool behind a confidence gate,
// Slack Approve / PR / Reject, a GitOps pull request synced by ArgoCD, and
// the agent's own OpenTelemetry spans, token usage included.

export const LOOP = { height: 620, fps: 30, durationInFrames: 500 }
export const LOOP_WORLD = 2040
const ID = 'lp'
const PANEL_W = 380
const STAGE = 100
const panelX = (i: number) => 40 + i * 400

const TITLES = [
  { verb: 'Detect', line: ['SigNoz signals and a log search', 'for known signatures.'] },
  { verb: 'Decide', line: ['An LLM picks exactly one tool.', 'Low confidence stops here.'] },
  { verb: 'Ask', line: ['A Slack card: Approve, PR, Reject.', 'The incident is locked meanwhile.'] },
  { verb: 'Fix', line: ['A pull request with the reasoning,', 'merged and synced by ArgoCD.'] },
  { verb: 'Verify', line: ['Back under the SLO. The agent', 'traces itself, tokens and all.'] },
]

// A latency series: calm, a 504 spike in the middle, optionally recovered.
function latency(i: number, spike: number) {
  const base = 250 + Math.sin(i * 0.9) * 6 + Math.sin(i * 2.3) * 4
  const bump = Math.exp(-Math.pow((i - 17) / 3.2, 2)) * 110 * spike
  return base - bump
}
function Chart({ x, y, drawn, spike, tone }: { x: number; y: number; drawn: number; spike: number; tone: string }) {
  const n = 34
  const pts = Array.from({ length: n }, (_, i) => [x + i * 9.6, y - 250 + latency(i, spike)] as const)
  const upto = Math.max(2, Math.round(n * drawn))
  const d = pts.slice(0, upto).map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
  return (
    <g>
      <rect x={x - 10} y={y - 120} width={340} height={140} rx={6} fill={C.paper} stroke={C.rule} strokeWidth={1.4} />
      <line x1={x} y1={y - 60} x2={x + 320} y2={y - 60} stroke={C.vermilion} strokeWidth={1} strokeDasharray="4 4" />
      <text x={x + 318} y={y - 64} textAnchor="end" fontFamily={mono} fontSize={10} fill={C.vermilion}>
        slo
      </text>
      <text x={x} y={y - 102} fontFamily={mono} fontSize={10.5} fill={C.graphite}>
        fraud-detection-api · p99 latency
      </text>
      <path d={d} fill="none" stroke={tone} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  )
}

function PanelFrame({ i, active }: { i: number; active: number }) {
  const x = panelX(i)
  const t = TITLES[i]
  return (
    <g opacity={lerp(0.42, 1, active)}>
      <rect x={x} y={40} width={PANEL_W} height={548} rx={10} fill={C.paper} stroke={active > 0.5 ? C.ultra : C.ink} strokeWidth={active > 0.5 ? 2.4 : 1.6} filter={`url(#${ID}-rough)`} />
      <circle cx={x + 34} cy={82} r={16} fill={active > 0.5 ? C.ultra : C.paper} stroke={C.ink} strokeWidth={1.4} />
      <text x={x + 34} y={87} textAnchor="middle" fontFamily={mono} fontSize={13} fill={active > 0.5 ? C.paper : C.ink}>
        {i + 1}
      </text>
      <text x={x + 62} y={92} fontFamily={serif} fontSize={30} fill={C.ink}>
        {t.verb}
      </text>
      {t.line.map((l, k) => (
        <text key={k} x={x + 24} y={128 + k * 19} fontFamily={sans} fontSize={14} fill={C.graphite}>
          {l}
        </text>
      ))}
    </g>
  )
}

function Detect() {
  const f = useCurrentFrame()
  const x = panelX(0) + 30
  const logs = ['GET /score 200 41ms', 'GET /score 200 38ms', 'GET /score 504 30.0s', 'GET /score 200 44ms', 'GET /score 504 30.0s', 'GET /score 504 30.0s']
  const lens = interpolate(f, [52, 92], [0, 5], clamp)
  return (
    <g>
      <Chart x={x} y={320} drawn={prog(f, 0, 45, ease.soft)} spike={1} tone={C.ink} />
      <g opacity={prog(f, 38, 46)} transform="translate(0 0)">
        <rect x={x + 186} y={228} width={134} height={24} rx={12} fill={C.vermSoft} stroke={C.vermilion} strokeWidth={1.2} />
        <text x={x + 198} y={244} fontFamily={mono} fontSize={11} fill={C.vermilion}>
          ● 504 SLO breach
        </text>
      </g>
      <text x={x - 6} y={372} fontFamily={mono} fontSize={11} fill={C.ultra} opacity={prog(f, 46, 54)}>
        signoz_search_logs "504"
      </text>
      {logs.map((l, k) => {
        const hit = l.includes('504') && lens >= k - 0.3
        return (
          <g key={k} opacity={prog(f, 48 + k * 2, 54 + k * 2)}>
            <rect x={x - 10} y={384 + k * 30} width={340} height={24} rx={4} fill={hit ? C.vermSoft : 'transparent'} />
            <text x={x} y={401 + k * 30} fontFamily={mono} fontSize={12} fill={hit ? C.vermilion : C.graphite}>
              {l}
            </text>
          </g>
        )
      })}
      {/* the lens moving down the log */}
      <g transform={`translate(${x + 270} ${396 + lens * 30})`} opacity={f >= 52 && f < 96 ? 1 : 0}>
        <circle r={14} fill="none" stroke={C.ink} strokeWidth={2.4} />
        <line x1={10} y1={10} x2={22} y2={22} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  )
}

const TOOLS = [
  { label: 'restart pod', a: -162 },
  { label: 'scale up', a: -121 },
  { label: 'patch manifest', a: -59 },
  { label: 'cordon node', a: -18 },
]
function Decide() {
  const f = useCurrentFrame()
  const cx = panelX(1) + PANEL_W / 2
  const cy = 360
  // the needle hunts, then settles on patch manifest with a damped swing
  const hunt = interpolate(f, [4, 22, 36, 50], [-162, -18, -121, -59], { ...clamp, easing: ease.inOut })
  const needle = f < 50 ? hunt : -59 + Math.exp(-(f - 50) / 6) * Math.sin((f - 50) / 2) * 10
  const conf = prog(f, 58, 84, ease.out) * 0.84
  return (
    <g>
      <path d={`M ${cx - 120} ${cy} A 120 120 0 0 1 ${cx + 120} ${cy}`} fill={C.paper} stroke={C.ink} strokeWidth={2} filter={`url(#${ID}-rough)`} />
      {Array.from({ length: 13 }, (_, k) => {
        const a = ((-180 + k * 15) * Math.PI) / 180
        return <line key={k} x1={cx + Math.cos(a) * 104} y1={cy + Math.sin(a) * 104} x2={cx + Math.cos(a) * 116} y2={cy + Math.sin(a) * 116} stroke={C.ink} strokeWidth={k % 3 ? 1 : 2} />
      })}
      {TOOLS.map((t) => {
        const a = (t.a * Math.PI) / 180
        const chosen = t.label === 'patch manifest' && f >= 52
        return (
          <g key={t.label} transform={`translate(${cx + Math.cos(a) * 164} ${cy + Math.sin(a) * 156})`}>
            <rect x={-58} y={-13} width={116} height={26} rx={13} fill={chosen ? C.ultra : C.paper} stroke={chosen ? C.ultra : C.ink} strokeWidth={1.3} />
            <text y={4.5} textAnchor="middle" fontFamily={mono} fontSize={11} fill={chosen ? C.paper : C.ink}>
              {t.label}
            </text>
          </g>
        )
      })}
      <g transform={`translate(${cx} ${cy}) rotate(${needle + 90})`}>
        <path d="M -5 0 L 0 -98 L 5 0 Z" fill={C.vermWash} stroke={C.ink} strokeWidth={1.4} />
      </g>
      <circle cx={cx} cy={cy} r={9} fill={C.ochreWash} stroke={C.ink} strokeWidth={1.6} />
      <text x={cx} y={cy + 40} textAnchor="middle" fontFamily={mono} fontSize={11} fill={C.graphite}>
        llm · select one tool
      </text>
      {/* confidence against the gate */}
      <g transform={`translate(${cx - 140} 452)`}>
        <text x={0} y={-10} fontFamily={mono} fontSize={11} fill={C.graphite}>
          confidence
        </text>
        <rect x={0} y={0} width={280} height={14} rx={7} fill={C.paper} stroke={C.ink} strokeWidth={1.2} />
        <rect x={0} y={0} width={280 * conf} height={14} rx={7} fill={conf > 0.7 ? C.sapWash : C.ochreWash} />
        <line x1={196} y1={-6} x2={196} y2={20} stroke={C.ink} strokeWidth={1.6} strokeDasharray="3 3" />
        <text x={196} y={34} textAnchor="middle" fontFamily={mono} fontSize={10} fill={C.ink}>
          gate
        </text>
        <text x={280} y={60} textAnchor="end" fontFamily={mono} fontSize={12} fill={C.sap} opacity={conf > 0.7 ? 1 : 0}>
          ✓ gate passed
        </text>
      </g>
    </g>
  )
}

function Ask() {
  const f = useCurrentFrame()
  const cx = panelX(2) + PANEL_W / 2
  const card = prog(f, 6, 22, ease.out)
  const finger = prog(f, 40, 60, ease.inOut)
  const tapped = f >= 62
  return (
    <g>
      <g filter={`url(#${ID}-rough)`}>
        <rect x={cx - 96} y={186} width={192} height={370} rx={24} fill={C.ink} />
        <rect x={cx - 86} y={204} width={172} height={334} rx={14} fill={C.paper2} />
      </g>
      <text x={cx - 74} y={228} fontFamily={mono} fontSize={10.5} fill={C.graphite}>
        #incidents
      </text>
      <g opacity={card} transform={`translate(0 ${(1 - card) * 14})`}>
        <rect x={cx - 78} y={242} width={156} height={172} rx={8} fill={C.paper} stroke={C.ink} strokeWidth={1.2} />
        <rect x={cx - 78} y={242} width={5} height={172} fill={C.ochreWash} />
        <text x={cx - 64} y={264} fontFamily={serif} fontSize={14} fill={C.ink}>
          aegis-observe
        </text>
        <text x={cx - 64} y={284} fontFamily={sans} fontSize={11.5} fill={C.vermilion}>
          fraud-detection-api
        </text>
        <text x={cx - 64} y={300} fontFamily={sans} fontSize={11.5} fill={C.vermilion}>
          504 SLO breach
        </text>
        <text x={cx - 64} y={324} fontFamily={sans} fontSize={11.5} fill={C.ink}>
          Proposed:
        </text>
        <text x={cx - 64} y={340} fontFamily={sans} fontSize={11.5} fill={C.ink}>
          patch the manifest
        </text>
        {['Approve', 'PR', 'Reject'].map((b, k) => {
          const on = b === 'PR' && tapped
          const w = [58, 32, 50][k]
          const bx = cx - 64 + [0, 62, 98][k]
          return (
            <g key={b}>
              <rect x={bx} y={362} width={w} height={26} rx={5} fill={on ? C.ultra : C.paper} stroke={C.ink} strokeWidth={1.2} />
              <text x={bx + w / 2} y={379} textAnchor="middle" fontFamily={sans} fontSize={11} fill={on ? C.paper : C.ink}>
                {b}
              </text>
            </g>
          )
        })}
      </g>
      {/* the lock that holds the incident while the card waits */}
      <g transform={`translate(${cx} 452)`} opacity={card}>
        <rect x={-9} y={-2} width={18} height={14} rx={2} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.3} />
        <path d="M -5 -2 L -5 -7 A 5 5 0 0 1 5 -7 L 5 -2" fill="none" stroke={C.ink} strokeWidth={1.6} />
        <text y={34} textAnchor="middle" fontFamily={mono} fontSize={10} fill={C.graphite}>
          incident locked
        </text>
      </g>
      {/* the human's finger */}
      <g transform={`translate(${lerp(cx + 150, cx - 12, finger)} ${lerp(560, 384, finger)}) scale(${f >= 60 && f < 66 ? 0.86 : 1})`} opacity={f >= 40 && f < 80 ? 1 : 0}>
        <ellipse rx={13} ry={17} fill="#ecc9a6" stroke={C.ink} strokeWidth={1.6} />
        <path d="M -8 -6 q 8 -6 16 0" fill="none" stroke={C.ink} strokeWidth={1} />
      </g>
      <g opacity={prog(f, 66, 74)}>
        <rect x={cx - 92} y={508} width={184} height={26} rx={13} fill={C.ultraSoft} stroke={C.ultra} strokeWidth={1.2} />
        <text x={cx} y={525} textAnchor="middle" fontFamily={mono} fontSize={11} fill={C.ultra}>
          human in the loop: PR
        </text>
      </g>
    </g>
  )
}

function Fix() {
  const f = useCurrentFrame()
  const x0 = panelX(3) + 30
  const card = prog(f, 8, 52, ease.inOut)
  const merged = f >= 54
  const sync = interpolate(f, [56, 96], [0, 540], clamp)
  // the card rides the branch: out of main, along, back in
  const bx = lerp(x0 + 60, x0 + 250, card)
  const by = 250 - Math.sin(card * Math.PI) * 44
  return (
    <g>
      <line x1={x0 - 6} y1={260} x2={x0 + 326} y2={260} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d={`M ${x0 + 60} 260 C ${x0 + 90} 206, ${x0 + 220} 206, ${x0 + 250} 260`} fill="none" stroke={C.ultra} strokeWidth={2.4} strokeDasharray="5 4" />
      {[0, 60, 130, 250, 310].map((dx) => (
        <circle key={dx} cx={x0 + dx} cy={260} r={dx === 250 ? (merged ? 10 : 7) : 7} fill={dx === 250 && merged ? C.sapWash : C.paper} stroke={C.ink} strokeWidth={1.6} />
      ))}
      <text x={x0 - 6} y={288} fontFamily={mono} fontSize={10.5} fill={C.graphite}>
        main
      </text>
      <g transform={`translate(${bx} ${by - 44})`} opacity={merged ? 1 - prog(f, 54, 60) : card > 0 ? 1 : 0.9}>
        <rect x={-66} y={-30} width={132} height={60} rx={6} fill={C.paper} stroke={C.ultra} strokeWidth={1.6} />
        <text x={-56} y={-12} fontFamily={mono} fontSize={10.5} fill={C.ultra}>
          PR · patch manifest
        </text>
        {[0, 1, 2].map((k) => (
          <line key={k} x1={-56} y1={2 + k * 9} x2={[40, 52, 28][k]} y2={2 + k * 9} stroke={C.faint} strokeWidth={1.4} />
        ))}
        <text x={-56} y={34 + 10} fontFamily={mono} fontSize={9} fill={C.graphite}>
          reasoning attached
        </text>
      </g>
      {/* argocd syncs the cluster */}
      <g transform={`translate(${x0 + 60} 390)`} opacity={prog(f, 54, 62)}>
        <g style={{ rotate: `${sync}deg` }}>
          <path d="M -22 0 A 22 22 0 0 1 18 -12" fill="none" stroke={C.ink} strokeWidth={2.4} />
          <path d="M 18 -12 l -2 -9 l 9 5 Z" fill={C.ink} />
          <path d="M 22 0 A 22 22 0 0 1 -18 12" fill="none" stroke={C.ink} strokeWidth={2.4} />
          <path d="M -18 12 l 2 9 l -9 -5 Z" fill={C.ink} />
        </g>
        <text y={46} textAnchor="middle" fontFamily={mono} fontSize={10.5} fill={C.graphite}>
          argocd sync
        </text>
      </g>
      {/* the cluster's ship receives the patched container */}
      <g transform={`translate(${x0 + 140} 360)`}>
        <path d="M0 60 L 170 60 L 160 88 L 12 88 Z" fill={C.hull} stroke={C.ink} strokeWidth={1.8} />
        <Box id={ID} x={14} y={34} w={46} h={26} fill={C.ultraSoft} />
        <Box id={ID} x={62} y={34} w={46} h={26} fill={merged && f > 80 ? C.sapSoft : C.vermSoft} />
        <Box id={ID} x={110} y={34} w={46} h={26} fill={C.ochreSoft} />
        <g transform="translate(152 44)">
          <Helm r={7} />
        </g>
        {merged && f > 80 && <path d="M 76 20 l 5 5 l 10 -11" fill="none" stroke={C.sap} strokeWidth={2.6} />}
      </g>
    </g>
  )
}

const SPANS = [
  { name: 'aegis.incident', x: 0, w: 1 },
  { name: 'signoz.mcp.search_logs', x: 0.02, w: 0.18 },
  { name: 'llm.select_tool · tokens', x: 0.22, w: 0.2 },
  { name: 'slack.approval', x: 0.44, w: 0.3 },
  { name: 'gitops.pull_request', x: 0.76, w: 0.22 },
]
function Verify() {
  const f = useCurrentFrame()
  const x0 = panelX(4) + 30
  const recover = prog(f, 0, 36, ease.inOut)
  return (
    <g>
      <Chart x={x0} y={320} drawn={1} spike={1 - recover} tone={recover > 0.6 ? C.sap : C.ink} />
      <text x={x0 - 6} y={372} fontFamily={mono} fontSize={11} fill={C.ultra}>
        agent trace · opentelemetry
      </text>
      {SPANS.map((s, k) => {
        const grow = prog(f, 30 + k * 8, 44 + k * 8, ease.out)
        return (
          <g key={s.name}>
            <rect x={x0 + s.x * 300} y={386 + k * 30} width={Math.max(2, s.w * 300 * grow)} height={18} rx={3} fill={k === 2 ? C.ochreSoft : C.ultraSoft} stroke={k === 2 ? C.ochre : C.ultra} strokeWidth={1} />
            <text x={x0 + s.x * 300 + 4} y={399 + k * 30} fontFamily={mono} fontSize={10} fill={C.ink} opacity={grow}>
              {s.name}
            </text>
          </g>
        )
      })}
      <g opacity={prog(f, 84, 94)} transform={`translate(${x0 + 30} 546)`}>
        <rect x={0} y={0} width={262} height={28} rx={14} fill={C.ochreSoft} stroke={C.ochre} strokeWidth={1.3} />
        <text x={131} y={19} textAnchor="middle" fontFamily={mono} fontSize={11.5} fill={C.ochre}>
          ★ 1st place · Agents of SigNoz
        </text>
      </g>
    </g>
  )
}

export const Loop: React.FC<{ viewWidth: number }> = ({ viewWidth }) => {
  const f = useCurrentFrame()
  const stage = Math.min(4, Math.floor(f / STAGE))
  // hold on each panel, travel between them in the last fifth of a stage
  const centres = [0, 1, 2, 3, 4].map((i) => panelX(i) + PANEL_W / 2)
  const keysF: number[] = []
  const keysX: number[] = []
  centres.forEach((c, i) => {
    keysF.push(i * STAGE + (i ? 12 : 0), i * STAGE + 84)
    keysX.push(c, c)
  })
  const focus = interpolate(f, keysF, keysX, { ...clamp, easing: ease.inOut })
  const camera = Math.min(0, Math.max(viewWidth - LOOP_WORLD, viewWidth / 2 - focus))
  const activity = (i: number) => (i === stage ? 1 : 0)

  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${viewWidth} 620`} width="100%" height="100%" style={{ overflow: 'hidden' }}>
        <Defs id={ID} f={f} />
        <g transform={`translate(${camera} 0)`}>
          <g filter={`url(#${ID}-wash)`}>
            <ellipse cx={focus} cy={320} rx={260} ry={250} fill={C.ultraWash} opacity={0.18} />
          </g>
          {/* the thread that joins the panels: the loop itself */}
          <path d={`M ${panelX(0) + PANEL_W} 314 L ${panelX(4)} 314`} stroke={C.rule} strokeWidth={2} strokeDasharray="2 6" />
          <line x1={panelX(0) + PANEL_W} y1={314} x2={lerp(panelX(0) + PANEL_W, panelX(4), prog(f, 90, 420))} y2={314} stroke={C.ultra} strokeWidth={2} />
          {[0, 1, 2, 3, 4].map((i) => (
            <PanelFrame key={i} i={i} active={activity(i)} />
          ))}
          <Sequence from={0} durationInFrames={STAGE * 5} layout="none" name="Detect">
            <Detect />
          </Sequence>
          <Sequence from={STAGE} durationInFrames={STAGE * 4} layout="none" name="Decide">
            <Decide />
          </Sequence>
          <Sequence from={STAGE * 2} durationInFrames={STAGE * 3} layout="none" name="Ask">
            <Ask />
          </Sequence>
          <Sequence from={STAGE * 3} durationInFrames={STAGE * 2} layout="none" name="Fix">
            <Fix />
          </Sequence>
          <Sequence from={STAGE * 4} durationInFrames={STAGE} layout="none" name="Verify">
            <Verify />
          </Sequence>
        </g>
      </svg>
    </AbsoluteFill>
  )
}
