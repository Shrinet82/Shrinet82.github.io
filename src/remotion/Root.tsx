import { Composition } from 'remotion'
import { Sailing, SAILING } from './Sailing'
import { Conveyor, CONVEYOR, WORLD } from './Conveyor'

// Remotion Studio entry: `npm run studio` to preview and tweak the scenes.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Sailing" component={Sailing} {...SAILING} />
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
