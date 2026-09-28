import { Composition } from 'remotion'
import { Harbour, HARBOUR } from './Harbour'
import { GoldenPath, GOLDEN } from './GoldenPath'
import { Lighthouse, LIGHTHOUSE } from './Lighthouse'
import { Loop, LOOP, LOOP_WORLD } from './Loop'
import { Conveyor, CONVEYOR, WORLD } from './Conveyor'

// Remotion Studio entry: `npm run studio` to preview and tweak the scenes.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Harbour" component={Harbour} {...HARBOUR} />
    <Composition id="GoldenPath" component={GoldenPath} {...GOLDEN} />
    <Composition id="Lighthouse" component={Lighthouse} {...LIGHTHOUSE} />
    <Composition id="Loop" component={Loop} width={1400} height={LOOP.height} fps={LOOP.fps} durationInFrames={LOOP.durationInFrames} defaultProps={{ viewWidth: 1400 }} />
    <Composition id="LoopMobile" component={Loop} width={460} height={LOOP.height} fps={LOOP.fps} durationInFrames={LOOP.durationInFrames} defaultProps={{ viewWidth: 460 }} />
    <Composition
      id="Conveyor"
      component={Conveyor}
      width={WORLD}
      height={CONVEYOR.height}
      fps={CONVEYOR.fps}
      durationInFrames={CONVEYOR.durationInFrames}
      defaultProps={{ viewWidth: WORLD }}
    />
    <Composition
      id="ConveyorMobile"
      component={Conveyor}
      width={640}
      height={CONVEYOR.height}
      fps={CONVEYOR.fps}
      durationInFrames={CONVEYOR.durationInFrames}
      defaultProps={{ viewWidth: 640 }}
    />
  </>
)
