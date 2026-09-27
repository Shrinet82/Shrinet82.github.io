import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { prefersReducedMotion } from './registry'

// A liquid-glass "control plane": a heptagonal ring (the Kubernetes wheel has
// seven spokes) with seven pods in orbit and a core. It refracts the live
// gradient through drei's MeshTransmissionMaterial, fed our own buffer.

// Fewer refraction samples on small screens, which are usually weaker GPUs.
const SAMPLES = typeof window !== 'undefined' && window.innerWidth < 900 ? 3 : 6

function Glass({ buffer, ...props }: { buffer: THREE.Texture } & Record<string, unknown>) {
  return (
    <MeshTransmissionMaterial
      buffer={buffer}
      transmission={1}
      thickness={0.9}
      roughness={0.04}
      ior={1.35}
      chromaticAberration={0.12}
      anisotropicBlur={0.2}
      distortion={0.35}
      distortionScale={0.4}
      temporalDistortion={0.08}
      samples={SAMPLES}
      color="#ffffff"
      attenuationColor="#ffffff"
      attenuationDistance={2}
      {...props}
    />
  )
}

export default function HeroGlass({ buffer }: { buffer: THREE.Texture }) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const pods = useRef<THREE.Group>(null)
  const { size, viewport } = useThree()
  const still = prefersReducedMotion()

  const podAngles = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), [])

  useFrame((state, dt) => {
    if (!group.current) return
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 0])
    const unitsPerPx = vp.height / size.height
    const mobile = size.width < 900

    // Sit on the right of the hero on desktop, top-centre on mobile, and
    // scroll away with the page.
    const baseX = mobile ? 0 : vp.width * 0.24
    const baseY = mobile ? vp.height * 0.2 : 0
    group.current.position.x = baseX
    group.current.position.y = baseY + window.scrollY * unitsPerPx
    const s = mobile ? Math.min(vp.width / 6.2, 0.75) : Math.min(vp.height / 7.5, 1)
    group.current.scale.setScalar(s)
    group.current.visible = window.scrollY < size.height * 1.4

    if (still) return
    const t = state.clock.elapsedTime
    const px = state.pointer.x
    const py = state.pointer.y
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, px * 0.5, 3, dt)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -py * 0.35 + 0.35, 3, dt)
    if (ring.current) ring.current.rotation.z = t * 0.12
    if (pods.current) {
      pods.current.rotation.z = -t * 0.28
      pods.current.children.forEach((c, i) => {
        c.position.z = Math.sin(t * 1.2 + i) * 0.25
      })
    }
  })

  return (
    <group ref={group}>
      <mesh ref={ring}>
        <torusGeometry args={[1.55, 0.36, 48, 7]} />
        <Glass buffer={buffer} />
      </mesh>
      <group ref={pods}>
        {podAngles.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 2.45, Math.sin(a) * 2.45, 0]}>
            <sphereGeometry args={[0.22, 48, 48]} />
            <Glass buffer={buffer} thickness={0.5} chromaticAberration={0.2} />
          </mesh>
        ))}
      </group>
      <RoundedBox args={[0.95, 0.95, 0.95]} radius={0.22} smoothness={6} rotation={[0.6, 0.7, 0.2]}>
        <Glass buffer={buffer} thickness={1.4} ior={1.5} />
      </RoundedBox>
    </group>
  )
}
