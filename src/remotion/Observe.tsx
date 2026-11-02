import { useCurrentFrame } from 'remotion'
import { C, Mono, Node, Panel, Pill, Stage, Wire, along, prog, type Tone } from './kit'

// Aegis Observe: a 504 spike in SigNoz, the agent picks a fix, a human
// clicks PR in Slack, ArgoCD syncs, latency drops back under the SLO.

const CH = { x: 70, y: 110, w: 660, h: 150 } // chart area, absolute
const SPIKE = [0.2, 0.82] // spike span as a fraction of the chart

const lat = (x: number) => {
  const up = Math.min(1, Math.max(0, (x - SPIKE[0]) / 0.05)) * Math.min(1, Math.max(0, (SPIKE[1] - x) / 0.05))
  const noise = Math.sin(x * 61) * 0.05 + Math.sin(x * 23 + 1) * 0.04
  return 0.22 + noise + up * (0.52 + Math.sin(x * 37) * 0.08)
}

const R1 = 330
const R2 = 560
const COL = [40, 295, 550]

export function Observe() {
  const f = useCurrentFrame()
  const reveal = Math.min(1, f / 560)
  const pts: [number, number][] = []
  for (let i = 0; i <= 120 * reveal; i++) {
    const x = i / 120
    pts.push([CH.x + x * CH.w, CH.y + CH.h - lat(x) * CH.h])
  }
  const d = pts.length > 1 ? 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L') : ''
  const sloY = CH.y + CH.h * (1 - 0.5)
  const breached = reveal > SPIKE[0] + 0.03 && reveal < SPIKE[1] + 0.02
  const healed = reveal >= SPIKE[1] + 0.02

  // who is lit, and when
  const at = (a: number, b: number): Tone => (f >= b ? 'ok' : f >= a ? 'run' : 'idle')
  const signoz = at(130, 190)
  const agent = at(220, 280)
  const slack = at(300, 360)
  const pr = at(390, 440)
  const argo = at(450, 490)
  const api: Tone = healed ? 'ok' : breached ? 'crit' : 'idle'

  const clickPR = f >= 340
  const [cx, cy] = along([[720, 530], [652, 466]], prog(f, 312, 338))

  return (
    <Stage>
      <Panel x={40} y={40} w={720} h={250} title="signoz · fraud-api · p99" tone={breached ? 'crit' : undefined} />
      <line x1={CH.x} x2={CH.x + CH.w} y1={sloY} y2={sloY} stroke={C.warn} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="6 8" />
      <Mono x={CH.x + CH.w} y={sloY - 10} text="SLO" size={16} fill={C.warn} anchor="end" />
      <defs>
        <clipPath id="obs-spike">
          <rect x={CH.x + CH.w * (SPIKE[0] + 0.02)} y={0} width={CH.w * (SPIKE[1] - SPIKE[0] - 0.02)} height={800} />
        </clipPath>
      </defs>
      <path d={d} fill="none" stroke={C.info} strokeWidth={3} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={C.crit} strokeWidth={3.4} strokeLinejoin="round" clipPath="url(#obs-spike)" />
      {pts.length > 1 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={6} fill={breached ? C.crit : healed ? C.ok : C.info} />}
      <Pill x={744} y={44} text={healed ? 'recovered' : breached ? '504 · SLO breach' : 'all quiet'} tone={healed ? 'ok' : breached ? 'crit' : 'info'} anchor="end" />

      <Node x={COL[0]} y={R1} w={210} h={96} title="SigNoz MCP" sub={signoz === 'idle' ? 'listening' : 'search "504"'} tone={signoz} />
      <Node x={COL[1]} y={R1} w={210} h={96} title="Aegis agent" sub={agent === 'idle' ? 'idle' : agent === 'run' ? 'LLM → 1 tool' : 'gate passed'} tone={agent} />
      <Node x={COL[2]} y={R1} w={210} h={96} title="Slack" sub={slack === 'idle' ? '#incidents' : clickPR ? 'human: PR' : 'needs a yes'} tone={slack} />
      <Node x={COL[2]} y={R2} w={210} h={96} title="GitHub PR" sub={pr === 'idle' ? '—' : pr === 'run' ? 'opened + why' : 'merged'} tone={pr} />
      <Node x={COL[1]} y={R2} w={210} h={96} title="ArgoCD" sub={argo === 'idle' ? 'in sync' : argo === 'run' ? 'syncing' : 'synced'} tone={argo} />
      <Node x={COL[0]} y={R2} w={210} h={96} title="fraud-api" sub={api === 'ok' ? 'healthy' : api === 'crit' ? '504s' : 'serving'} tone={api} />

      <Wire d={`M250 ${R1 + 48} L295 ${R1 + 48}`} t={prog(f, 190, 220)} tone="ok" />
      <Wire d={`M505 ${R1 + 48} L550 ${R1 + 48}`} t={prog(f, 280, 300)} tone="ok" />
      <Wire d={`M760 ${R1 + 48} L780 ${R1 + 48} L780 ${R2 + 48} L760 ${R2 + 48}`} t={prog(f, 360, 390)} tone="ok" />
      <Wire d={`M550 ${R2 + 48} L505 ${R2 + 48}`} t={prog(f, 440, 450)} tone="ok" />
      <Wire d={`M295 ${R2 + 48} L250 ${R2 + 48}`} t={prog(f, 490, 505)} tone="ok" />
      <Wire d={`M145 ${R2} L145 ${R1 + 96}`} t={1} tone={api === 'crit' ? 'crit' : 'info'} dashed />
      <Mono x={158} y={R1 + 140} text="OTLP" size={16} fill={C.dim} />

      {/* the three Slack buttons, then the human's click */}
      <g opacity={prog(f, 300, 320)}>
        {[
          ['Approve', 550, 84],
          ['PR', 634, 52],
          ['Reject', 686, 74],
        ].map(([label, x, w]) => {
          const on = label === 'PR' && clickPR
          return (
            <g key={label as string} transform={`translate(${x} 450)`}>
              <rect width={(w as number) - 6} height={36} rx={8} fill={on ? C.accent : C.panel2} stroke={on ? C.accent : C.line2} strokeWidth={1.5} />
              <text x={((w as number) - 6) / 2} y={24} textAnchor="middle" fontSize={16} fontWeight={600} fill={on ? C.bg : C.muted}>
                {label}
              </text>
            </g>
          )
        })}
        {f >= 312 && f < 380 && <path d="M0 0 L0 26 L7 19 L12 30 L17 28 L12 17 L21 17 Z" transform={`translate(${cx} ${cy})`} fill={C.text} stroke={C.bg} strokeWidth={1.5} />}
      </g>

      <Pill x={400} y={712} text="span exported · gen_ai token cost" tone="info" anchor="middle" opacity={prog(f, 505, 530)} />
      <Pill x={400} y={712} text="watching the 504 rate" tone="idle" anchor="middle" opacity={1 - prog(f, 120, 140)} />
    </Stage>
  )
}
