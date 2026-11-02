import { useCurrentFrame } from 'remotion'
import { C, Mono, Node, Packet, Panel, Pill, Stage, Wire, along, lerp, prog, type Tone } from './kit'

// Hero: one `git push` travels the pipeline and rolls out to a cluster,
// pod by pod, with traffic shifting from v1 to v2. Frame 0 is a calm,
// complete picture so the page looks finished before anyone scrolls.

const STAGES = [
  { title: 'lint', sub: 'ruff' },
  { title: 'scan', sub: 'trivy' },
  { title: 'build', sub: 'docker' },
  { title: 'sign', sub: 'sbom' },
  { title: 'deploy', sub: 'argocd' },
]
const SX = (i: number) => 40 + i * 149
const ROW_Y = 214
const RUN = [70, 330] // the packet's trip along the pipeline
const ROLL = [350, 540] // the rollout

export function Ship() {
  const f = useCurrentFrame()
  const typed = prog(f, 4, 60) * 24
  const trip = prog(f, RUN[0], RUN[1])
  const [px, py] = along([[40, ROW_Y + 46], [760, ROW_Y + 46]], trip)
  const roll = prog(f, ROLL[0], ROLL[1])
  const live = prog(f, 520, 540)

  return (
    <Stage>
      <Panel x={40} y={40} w={720} h={124} title="~/payments-api  zsh">
        <Mono x={24} y={92} text="$ git push origin main" chars={typed} size={24} fill={C.text} />
        {typed < 24 && f % 40 < 24 && <rect x={24 + typed * 14.4} y={72} width={12} height={26} fill={C.accent} />}
        <Mono x={696} y={92} text={f < RUN[0] ? '' : f < RUN[1] ? 'pipeline running' : 'shipped'} size={19} fill={f < RUN[1] ? C.accent : C.ok} anchor="end" />
      </Panel>

      {STAGES.map((s, i) => {
        const a = (SX(i) - 40) / 720
        const b = (SX(i) + 124 - 40) / 720
        const tone: Tone = trip >= b ? 'ok' : trip > a ? 'run' : 'idle'
        return (
          <g key={s.title}>
            {i > 0 && <Wire d={`M${SX(i) - 25} ${ROW_Y + 46} L${SX(i)} ${ROW_Y + 46}`} t={trip > a ? 1 : 0} tone="ok" />}
            <Node x={SX(i)} y={ROW_Y} w={124} h={92} title={s.title} sub={s.sub} tone={tone} align="center" />
          </g>
        )
      })}
      {trip > 0 && trip < 1 && <Packet x={px} y={py} />}

      <Wire d={`M${SX(4) + 62} ${ROW_Y + 92} L${SX(4) + 62} 390`} t={prog(f, RUN[1] - 10, ROLL[0])} tone="ok" />

      <Panel x={40} y={390} w={720} h={300} title="k8s · prod · payments-api">
        {[0, 1, 2].map((n) => (
          <g key={n} transform={`translate(${22 + n * 230} 66)`}>
            <rect width={216} height={150} rx={12} fill={C.panel2} stroke={C.line} strokeWidth={1.5} />
            <Mono x={14} y={30} text={`node-${'abc'[n]}`} size={17} fill={C.dim} />
            {Array.from({ length: 6 }, (_, k) => {
              const order = k * 3 + n // roll across nodes, not node by node
              const q = roll * 20 - order
              const v2 = q > 0
              const ready = q > 1.6
              const tone: Tone = ready ? 'ok' : v2 ? 'run' : 'info'
              const col = tone === 'ok' ? C.ok : tone === 'run' ? C.accent : C.info
              return (
                <g key={k} transform={`translate(${14 + (k % 3) * 66} ${46 + Math.floor(k / 3) * 50})`}>
                  <rect width={56} height={38} rx={8} fill={tone === 'ok' ? C.okSoft : tone === 'run' ? C.accentSoft : C.infoSoft} stroke={col} strokeWidth={1.6} />
                  <text x={28} y={25} textAnchor="middle" fontFamily="inherit" fontSize={17} fontWeight={600} fill={col}>
                    {v2 ? 'v2' : 'v1'}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
        <Mono x={22} y={256} text="traffic" size={17} fill={C.dim} />
        <rect x={110} y={240} width={588} height={22} rx={11} fill={C.infoSoft} stroke={C.info} strokeWidth={1.4} />
        {roll > 0 && <rect x={110} y={240} width={lerp(22, 588, roll)} height={22} rx={11} fill={C.ok} />}
        <Mono x={698} y={290} text={`v2 ${Math.round(roll * 100)}% · v1 ${100 - Math.round(roll * 100)}%`} size={17} fill={C.muted} anchor="end" />
      </Panel>

      <Pill x={400} y={724} text="prod healthy · v1 · 0 errors" tone="info" anchor="middle" opacity={1 - live} />
      <Pill x={400} y={724} text="prod healthy · v2 · zero downtime" tone="ok" anchor="middle" opacity={live} />
    </Stage>
  )
}
