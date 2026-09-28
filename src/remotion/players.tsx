import { useEffect, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { Sailing, SAILING } from './Sailing'
import { Conveyor, CONVEYOR, WORLD } from './Conveyor'

// The scroll code seeks the conveyor frame by frame; it reads the ref here.
export const players: { conveyor: PlayerRef | null } = { conveyor: null }

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const quiet = {
  controls: false,
  clickToPlay: false,
  doubleClickToFullscreen: false,
  spaceKeyToPlayOrPause: false,
  initiallyMuted: true,
  acknowledgeRemotionLicense: true,
} as const

// Hero loop: plays while on screen, pauses when scrolled away. With reduced
// motion it holds a calm frame (after the storm, container restored).
export function SailingPlayer() {
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
    <div ref={wrap} role="img" aria-label="Animation: a sailing boat steered by a Kubernetes helm and the Docker whale carrying containers. A storm cracks one container and the helm reschedules it.">
      <Player
        ref={ref}
        component={Sailing}
        durationInFrames={SAILING.durationInFrames}
        compositionWidth={SAILING.width}
        compositionHeight={SAILING.height}
        fps={SAILING.fps}
        loop
        autoPlay={!still}
        initialFrame={still ? 225 : 0}
        style={{ width: '100%', aspectRatio: `${SAILING.width} / ${SAILING.height}` }}
        {...quiet}
      />
    </div>
  )
}

// Conveyor: never plays on its own; motion.ts maps scroll progress to frames.
// Narrow screens get a 640px camera that follows the container.
export function ConveyorPlayer() {
  const [viewWidth, setViewWidth] = useState(() => (window.matchMedia('(max-width: 900px)').matches ? 640 : WORLD))

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const on = () => setViewWidth(mq.matches ? 640 : WORLD)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return (
    <div role="img" aria-label="Animation: a Docker container rides a conveyor through security, quality and build checks, gets two critical CVEs patched, and is craned onto a ship for delivery and verification.">
      <Player
        key={viewWidth}
        ref={(r) => {
          players.conveyor = r
        }}
        component={Conveyor}
        inputProps={{ viewWidth }}
        durationInFrames={CONVEYOR.durationInFrames}
        compositionWidth={viewWidth}
        compositionHeight={CONVEYOR.height}
        fps={CONVEYOR.fps}
        initialFrame={CONVEYOR.durationInFrames - 1}
        style={{ width: '100%', aspectRatio: `${viewWidth} / ${CONVEYOR.height}` }}
        {...quiet}
      />
    </div>
  )
}
