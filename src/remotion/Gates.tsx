import { useCurrentFrame } from 'remotion'
import { C, Check, Mono, Pill, Stage, prog, type Tone } from './kit'

// Zero-trust DevSecOps: the five Azure Pipelines stages with their measured
// durations. Trivy catches two CRITICAL CVEs mid-build; they get patched and
// the release goes out. The clock ends on the real 32m 52s.

const STAGES = [
  { name: 'Security gates', tools: 'gitleaks · checkov', secs: 266, time: '4m 26s' },
  { name: 'App quality', tools: 'backend + frontend', secs: 189, time: '3m 09s' },
  { name: 'Build factory', tools: 'docker · trivy · sbom', secs: 623, time: '10m 23s' },
  { name: 'Delivery', tools: 'aks rollout', secs: 132, time: '2m 12s' },
  { name: 'Verification', tools: 'smoke · owasp zap', secs: 399, time: '6m 39s' },
]
const TOTAL = 1972 // 32m 52s, commit to live, queueing included
const SUM = STAGES.reduce((a, s) => a + s.secs, 0)
const START = 40
const END = 560

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function Gates() {
  const f = useCurrentFrame()
  const t = prog(f, START, END, (x) => x)
  let acc = 0

  return (
    <Stage>
      <text x={40} y={104} fontFamily="inherit" fontSize={72} fontWeight={700} fill={t >= 1 ? C.ok : C.text} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {clock(t * TOTAL)}
      </text>
      <Mono x={44} y={140} text="commit → live on AKS" size={18} fill={C.muted} />
      <Pill x={760} y={62} text={t >= 1 ? 'released' : t > 0 ? 'running' : 'queued'} tone={t >= 1 ? 'ok' : t > 0 ? 'run' : 'idle'} anchor="end" />

      {STAGES.map((s, i) => {
        const a = acc / SUM
        acc += s.secs
        const b = acc / SUM
        const local = Math.max(0, Math.min(1, (t - a) / (b - a)))
        const build = i === 2
        const cve = build && local > 0.5 && local < 0.85
        const patched = build && local >= 0.85
        const tone: Tone = local >= 1 ? 'ok' : cve ? 'crit' : local > 0 ? 'run' : 'idle'
        const col = tone === 'ok' ? C.ok : tone === 'crit' ? C.crit : tone === 'run' ? C.accent : C.line2
        const y = 176 + i * 112
        const sub = cve ? 'trivy: 2 CRITICAL · h11, httpx' : patched && local < 1 ? 'patched → 0 CRITICAL' : build && local >= 1 ? '2 CVEs fixed · SBOM ×2' : s.tools
        return (
          <g key={s.name} transform={`translate(40 ${y})`}>
            <rect width={720} height={96} rx={14} fill={tone === 'crit' ? C.critSoft : C.panel} stroke={col} strokeWidth={tone === 'idle' ? 1.5 : 2} />
            <rect x={0} y={90} width={720 * local} height={6} rx={3} fill={col} />
            <Mono x={24} y={38} text={`0${i + 1}`} size={18} fill={C.dim} />
            <text x={70} y={40} fontSize={25} fontWeight={600} fill={tone === 'idle' ? C.muted : C.text}>
              {s.name}
            </text>
            <Mono x={70} y={72} text={sub} size={18} fill={tone === 'crit' ? C.crit : tone === 'idle' ? C.dim : C.muted} />
            {local >= 1 ? (
              <>
                <Mono x={650} y={58} text={s.time} size={20} fill={C.text} anchor="end" />
                <Check x={684} y={50} />
              </>
            ) : (
              local > 0 && <circle cx={684} cy={50} r={8} fill="none" stroke={col} strokeWidth={3} strokeDasharray={`${20 * local + 5} 60`} transform={`rotate(${f * 6} 684 50)`} />
            )}
          </g>
        )
      })}

      <Mono x={400} y={776} text="secrets injected at runtime · key vault csi" size={17} fill={C.ok} anchor="middle" opacity={prog(f, 560, 590)} />
    </Stage>
  )
}
