import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import GlassPass from './GlassPass'
import HeroGlass from './HeroGlass'
import { useGradientTexture } from './useGradientTexture'

function Scene() {
  const texture = useGradientTexture()
  return (
    <>
      {/* Procedural studio lighting for reflections; nothing is fetched. */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 5, -2]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer intensity={2} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#b69cff" />
        <Lightformer intensity={2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffb199" />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, 6]} scale={3} color="#8be9fd" />
      </Environment>
      <HeroGlass buffer={texture} />
      <GlassPass texture={texture} />
    </>
  )
}

export default function Stage() {
  return (
    <div className="layer-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 35 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        eventSource={document.getElementById('root')!}
        eventPrefix="client"
      >
        <Scene />
      </Canvas>
    </div>
  )
}
