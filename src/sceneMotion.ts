import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

// The easel is painted by the scroll; the desk's steam and pager loop gently
// while on screen. Every scene's static markup (reduced motion) is already a
// complete picture.

type Loop = gsap.core.Animation
type Build = (svg: SVGSVGElement) => Loop[]

const q = <T extends Element = SVGElement>(svg: SVGSVGElement, sel: string) => [...svg.querySelectorAll<T>(sel)]
const one = <T extends Element = SVGElement>(svg: SVGSVGElement, sel: string) => svg.querySelector<T>(sel)!

function drawable(el: SVGGeometryElement) {
  const len = el.getTotalLength() + 1
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: 0 })
  return len
}

const easel: Build = (svg) => {
  const line = one<SVGPathElement>(svg, '.paint-line')
  const len = drawable(line)
  const bars = q(svg, '.paint-bar')
  const brush = one(svg, '.brush')
  const tl = gsap.timeline({
    scrollTrigger: { trigger: svg, start: 'top 90%', end: 'top 40%', scrub: true },
  })
  tl.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.3, stagger: 0.18, ease: 'back.out(2)' })
    .fromTo(line, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, 0.2)
    .fromTo(brush, { x: 114, y: 180 }, { duration: 1.6, ease: 'none', motionPath: { path: line, align: line, alignOrigin: [0, 0] } }, 0.2)
  return []
}

const desk: Build = (svg) => {
  const steam = q(svg, '.steam-line').map((s, i) =>
    gsap.fromTo(
      s,
      { opacity: 0, y: 10 },
      { keyframes: [{ opacity: 0.8, y: 0, duration: 1 }, { opacity: 0, y: -12, duration: 1.2 }], repeat: -1, delay: i * 0.5, ease: 'sine.inOut' },
    ),
  )
  const led = gsap.to(one(svg, '.pager-led'), { opacity: 0.3, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  return [...steam, led]
}

const builds: Record<string, Build> = { easel, desk }

export function scenes(root: HTMLElement) {
  const cleanups: (() => void)[] = []
  root.querySelectorAll<SVGSVGElement>('svg.scene').forEach((svg) => {
    const build = builds[svg.dataset.scene ?? '']
    if (!build) return
    const loops = build(svg)
    loops.forEach((l) => l.pause())
    const st = ScrollTrigger.create({
      trigger: svg,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
    })
    cleanups.push(() => {
      st.kill()
      loops.forEach((l) => l.revert())
    })
  })
  return () => cleanups.forEach((c) => c())
}
