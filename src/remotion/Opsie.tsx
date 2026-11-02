import { useCurrentFrame } from 'remotion'
import { C, Check, Mono, Panel, Stage, lerp, prog } from './kit'

// OPSIE: a developer fills one Backstage form, the pipeline does the rest,
// and the measured before/after times race underneath.

const FIELDS = [
  ['template', 'AWS · S3 bucket'],
  ['name', 'payments-artifacts'],
  ['owner', 'team-payments'],
  ['cost cap', '$25 / month'],
]
const LOG = ['oidc keyless auth', 'terraform plan', 'infracost gate', 'terraform apply', 'catalog register']
export const RACE = [
  { what: 'S3 bucket', before: 45, after: 8 },
  { what: 'VPC + subnets', before: 60, after: 12 },
  { what: 'App on K8s', before: 30, after: 10 },
]
const BAR = 440 // px for 60 minutes

export function Opsie() {
  const f = useCurrentFrame()
  const pressed = f >= 170
  const [cx, cy] = [lerp(380, 330, prog(f, 140, 166)), lerp(340, 300, prog(f, 140, 166))]

  return (
    <Stage>
      <Panel x={40} y={40} w={430} h={330} title="backstage · create">
        {FIELDS.map(([k, v], i) => {
          const typed = prog(f, 14 + i * 30, 40 + i * 30) * v.length
          return (
            <g key={k} transform={`translate(22 ${70 + i * 56})`}>
              <Mono x={0} y={24} text={k} size={16} fill={C.dim} />
              <rect x={110} y={0} width={276} height={38} rx={8} fill={C.panel2} stroke={typed > 0 && typed < v.length ? C.accent : C.line2} strokeWidth={1.5} />
              <Mono x={124} y={25} text={v} chars={typed} size={17} fill={C.text} />
            </g>
          )
        })}
        <g transform="translate(260 280)">
          <rect width={148} height={40} rx={10} fill={pressed ? C.ok : C.accent} transform={pressed && f < 180 ? 'translate(74 20) scale(0.94) translate(-74 -20)' : undefined} />
          <text x={74} y={27} textAnchor="middle" fontSize={19} fontWeight={700} fill={C.bg}>
            {pressed ? 'Created' : 'Create'}
          </text>
        </g>
      </Panel>
      {f >= 130 && f < 230 && <path d="M0 0 L0 26 L7 19 L12 30 L17 28 L12 17 L21 17 Z" transform={`translate(${cx + 40} ${cy + 40})`} fill={C.text} stroke={C.bg} strokeWidth={1.5} />}

      <Panel x={490} y={40} w={270} h={330} title="github actions">
        {LOG.map((line, i) => {
          const a = 190 + i * 38
          const on = prog(f, a, a + 14)
          const done = f >= a + 30
          return (
            <g key={line} transform={`translate(20 ${86 + i * 52})`} opacity={0.25 + on * 0.75}>
              {done ? <Check x={10} y={-6} s={0.9} /> : <circle cx={10} cy={-6} r={6} fill="none" stroke={on > 0 ? C.accent : C.line2} strokeWidth={2} />}
              <Mono x={30} y={0} text={line} size={17} fill={done ? C.text : C.muted} />
            </g>
          )
        })}
      </Panel>

      <Panel x={40} y={400} w={720} h={360} title="time to provision, measured">
        {RACE.map((r, i) => {
          const y = 80 + i * 92
          const old = prog(f, 10 + i * 12, 70 + i * 12) // the problem is on screen from the start
          const neu = prog(f, 450 + i * 14, 520 + i * 14)
          const cut = Math.round((1 - r.after / r.before) * 100)
          return (
            <g key={r.what} transform={`translate(24 ${y})`}>
              <text x={0} y={0} fontSize={21} fontWeight={600} fill={C.text}>
                {r.what}
              </text>
              <rect x={0} y={14} width={BAR * (r.before / 60) * old} height={18} rx={5} fill={C.line2} />
              <Mono x={BAR * (r.before / 60) * old + 10} y={29} text={old > 0.95 ? `${r.before}m by hand` : ''} size={16} fill={C.dim} />
              <rect x={0} y={38} width={Math.max(0, BAR * (r.after / 60) * neu)} height={18} rx={5} fill={C.accent} />
              <Mono x={BAR * (r.after / 60) * neu + 10} y={53} text={neu > 0.95 ? `${r.after}m with OPSIE` : ''} size={16} fill={C.accent} />
              <text x={672} y={44} textAnchor="end" fontSize={34} fontWeight={700} fill={C.ok} opacity={prog(f, 520 + i * 14, 545 + i * 14)}>
                −{cut}%
              </text>
            </g>
          )
        })}
      </Panel>
    </Stage>
  )
}
