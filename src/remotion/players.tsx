import { useEffect, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { Harbour, HARBOUR } from './Harbour'
import { GoldenPath, GOLDEN, GOLDEN_NARROW } from './GoldenPath'
import { Conveyor, CONVEYOR, WORLD } from './Conveyor'
import { Lighthouse, LIGHTHOUSE, LIGHTHOUSE_NARROW } from './Lighthouse'
import { Loop, LOOP } from './Loop'

// Scroll-driven compositions: motion.ts seeks these frame by frame.
export const SCRUBS = {
  golden: { selector: '[data-scrub="golden"]', frames: GOLDEN.durationInFrames, pinned: false, length: 0 },
  conveyor: { selector: '[data-stage="ship"]', frames: CONVEYOR.durationInFrames, pinned: true, length: 190 },
  lighthouse: { selector: '[data-scrub="lighthouse"]', frames: LIGHTHOUSE.durationInFrames, pinned: false, length: 0 },
  loop: { selector: '[data-stage="heal"]', frames: LOOP.durationInFrames, pinned: true, length: 260 },
}
export const players: Partial<Record<keyof typeof SCRUBS, PlayerRef | null>> = {}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const quiet = {
  controls: false,
  clickToPlay: false,
  doubleClickToFullscreen: false,
  spaceKeyToPlayOrPause: false,
  initiallyMuted: true,
  acknowledgeRemotionLicense: true,
} as const

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

// Hero loop: plays while on screen, pauses when scrolled away. With reduced
// motion it holds a calm frame with all seven containers aboard.
export function HarbourPlayer() {
  const ref = useRef<PlayerRef>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [still] = useState(reducedMotion)

  useEffect(() => {
    if (still || !wrap.current) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? ref.current?.play() : ref.current?.pause()))
    io.observe(wrap.current)
    return () => io.disconnect()
  }, [still])

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="Animation: a container ship steered by a Kubernetes helm carries Docker containers. A wave knocks one overboard and the ship's crane replaces it with an identical one, restoring the desired state."
    >
      <Player
        ref={ref}
        component={Harbour}
        durationInFrames={HARBOUR.durationInFrames}
        compositionWidth={HARBOUR.width}
        compositionHeight={HARBOUR.height}
        fps={HARBOUR.fps}
        loop
        autoPlay={!still}
        initialFrame={still ? 300 : 0}
        style={{ width: '100%', aspectRatio: `${HARBOUR.width} / ${HARBOUR.height}` }}
        {...quiet}
      />
    </div>
  )
}

// A composition the scroll plays. It rests on its last frame, so without JS
// scrolling (or with reduced motion) it shows the finished picture.
function Scrubbed({
  name,
  label,
  component,
  width,
  height,
  frames,
  inputProps,
}: {
  name: keyof typeof SCRUBS
  label: string
  component: React.ComponentType<any>
  width: number
  height: number
  frames: number
  inputProps?: Record<string, unknown>
}) {
  return (
    <div role="img" aria-label={label} data-scrub={name}>
      <Player
        key={width}
        ref={(r) => {
          players[name] = r
        }}
        component={component}
        inputProps={inputProps}
        durationInFrames={frames}
        compositionWidth={width}
        compositionHeight={height}
        fps={30}
        initialFrame={frames - 1}
        style={{ width: '100%', aspectRatio: `${width} / ${height}` }}
        {...quiet}
      />
    </div>
  )
}

export function GoldenPathPlayer() {
  const narrow = useNarrow()
  const size = narrow ? GOLDEN_NARROW : GOLDEN
  return (
    <Scrubbed
      name="golden"
      label="Animation: before, tickets pile up while a clock reaches 45 minutes; after, a Backstage golden-path form runs Terraform, Infracost and OIDC and lands the bucket in the catalog at 8 minutes."
      component={GoldenPath}
      width={size.width}
      height={size.height}
      frames={GOLDEN.durationInFrames}
      inputProps={{ narrow }}
    />
  )
}

export function ConveyorPlayer() {
  const narrow = useNarrow()
  const width = narrow ? 640 : WORLD
  return (
    <Scrubbed
      name="conveyor"
      label="Animation: a Docker image rides a conveyor through secret and IaC scanning, quality checks, and a Trivy X-ray that flags two critical CVEs in its dependencies layer, which is upgraded. A crane loads it onto the cluster's ship, where OWASP ZAP and a smoke test verify it."
      component={Conveyor}
      width={width}
      height={CONVEYOR.height}
      frames={CONVEYOR.durationInFrames}
      inputProps={{ viewWidth: width }}
    />
  )
}

export function LighthousePlayer() {
  const narrow = useNarrow()
  const size = narrow ? LIGHTHOUSE_NARROW : LIGHTHOUSE
  return (
    <Scrubbed
      name="lighthouse"
      label="Animation: a glitch keeps stacking buckets and servers on the quay at night. The Aegis lighthouse sweeps its beam, tags each resource that breaks a rule, sweeps them away and revokes an open SSH rule, in under two minutes."
      component={Lighthouse}
      width={size.width}
      height={size.height}
      frames={LIGHTHOUSE.durationInFrames}
      inputProps={{ narrow }}
    />
  )
}

export function LoopPlayer() {
  const narrow = useNarrow()
  const width = narrow ? 460 : 1400
  return (
    <Scrubbed
      name="loop"
      label="Animation: the Aegis Observe loop in five panels. A 504 spike is detected through SigNoz logs, an LLM picks one tool past a confidence gate, a Slack card asks a human who taps PR, the pull request merges and ArgoCD syncs, and latency returns under the SLO."
      component={Loop}
      width={width}
      height={LOOP.height}
      frames={LOOP.durationInFrames}
      inputProps={{ viewWidth: width }}
    />
  )
}
