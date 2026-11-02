import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Player, Thumbnail, type PlayerRef } from '@remotion/player'
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
type Name = keyof typeof SCRUBS
const setters: Partial<Record<Name, (frame: number) => void>> = {}
const shown: Partial<Record<Name, number>> = {}

// Show the frame for scroll progress p. The render is flushed synchronously,
// inside the same animation frame that moved the page, so the picture never
// trails the scroll. Calls made while React is mid-commit are deferred a frame.
export function scrubTo(name: Name, p: number) {
  const set = setters[name]
  if (!set) return
  const frame = Math.round(Math.min(1, Math.max(0, p)) * (SCRUBS[name].frames - 1))
  if (frame === shown[name]) return
  shown[name] = frame
  try {
    flushSync(() => set(frame))
  } catch {
    set(frame)
  }
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const quiet = {
  controls: false,
  clickToPlay: false,
  doubleClickToFullscreen: false,
  spaceKeyToPlayOrPause: false,
  initiallyMuted: true,
  acknowledgeRemotionLicense: true,
} as const

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}
const useNarrow = () => useMedia('(max-width: 900px)')
// Phones get a tighter camera on the wide films so their labels stay legible.
const usePhone = () => useMedia('(max-width: 560px)')

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
// (or with reduced motion) it shows the finished picture.
function Scrubbed({
  name,
  label,
  component,
  width,
  height,
  frames,
  inputProps,
}: {
  name: Name
  label: string
  component: React.ComponentType<any>
  width: number
  height: number
  frames: number
  inputProps?: Record<string, unknown>
}) {
  const [frame, setFrame] = useState(frames - 1)
  useEffect(() => {
    setters[name] = setFrame
    return () => {
      delete setters[name]
      delete shown[name]
    }
  }, [name])
  return (
    <div role="img" aria-label={label} data-scrub={name}>
      <Thumbnail
        key={width}
        component={component}
        inputProps={inputProps}
        durationInFrames={frames}
        compositionWidth={width}
        compositionHeight={height}
        fps={30}
        frameToDisplay={frame}
        style={{ width: '100%', aspectRatio: `${width} / ${height}` }}
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
  const phone = usePhone()
  const width = phone ? 440 : narrow ? 640 : WORLD
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
  const phone = usePhone()
  const size = narrow ? { ...LIGHTHOUSE_NARROW, width: phone ? 440 : LIGHTHOUSE_NARROW.width } : LIGHTHOUSE
  return (
    <Scrubbed
      name="lighthouse"
      label="Animation: a glitch keeps stacking buckets and servers on the quay at night. The Aegis lighthouse sweeps its beam, tags each resource that breaks a rule, sweeps them away and revokes an open SSH rule, in under two minutes."
      component={Lighthouse}
      width={size.width}
      height={size.height}
      frames={LIGHTHOUSE.durationInFrames}
      inputProps={{ narrow, viewWidth: size.width }}
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
