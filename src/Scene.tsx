import { memo, type ComponentType } from 'react'
import { Thumbnail } from '@remotion/player'
import { SCENE } from './remotion/kit'

// A Remotion composition rendered at the frame the scroll asks for. Thumbnail
// renders one exact frame and nothing else: no playback clock, no buffering,
// so the picture is a pure function of how far down the page you are.
export const SceneFrame = memo(function SceneFrame({ component, progress, label }: { component: ComponentType; progress: number; label: string }) {
  const frame = Math.round(progress * (SCENE.durationInFrames - 1))
  return (
    <div className="scene-frame" role="img" aria-label={label}>
      <Thumbnail
        component={component}
        compositionWidth={SCENE.width}
        compositionHeight={SCENE.height}
        durationInFrames={SCENE.durationInFrames}
        fps={SCENE.fps}
        frameToDisplay={frame}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
})

// Which step of a scene's story is on screen, from the same progress.
export const stepAt = (p: number, n: number) => Math.min(n - 1, Math.floor(p * n * 0.999))
