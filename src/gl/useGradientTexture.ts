import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gradientSource } from './registry'

// Mirrors the shader-gradient canvas into a texture on this renderer so the
// glass layer and the hero object can refract it. Uploads are capped at ~30fps.
export function useGradientTexture() {
  const texture = useMemo(() => {
    const placeholder = document.createElement('canvas')
    placeholder.width = placeholder.height = 2
    const t = new THREE.CanvasTexture(placeholder)
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.generateMipmaps = true
    return t
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  const last = useRef(0)
  useFrame(({ clock }) => {
    const src = gradientSource.canvas
    if (!src || src.width === 0) return
    if (texture.image !== src) {
      texture.image = src
      texture.needsUpdate = true
      return
    }
    const now = clock.elapsedTime
    if (now - last.current < 1 / 30) return
    last.current = now
    texture.needsUpdate = true
  })

  return texture
}
