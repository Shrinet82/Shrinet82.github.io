import { Composition } from 'remotion'
import { SCENE } from './kit'
import { Ship } from './Ship'
import { Observe } from './Observe'
import { Opsie } from './Opsie'
import { Govern } from './Govern'
import { Gates } from './Gates'

// Remotion Studio entry: `npm run studio` to preview, tweak or render any
// scene as a video. On the site the same components are driven by scroll.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ship" component={Ship} {...SCENE} />
    <Composition id="Observe" component={Observe} {...SCENE} />
    <Composition id="Opsie" component={Opsie} {...SCENE} />
    <Composition id="Govern" component={Govern} {...SCENE} />
    <Composition id="Gates" component={Gates} {...SCENE} />
  </>
)
