import { useEffect, useRef, useState } from 'react'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import { gradientSource, paletteStore, prefersReducedMotion, type Palette } from './registry'

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const rgbToHex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t))
}

// Tweens between section palettes so the backdrop drifts as you scroll.
function usePalette() {
  const [palette, setPalette] = useState<Palette>(paletteStore.get())
  const shown = useRef(palette)

  useEffect(() => {
    let raf = 0
    return paletteStore.subscribe((target) => {
      cancelAnimationFrame(raf)
      const from = shown.current
      const start = performance.now()
      const duration = prefersReducedMotion() ? 0 : 1400
      const step = (now: number) => {
        const t = duration ? Math.min(1, (now - start) / duration) : 1
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const next = {
          color1: mix(from.color1, target.color1, e),
          color2: mix(from.color2, target.color2, e),
          color3: mix(from.color3, target.color3, e),
        }
        shown.current = next
        setPalette(next)
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    })
  }, [])

  return palette
}

export default function Background() {
  const palette = usePalette()
  const wrap = useRef<HTMLDivElement>(null)
  const still = prefersReducedMotion()

  // Publish the gradient canvas so the glass layer can refract it.
  useEffect(() => {
    const find = () => {
      const c = wrap.current?.querySelector('canvas') ?? null
      gradientSource.canvas = c
      return c
    }
    if (find()) return
    const mo = new MutationObserver(() => find() && mo.disconnect())
    if (wrap.current) mo.observe(wrap.current, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      gradientSource.canvas = null
    }
  }, [])

  return (
    <div ref={wrap} className="layer-gradient" aria-hidden="true">
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0 }}
        pixelDensity={1}
        fov={45}
        lazyLoad={false}
        pointerEvents="none"
        preserveDrawingBuffer
        powerPreference="high-performance"
      >
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate={still ? 'off' : 'on'}
          uTime={0.2}
          uSpeed={0.08}
          uStrength={2.4}
          uDensity={1.1}
          uFrequency={5.5}
          uAmplitude={0}
          positionX={-0.5}
          positionY={0.1}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={235}
          color1={palette.color1}
          color2={palette.color2}
          color3={palette.color3}
          reflection={0.1}
          cAzimuthAngle={180}
          cPolarAngle={115}
          cDistance={3.9}
          cameraZoom={1}
          lightType="3d"
          brightness={0.85}
          grain="off"
        />
      </ShaderGradientCanvas>
    </div>
  )
}
