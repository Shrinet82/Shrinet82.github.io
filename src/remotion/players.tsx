import { memo, useEffect, useRef, useState } from 'react'
import { Player, Thumbnail, type PlayerRef } from '@remotion/player'
import { Harbour, HARBOUR } from './Harbour'
import { GoldenPath, GOLDEN, GOLDEN_NARROW } from './GoldenPath'
import { Conveyor, CONVEYOR, WORLD } from './Conveyor'
import { Lighthouse, LIGHTHOUSE, LIGHTHOUSE_NARROW } from './Lighthouse'
import { Loop, LOOP } from './Loop'

// Frame counts of the scroll-driven films, for captions that follow along.
export const FRAMES = {
  golden: GOLDEN.durationInFrames,
  conveyor: CONVEYOR.durationInFrames,
  lighthouse: LIGHTHOUSE.durationInFrames,
  loop: LOOP.durationInFrames,
}

// Composition frame rates. Captions are timed in beats of 1/30 s, so a 60 fps
// film's frame is halved before it is compared with them.
export const FPS = { golden: GOLDEN.fps, conveyor: CONVEYOR.fps, lighthouse: LIGHTHOUSE.fps, loop: LOOP.fps }

// A film finishes at 86% of its pinned scroll and holds its last frame for
// the rest, so the finished picture is on screen before the page moves on.
const HOLD = 0.86
export const frameAt = (p: number, frames: number) => Math.round(Math.min(1, Math.max(0, p) / HOLD) * (frames - 1))

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
        initialFrame={still ? 600 : 0}
        style={{ width: '100%', aspectRatio: `${HARBOUR.width} / ${HARBOUR.height}` }}
        {...quiet}
      />
    </div>
  )
}

// A composition the scroll plays: Thumbnail renders exactly the frame asked
// for, with no playback clock of its own. --ar lets CSS fit it to the pinned
// stage. Without JS (or with reduced motion) it shows the finished picture.
const Scrubbed = memo(function Scrubbed({
  name,
  progress,
  label,
  component,
  width,
  height,
  frames,
  fps = 30,
  inputProps,
}: {
  name: keyof typeof FRAMES
  progress: number
  label: string
  component: React.ComponentType<any>
  width: number
  height: number
  frames: number
  fps?: number
  inputProps?: Record<string, unknown>
}) {
  return (
    <div className="film-fit" role="img" aria-label={label} data-scrub={name} style={{ '--ar': width / height } as React.CSSProperties}>
      <Thumbnail
        key={width}
        component={component}
        inputProps={inputProps}
        durationInFrames={frames}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        frameToDisplay={frameAt(progress, frames)}
        style={{ width: '100%', aspectRatio: `${width} / ${height}` }}
      />
    </div>
  )
})

type Film = { progress: number }

export function GoldenPathPlayer({ progress }: Film) {
  const narrow = useNarrow()
  const size = narrow ? GOLDEN_NARROW : GOLDEN
  return (
    <Scrubbed
      progress={progress}
      name="golden"
      label="Animation: before, tickets pile up while a clock reaches 45 minutes; after, a Backstage golden-path form runs Terraform, Infracost and OIDC and lands the bucket in the catalog at 8 minutes."
      component={GoldenPath}
      width={size.width}
      height={size.height}
      frames={GOLDEN.durationInFrames}
      fps={GOLDEN.fps}
      inputProps={{ narrow }}
    />
  )
}

export function ConveyorPlayer({ progress }: Film) {
  const narrow = useNarrow()
  const phone = usePhone()
  const width = phone ? 440 : narrow ? 640 : WORLD
  return (
    <Scrubbed
      progress={progress}
      name="conveyor"
      label="Animation: a Docker image rides a conveyor through secret and IaC scanning, quality checks, and a Trivy X-ray that flags two critical CVEs in its dependencies layer, which is upgraded. A crane loads it onto the cluster's ship, where OWASP ZAP and a smoke test verify it."
      component={Conveyor}
      width={width}
      height={CONVEYOR.height}
      frames={CONVEYOR.durationInFrames}
      fps={CONVEYOR.fps}
      inputProps={{ viewWidth: width }}
    />
  )
}

export function LighthousePlayer({ progress }: Film) {
  const narrow = useNarrow()
  const phone = usePhone()
  const size = narrow ? { ...LIGHTHOUSE_NARROW, width: phone ? 440 : LIGHTHOUSE_NARROW.width } : LIGHTHOUSE
  return (
    <Scrubbed
      progress={progress}
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

export function LoopPlayer({ progress }: Film) {
  const narrow = useNarrow()
  const width = narrow ? 460 : 1400
  return (
    <Scrubbed
      progress={progress}
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
