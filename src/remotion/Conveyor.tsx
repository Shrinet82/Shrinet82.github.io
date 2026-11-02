import { AbsoluteFill, Interactive, interpolate, useCurrentFrame } from 'remotion'
import { pipeline } from '../content'
import { Box, C, Defs, Helm, WashLayer, clamp, ease, lerp, mono, osc, prog, seaPath, serif } from './kit'

// Plate II (zero-trust DevSecOps), true to the project README. One Docker
// image rides the belt through the five stages. Gitleaks and Checkov scan it
// in a light curtain (no secrets; 9 checks skipped). Probes run the backend
// tests and the frontend build. The build factory X-rays it with Trivy: two
// CRITICAL CVEs, h11 0.9.0 and httpx 0.13.3, are upgraded and re-scanned to
// zero, a CycloneDX SBOM prints and the image is pushed to ACR. The quay
// crane rolls it out to the AKS ship (two nodes); Key Vault hands it its
// secrets through CSI; OWASP ZAP probes it and the smoke test runs.
//
// 60 fps, timed in beats of 1/30 s (two frames each), 450 beats in all.

export const WORLD = 1600
export const CONVEYOR = { height: 540, fps: 60, durationInFrames: 900 }

// The pipeline clock: each stage ends at its measured cumulative time, with
// the queueing between stages (32m 52s total against 26m 49s of stages)
// spread evenly, so the clock reads 32m 52s exactly when verification ends.
export const CLOCK = { beats: [0, 110, 190, 300, 406, 446], secs: [0, 339, 600, 1296, 1500, 1972] }
export const pipelineSecs = (beat: number) => interpolate(beat, CLOCK.beats, CLOCK.secs, clamp)
const ID = 'cv'

const BELT_TOP = 330
const BOX = { w: 104, h: 50 }
const S1 = 250
const S2 = 530
const S3 = 830
const PICK = 1052
const TOWER = 1136
const SLOT = { x: 1408, y: 314 } // top-left of the empty slot on deck

// frame -> where the container is and what it is doing
const cxAt = (f: number) =>
  interpolate(f, [0, 25, 68, 110, 150, 190, 232, 300, 335, 372, 392], [104, 104, S1, S1, S2, S2, S3, S3, PICK, PICK, SLOT.x + BOX.w / 2], {
    ...clamp,
    easing: ease.inOut,
  })
const cyAt = (f: number) =>
  interpolate(f, [0, 25, 350, 372, 392, 406], [150, BELT_TOP - BOX.h / 2, BELT_TOP - BOX.h / 2, 150, 150, SLOT.y + BOX.h / 2], {
    ...clamp,
    easing: [ease.out, ease.inOut, ease.inOut, ease.inOut, ease.soft],
  })

const STAGES = [
  { at: 68, done: 110, x: S1 },
  { at: 150, done: 190, x: S2 },
  { at: 232, done: 300, x: S3 },
  { at: 335, done: 406, x: TOWER },
  { at: 406, done: 446, x: 1400 },
]

function Tag({ x, y, f, at, ok = true, children }: { x: number; y: number; f: number; at: number; ok?: boolean; children: string }) {
  const t = prog(f, at, at + 10, ease.out)
  const col = ok ? C.sap : C.vermilion
  return (
    <g opacity={t} transform={`translate(${x} ${y + (1 - t) * 10})`}>
      <rect width={children.length * 8 + 22} height={26} rx={13} fill={C.paper} stroke={col} strokeWidth={1.4} />
      <text x={11} y={17.5} fontFamily={mono} fontSize={14} fill={col}>
        {children}
      </text>
    </g>
  )
}

// 01: a walk-through scanner with a light curtain.
function ScannerArch({ f, active }: { f: number; active: boolean }) {
  const sweep = interpolate(f, [72, 100], [120, BELT_TOP], clamp)
  return (
    <g>
      <g filter={`url(#${ID}-rough)`}>
        <rect x={S1 - 88} y={96} width={176} height={36} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <rect x={S1 - 88} y={96} width={176} height={36} rx={6} fill={`url(#${ID}-hatch-light)`} />
        <rect x={S1 - 84} y={132} width={20} height={BELT_TOP - 132} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <rect x={S1 + 64} y={132} width={20} height={BELT_TOP - 132} fill={C.paper} stroke={C.ink} strokeWidth={2} />
      </g>
      <text x={S1} y={119} textAnchor="middle" fontFamily={mono} fontSize={13.5} letterSpacing={1.5} fill={C.ink}>
        SECRETS · IaC
      </text>
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={S1 - 74} cy={146 + i * 22} r={2.6} fill={active && Math.floor(f / 3 + i) % 3 === 0 ? C.ultra : C.rule} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={`r${i}`} cx={S1 + 74} cy={146 + i * 22} r={2.6} fill={active && Math.floor(f / 3 + i + 1) % 3 === 0 ? C.ultra : C.rule} />
      ))}
      {/* the light curtain */}
      <g opacity={active ? 1 : 0}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={S1 - 62 + i * 11.3} y1={134} x2={S1 - 62 + i * 11.3} y2={BELT_TOP} stroke={C.ultraWash} strokeWidth={1} opacity={0.5} />
        ))}
        <rect x={S1 - 64} y={sweep - 3} width={128} height={6} fill={C.ultra} opacity={0.55} />
      </g>
    </g>
  )
}

// 02: two probes come down and two gauges swing to green.
function TestRig({ f }: { f: number }) {
  const drop = interpolate(f, [150, 162, 184, 192], [0, 1, 1, 0], { ...clamp, easing: ease.inOut })
  const needle = (at: number) => interpolate(f, [at, at + 14], [-70, 58], { ...clamp, easing: ease.out }) + (f > at + 14 && f < 190 ? osc(f, 12) * 2 : 0)
  return (
    <g>
      <g filter={`url(#${ID}-rough)`}>
        <rect x={S2 - 100} y={92} width={200} height={20} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <line x1={S2 - 90} y1={112} x2={S2 - 90} y2={BELT_TOP} stroke={C.ink} strokeWidth={3} />
        <line x1={S2 + 90} y1={112} x2={S2 + 90} y2={BELT_TOP} stroke={C.ink} strokeWidth={3} />
      </g>
      {[-26, 26].map((dx) => (
        <g key={dx}>
          <line x1={S2 + dx} y1={112} x2={S2 + dx} y2={138 + drop * 118} stroke={C.ink} strokeWidth={2.4} />
          <rect x={S2 + dx - 7} y={134 + drop * 118} width={14} height={14} rx={3} fill={C.ochreWash} stroke={C.ink} strokeWidth={1.6} />
        </g>
      ))}
      {[
        { x: S2 - 58, label: 'backend', at: 158 },
        { x: S2 + 58, label: 'frontend', at: 170 },
      ].map((g) => (
        <g key={g.label} transform={`translate(${g.x} 62)`}>
          <path d="M-26 0 A 26 26 0 0 1 26 0 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.6} />
          <path d="M 8 -24.7 A 26 26 0 0 1 26 0 L 0 0 Z" fill={C.sapSoft} />
          <line x1={0} y1={0} x2={Math.sin((needle(g.at) * Math.PI) / 180) * 22} y2={-Math.cos((needle(g.at) * Math.PI) / 180) * 22} stroke={C.ink} strokeWidth={2} strokeLinecap="round" />
          <circle r={3} fill={C.ink} />
          <text y={-32} textAnchor="middle" fontFamily={mono} fontSize={13} fill={C.graphite}>
            {g.label}
          </text>
          <path d="M 30 -10 l 4 4 l 8 -9" fill="none" stroke={C.sap} strokeWidth={2.2} strokeLinecap="round" pathLength={1} strokeDasharray={`${prog(f, g.at + 16, g.at + 22)} 1`} />
        </g>
      ))}
    </g>
  )
}

// 03: the X-ray booth and its monitor. Trivy lists the image's layers, flags
// the dependencies, names the two CVEs, and shows them upgraded on the
// re-scan. Then the CycloneDX SBOM prints and the image goes to ACR.
const LAYERS = ['app code', 'dependencies', 'system libs', 'base image']
const CVES = [
  { pkg: 'h11', from: '0.9.0', to: '0.16.0', id: 'CVE-2025-43859' },
  { pkg: 'httpx', from: '0.13.3', to: '0.23.0', id: 'CVE-2021-41945' },
]
function BuildFactory({ f }: { f: number }) {
  const scan = interpolate(f, [236, 256], [0, 1], clamp)
  const flagged = f >= 256 && f < 282
  const rescan = interpolate(f, [272, 284], [0, 1], clamp)
  const fixed = f >= 284
  const paper = prog(f, 284, 304, ease.soft)
  const MX = S3 - 120
  return (
    <g>
      {/* the booth */}
      <g filter={`url(#${ID}-rough)`}>
        <rect x={S3 - 104} y={206} width={208} height={BELT_TOP - 206} fill={C.paper} stroke={C.ink} strokeWidth={2.2} opacity={0.35} />
        <rect x={S3 - 112} y={190} width={224} height={20} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <rect x={S3 - 112} y={210} width={14} height={BELT_TOP - 210} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        <rect x={S3 + 98} y={210} width={14} height={BELT_TOP - 210} fill={C.paper} stroke={C.ink} strokeWidth={2} />
      </g>
      <text x={S3} y={204} textAnchor="middle" fontFamily={mono} fontSize={12.5} letterSpacing={1.4} fill={C.ink}>
        BUILD · TRIVY · SBOM
      </text>
      {/* x-ray sweeps across the booth: the scan, then the re-scan */}
      {f >= 236 && f < 262 && <rect x={S3 - 98 + scan * 190} y={212} width={6} height={BELT_TOP - 214} fill={flagged ? C.vermWash : C.ultraWash} opacity={0.8} />}
      {rescan > 0 && rescan < 1 && <rect x={S3 - 98 + rescan * 190} y={212} width={6} height={BELT_TOP - 214} fill={C.sapWash} opacity={0.8} />}

      {/* the monitor on its arm */}
      <line x1={S3} y1={190} x2={S3} y2={176} stroke={C.ink} strokeWidth={3} />
      <g filter={`url(#${ID}-rough)`}>
        <rect x={MX} y={6} width={240} height={170} rx={8} fill={C.ink} />
        <rect x={MX + 8} y={14} width={224} height={154} rx={4} fill="#20283d" />
      </g>
      <text x={MX + 16} y={32} fontFamily={mono} fontSize={12.5} fill={f >= 300 ? C.sapWash : C.ultraSoft}>
        {f >= 300 ? '0 critical · pushed to acr ✓' : f >= 236 ? 'trivy image · backend' : 'docker build …'}
      </text>
      {LAYERS.map((l, i) => {
        const y = 42 + i * 22
        const isDeps = l === 'dependencies'
        const shown = prog(f, 238 + i * 4, 246 + i * 4)
        const bad = isDeps && flagged
        const good = fixed || (isDeps ? false : f >= 258)
        return (
          <g key={l} opacity={shown}>
            <rect x={MX + 16} y={y} width={208} height={18} rx={3} fill={bad ? C.vermWash : isDeps && fixed ? C.sapWash : '#34405e'} stroke={bad ? C.vermSoft : '#4c5b82'} />
            <text x={MX + 24} y={y + 13} fontFamily={mono} fontSize={12.5} fill={isDeps && fixed ? C.ink : C.paper}>
              {isDeps && fixed ? 'dependencies, upgraded' : l}
            </text>
            <text x={MX + 216} y={y + 13} textAnchor="end" fontFamily={mono} fontSize={12.5} fill={bad ? C.paper : C.sapSoft}>
              {bad ? '2 CRITICAL' : good ? 'ok' : ''}
            </text>
          </g>
        )
      })}
      {/* the two findings, then the same two upgraded */}
      {CVES.map((c, j) => {
        const show = prog(f, 258 + j * 4, 264 + j * 4)
        const up = f >= 276 + j * 3
        return (
          <text key={c.pkg} x={MX + 16} y={144 + j * 18} fontFamily={mono} fontSize={12} fill={up ? C.sapSoft : C.vermSoft} opacity={show} style={{ whiteSpace: 'pre' }}>
            {up ? `${c.pkg.padEnd(6)}${c.to.padEnd(8)}upgraded ✓` : `${c.pkg.padEnd(6)}${c.from.padEnd(8)}${c.id}`}
          </text>
        )
      })}

      {/* the SBOM, printing */}
      <g filter={`url(#${ID}-rough)`}>
        <rect x={S3 + 124} y={236} width={58} height={40} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={1.8} />
        <line x1={S3 + 132} y1={250} x2={S3 + 174} y2={250} stroke={C.ink} strokeWidth={2} />
      </g>
      <text x={S3 + 153} y={270} textAnchor="middle" fontFamily={mono} fontSize={10} fill={C.graphite}>
        cyclonedx
      </text>
      <g opacity={paper > 0 ? 1 : 0}>
        <path
          d={`M ${S3 + 134} 250 L ${S3 + 172} 250 L ${S3 + 172} ${250 - paper * 70} l -6 4 l -6 -4 l -6 4 l -6 -4 l -6 4 l -8 -4 Z`}
          fill="#fff"
          stroke={C.ink}
          strokeWidth={1.2}
        />
        <text x={S3 + 153} y={250 - paper * 70 + 16} textAnchor="middle" fontFamily={mono} fontSize={11} fill={C.ultra}>
          SBOM
        </text>
        {[0, 1, 2].map((i) => (
          <line key={i} x1={S3 + 140} y1={250 - paper * 70 + 26 + i * 9} x2={S3 + 166} y2={250 - paper * 70 + 26 + i * 9} stroke={C.faint} strokeWidth={1} opacity={paper > 0.4 + i * 0.15 ? 1 : 0} />
        ))}
      </g>
    </g>
  )
}

// 05: OWASP ZAP probes the running app; the funnel runs the smoke test.
function Verification({ t: f }: { t: number }) {
  if (f < 0 || f > 44) return null
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const t = prog(f, i * 5, i * 5 + 12, ease.in)
        const back = prog(f, i * 5 + 12, i * 5 + 22, ease.out)
        const sx = 1320 + i * 30
        const x = lerp(lerp(sx, SLOT.x + 20 + i * 20, t), sx + 10, back)
        const y = lerp(lerp(150, SLOT.y - 2, t), 180, back)
        return (
          <g key={i} opacity={t > 0 && back < 1 ? 1 : 0}>
            <path d={`M ${x} ${y} l -5 -12 l 10 0 Z`} fill={C.ochreWash} stroke={C.ink} strokeWidth={1.2} />
          </g>
        )
      })}
      {[0, 1, 2].map((i) => {
        const t = prog(f, 10 + i * 6, 38 + i * 6, ease.soft)
        return <circle key={`p${i}`} cx={1540 + i * 6} cy={262 - t * 70} r={7 + t * 12} fill={C.rule} opacity={t > 0 ? (1 - t) * 0.9 : 0} />
      })}
    </g>
  )
}

const WASHES = [
  { cx: 560, cy: 220, rx: 520, ry: 150, fill: C.ochreWash, opacity: 0.16 },
  { cx: 1390, cy: 400, rx: 210, ry: 70, fill: C.ultraWash, opacity: 0.35 },
]

export const Conveyor: React.FC<{ viewWidth: number }> = ({ viewWidth }) => {
  const f = useCurrentFrame() / 2 // in beats
  const cx = cxAt(f)
  const cy = cyAt(f)
  const onHook = f >= 348 && f <= 406
  const trolley = onHook ? cx : f < 348 ? PICK : interpolate(f, [406, 430], [SLOT.x + BOX.w / 2, PICK], { ...clamp, easing: ease.inOut })
  const hookY = onHook ? cy - BOX.h / 2 : f < 348 ? interpolate(f, [330, 348], [150, BELT_TOP - BOX.h], { ...clamp, easing: ease.inOut }) : interpolate(f, [406, 424], [SLOT.y, 150], { ...clamp, easing: ease.inOut })
  const flagged = f >= 256 && f < 284
  const patched = f >= 284
  const inBooth = f >= 226 && f < 306
  const flag = prog(f, 424, 444, ease.out)

  const active = (i: number) => f >= STAGES[i].at && f < STAGES[i].done
  const done = (i: number) => f >= STAGES[i].done
  const camera = viewWidth >= WORLD ? 0 : -Math.min(Math.max(cx - viewWidth / 2, 0), WORLD - viewWidth)

  return (
    <AbsoluteFill>
      {/* washes: the shop floor warm, the harbour cool */}
      <WashLayer blobs={WASHES} world={{ w: WORLD, h: 540 }} viewWidth={viewWidth} camera={camera} />
      <svg viewBox={`0 0 ${viewWidth} 540`} width="100%" height="100%" style={{ overflow: 'hidden', position: 'absolute' }}>
        <Defs id={ID} f={f} />
        <g transform={`translate(${camera} 0)`}>

          {/* harbour water */}
          <g clipPath={`url(#${ID}-harbour)`}>
            <path d={seaPath(WORLD, 404, 6, 80, 540)} fill={C.ultraSoft} stroke={C.ultra} strokeWidth={1.4} style={{ translate: `${-(f % 80)}px 0px` }} />
          </g>
          <clipPath id={`${ID}-harbour`}>
            <rect x={1170} y={380} width={440} height={160} />
          </clipPath>

          {/* belt: top, face, slats that move with the load, legs */}
          <g filter={`url(#${ID}-rough)`}>
            <rect x={40} y={BELT_TOP} width={1060} height={12} fill={C.paper} stroke={C.ink} strokeWidth={2} />
            <rect x={40} y={BELT_TOP + 12} width={1060} height={16} fill={C.paper} stroke={C.ink} strokeWidth={2} />
            <rect x={40} y={BELT_TOP + 12} width={1060} height={16} fill={`url(#${ID}-hatch)`} />
            {[70, 330, 610, 890, 1080].map((x) => (
              <line key={x} x1={x} y1={BELT_TOP + 28} x2={x} y2={436} stroke={C.ink} strokeWidth={2.4} />
            ))}
            <line x1={20} y1={436} x2={1180} y2={436} stroke={C.ink} strokeWidth={2} />
          </g>
          {Array.from({ length: 44 }, (_, i) => {
            const x = 44 + ((((i * 24 + cx * 0.999) % 1056) + 1056) % 1056)
            return <line key={i} x1={x} y1={BELT_TOP + 2} x2={x - 4} y2={BELT_TOP + 10} stroke={C.ink} strokeWidth={1} opacity={0.45} />
          })}
          {Array.from({ length: 18 }, (_, i) => 60 + i * 60).map((x) => (
            <circle key={x} cx={x} cy={BELT_TOP + 20} r={4} fill={C.paper} stroke={C.ink} strokeWidth={1.2} />
          ))}

          {/* stations */}
          <ScannerArch f={f} active={active(0)} />
          <Tag x={S1 - 120} y={52} f={f} at={96}>
            gitleaks ✓ 0 secrets
          </Tag>
          <Tag x={S1 - 120} y={18} f={f} at={104}>
            checkov ✓ 9 skipped
          </Tag>

          <TestRig f={f} />

          {/* the container, drawn before the booth so it sits inside it */}
          {!onHook && f < 406 && (
            <Interactive.G name="Image">
              <Box id={ID} x={cx - BOX.w / 2} y={cy - BOX.h / 2} w={BOX.w} h={BOX.h} fill={flagged ? C.vermSoft : patched ? C.sapSoft : C.ochreSoft} whale />
              {[0, 1, 2].map((i) => (
                <g key={i} opacity={done(i) ? 1 : 0}>
                  <circle cx={cx - 22 + i * 22} cy={cy - BOX.h / 2 - 14} r={9} fill={C.paper} stroke={C.sap} strokeWidth={1.6} />
                  <path d={`M${cx - 26 + i * 22} ${cy - BOX.h / 2 - 14} l 3 3 l 6 -7`} fill="none" stroke={C.sap} strokeWidth={2} />
                </g>
              ))}
            </Interactive.G>
          )}
          <g opacity={inBooth ? 1 : 0.9}>
            <BuildFactory f={f} />
          </g>

          {/* quay crane */}
          <g filter={`url(#${ID}-rough)`}>
            <path d={`M${TOWER - 26} 436 L ${TOWER - 6} 84 L ${TOWER + 6} 84 L ${TOWER + 26} 436 Z`} fill="none" stroke={C.ink} strokeWidth={2.2} />
            {Array.from({ length: 9 }, (_, i) => {
              const y = 436 - i * 39
              const w = 26 - i * 2.2
              return <line key={i} x1={TOWER - w} y1={y} x2={TOWER + w - 2.2} y2={y - 39} stroke={C.ink} strokeWidth={0.9} />
            })}
            <line x1={980} y1={92} x2={1500} y2={92} stroke={active(3) ? C.ultra : C.ink} strokeWidth={4} />
            <line x1={980} y1={100} x2={1500} y2={100} stroke={C.ink} strokeWidth={1.6} />
            <line x1={TOWER} y1={50} x2={980} y2={92} stroke={C.ink} strokeWidth={1.4} />
            <line x1={TOWER} y1={50} x2={1500} y2={92} stroke={C.ink} strokeWidth={1.4} />
            <rect x={TOWER - 18} y={104} width={36} height={26} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.8} />
          </g>
          <rect x={trolley - 14} y={86} width={28} height={16} fill={C.ochreWash} stroke={C.ink} strokeWidth={1.6} />
          <line x1={trolley - 6} y1={102} x2={trolley - 6} y2={hookY} stroke={C.ink} strokeWidth={1.3} />
          <line x1={trolley + 6} y1={102} x2={trolley + 6} y2={hookY} stroke={C.ink} strokeWidth={1.3} />
          <rect x={trolley - 30} y={hookY - 6} width={60} height={7} fill={C.ink} />

          {/* the cluster's ship, alongside the quay */}
          <g transform={`translate(0 ${osc(f, 90) * 1.5})`}>
            <g filter={`url(#${ID}-rough)`}>
              <path d="M1180 364 L 1580 364 L 1564 424 L 1210 424 C 1196 424, 1186 404, 1180 364 Z" fill={C.hull} stroke={C.ink} strokeWidth={2.2} />
              <path d="M1180 364 L 1580 364 L 1564 424 L 1210 424 C 1196 424, 1186 404, 1180 364 Z" fill={`url(#${ID}-hatch)`} />
              <path d="M1184 402 L 1572 402 L 1564 424 L 1210 424 C 1198 424, 1189 414, 1184 402 Z" fill={C.vermWash} />
              <rect x={1516} y={276} width={58} height={88} fill={C.paper} stroke={C.ink} strokeWidth={2} />
              {[1522, 1538, 1554].map((x) => (
                <rect key={x} x={x} y={286} width={10} height={9} fill={C.moon} stroke={C.ink} strokeWidth={1} />
              ))}
              <path d="M1532 276 L 1535 252 L 1555 252 L 1558 276 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.8} />
              <rect x={1535} y={258} width={20} height={5} fill={C.vermWash} />
            </g>
            <text x={1206} y={390} fontFamily={serif} fontSize={13} letterSpacing={1.6} fill={C.paper}>
              ΚΥΒΕΡΝΗΤΗΣ
            </text>
            <text x={1420} y={390} fontFamily={mono} fontSize={12} fill={C.paper} opacity={0.85}>
              aks · 2 nodes
            </text>
            {/* Key Vault on the bridge face; at rollout it hands the new pod its secrets over CSI */}
            <g transform="translate(1530 318)">
              <rect x={0} y={0} width={30} height={24} rx={3} fill={C.ochreSoft} stroke={C.ink} strokeWidth={1.4} />
              <circle cx={15} cy={10} r={3.2} fill={C.ink} />
              <path d="M 13.6 12 L 13 18 L 17 18 L 16.4 12 Z" fill={C.ink} />
            </g>
            {(() => {
              const k = prog(f, 410, 424, ease.inOut)
              if (k <= 0) return null
              const kx = lerp(1545, SLOT.x + BOX.w - 18, k)
              const ky = lerp(318, SLOT.y + 10, k) - Math.sin(k * Math.PI) * 40
              return (
                <g transform={`translate(${kx} ${ky}) rotate(${k * 360})`} opacity={k < 1 ? 1 : 0.9}>
                  <circle cx={-5} cy={0} r={4} fill="none" stroke={C.ochre} strokeWidth={2} />
                  <path d="M -1 0 L 8 0 M 5 0 L 5 3 M 8 0 L 8 4" fill="none" stroke={C.ochre} strokeWidth={2} strokeLinecap="round" />
                </g>
              )
            })()}
            <g transform="translate(1500 340)">
              <g style={{ rotate: `${osc(f, 120) * 10}deg` }}>
                <Helm r={11} />
              </g>
            </g>
            <Box id={ID} x={1206} y={SLOT.y} w={BOX.w} h={BOX.h} fill={C.ultraSoft} whale />
            <Box id={ID} x={1308} y={SLOT.y} w={BOX.w} h={BOX.h} fill={C.paper} />
            <rect x={SLOT.x} y={SLOT.y} width={BOX.w} height={BOX.h} fill="none" stroke={C.ultra} strokeWidth={1.6} strokeDasharray="6 5" opacity={f < 406 ? 0.8 : 0} />
            {f >= 406 && (
              <g>
                <Box id={ID} x={SLOT.x} y={SLOT.y} w={BOX.w} h={BOX.h} fill={C.sapSoft} whale />
                {[0, 1, 2].map((i) => (
                  <g key={i}>
                    <circle cx={SLOT.x + 30 + i * 22} cy={SLOT.y - 14} r={9} fill={C.paper} stroke={C.sap} strokeWidth={1.6} />
                    <path d={`M${SLOT.x + 26 + i * 22} ${SLOT.y - 14} l 3 3 l 6 -7`} fill="none" stroke={C.sap} strokeWidth={2} />
                  </g>
                ))}
              </g>
            )}
            {/* the verification flag */}
            <line x1={1188} y1={364} x2={1188} y2={236} stroke={C.ink} strokeWidth={2.4} />
            <g transform={`translate(0 ${lerp(110, 0, flag)})`}>
              <path d="M1188 238 L 1232 250 L 1188 262 Z" fill={C.sapWash} stroke={C.ink} strokeWidth={1.6} />
              <path d="M1196 250 l 5 5 l 10 -11" fill="none" stroke={C.sap} strokeWidth={2.4} opacity={flag > 0.9 ? 1 : 0} />
            </g>
          </g>

          {/* the container on the hook */}
          {onHook && <Box id={ID} x={cx - BOX.w / 2} y={cy - BOX.h / 2} w={BOX.w} h={BOX.h} fill={C.sapSoft} whale />}

          <Verification t={f - 406} />
          <Tag x={1210} y={268} f={f} at={422}>
            key vault csi ✓
          </Tag>
          <Tag x={1320} y={200} f={f} at={432}>
            zap ✓ · smoke ✓
          </Tag>

          {/* enamel plates, one per stage */}
          {pipeline.stages.map((s, i) => {
            const x = STAGES[i].x - 96
            const on = active(i)
            const ok = done(i)
            return (
              <g key={s.name} opacity={on || ok ? 1 : 0.45}>
                <rect x={x} y={456} width={200} height={70} rx={8} fill={C.paper} stroke={on ? C.ultra : ok ? C.sap : C.ink} strokeWidth={on ? 2.4 : 1.4} />
                <circle cx={x + 20} cy={476} r={11} fill={ok ? C.sap : on ? C.ultra : C.paper} stroke={C.ink} strokeWidth={1.2} />
                <text x={x + 20} y={480} textAnchor="middle" fontFamily={mono} fontSize={13} fill={ok || on ? C.paper : C.ink}>
                  {ok ? '✓' : i + 1}
                </text>
                <text x={x + 40} y={482} fontFamily={serif} fontSize={19} fill={C.ink}>
                  {s.name}
                </text>
                <text x={x + 14} y={503} fontFamily={mono} fontSize={13} fill={C.graphite}>
                  {s.tools}
                </text>
                <text x={x + 14} y={519} fontFamily={mono} fontSize={14.5} fill={C.ultra}>
                  {s.time}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </AbsoluteFill>
  )
}
