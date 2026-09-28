import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

// Each illustrated scene loops like a short motion-graphics clip. Loops only
// run while their scene is on screen, and every scene is composed so that its
// static markup (reduced motion) is already a complete picture.

type Loop = gsap.core.Animation
type Build = (svg: SVGSVGElement) => Loop[]

const q = <T extends Element = SVGElement>(svg: SVGSVGElement, sel: string) => [...svg.querySelectorAll<T>(sel)]
const one = <T extends Element = SVGElement>(svg: SVGSVGElement, sel: string) => svg.querySelector<T>(sel)!

function drawable(el: SVGGeometryElement) {
  const len = el.getTotalLength() + 1
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: 0 })
  return len
}

const provision: Build = (svg) => {
  const sway = q(svg, '.person').map((p, i) =>
    gsap.to(p, { rotate: i % 2 ? 3 : -3, transformOrigin: '50% 100%', duration: 1.4 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  )
  const long = gsap.to(one(svg, '.hand-long'), { rotate: 360, svgOrigin: '226 84', duration: 2, repeat: -1, ease: 'none' })
  const short = gsap.to(one(svg, '.hand-short'), { rotate: 360, svgOrigin: '226 84', duration: 24, repeat: -1, ease: 'none' })

  const fields = q<SVGGeometryElement>(svg, '.field')
  const lens = fields.map(drawable)
  const cursor = one(svg, '.cursor')
  const pail = one(svg, '.pail')
  const tag = one(svg, '.tag-8')
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
  tl.set(fields, { strokeDashoffset: (i) => lens[i] })
    .set(pail, { y: -70, opacity: 0, x: 0 })
    .set(tag, { opacity: 0 })
    .fromTo(cursor, { x: 330, y: 300 }, { x: 414, y: 170, duration: 0.9, ease: 'power2.inOut' })
    .to(one(svg, '.btn-press'), { scale: 0.82, transformOrigin: '50% 50%', duration: 0.12, yoyo: true, repeat: 1 })
    .to(cursor, { scale: 0.9, transformOrigin: '0% 0%', duration: 0.12, yoyo: true, repeat: 1 }, '<')
    .to(fields, { strokeDashoffset: 0, duration: 0.35, stagger: 0.2, ease: 'power1.out' })
    .to(pail, { y: 0, opacity: 1, duration: 0.8, ease: 'bounce.out' })
    .fromTo(tag, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.2')
    .to(cursor, { x: 470, y: 320, duration: 0.6, ease: 'power2.inOut' }, '<')
    .to(pail, { x: 70, opacity: 0, duration: 0.7, ease: 'power2.in' }, '+=1.4')
  return [...sway, long, short, tl]
}

const govern: Build = (svg) => {
  const things = q(svg, '.thing')
  const broom = one(svg, '.broom')
  const alarm = one(svg, '.alarm')
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 })
  tl.set(broom, { x: 220, rotate: 0 })
    .set(things, { x: 0, rotate: 0 })
    .fromTo(
      things,
      { opacity: 0, scale: 0.2, y: -30, transformOrigin: '50% 100%' },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.28, ease: 'back.out(2.5)' },
    )
    .fromTo(alarm, { opacity: 1 }, { opacity: 0.25, duration: 0.2, yoyo: true, repeat: 9 }, 0)
    .to(broom, { x: 0, duration: 0.6, ease: 'power2.out' })
    .to(one(svg, '.hourglass'), { rotate: 180, svgOrigin: '440 80', duration: 0.5, ease: 'power2.inOut' }, '<')
    .to(broom, { x: -260, rotate: -10, svgOrigin: '340 262', duration: 0.8, ease: 'power2.in' })
    .to(things, { x: -320, rotate: () => gsap.utils.random(-60, 60), opacity: 0, duration: 0.7, stagger: 0.03, ease: 'power2.in' }, '<0.15')
    .to(broom, { opacity: 0, duration: 0.3 })
    .set(broom, { opacity: 1, x: 220 })
    .set(one(svg, '.hourglass'), { rotate: 0, svgOrigin: '440 80' }, '+=0.8')
    .set(things, { opacity: 1, x: 0, rotate: 0 })
  return [tl]
}

const heal: Build = (svg) => {
  const logs = q<SVGGeometryElement>(svg, '.log')
  const lens = logs.map(drawable)
  const scroll = gsap.fromTo(logs, { strokeDashoffset: (i) => lens[i] }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.25, repeat: -1, repeatDelay: 0.6, ease: 'none' })
  const blink = gsap.to(q(svg, '.eye'), { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: -1, repeatDelay: 2.6 })

  const bubble = [one(svg, '.bubble'), one(svg, '.bubble-t'), one(svg, '.bubble-btns')]
  const prBtn = one(svg, '.pr-btn')
  const finger = one(svg, '.finger')
  const card = one(svg, '.pr-card')
  const merge = one(svg, '.merge-dot')
  const synced = one(svg, '.synced')
  const route = one(svg, '#pr-branch') as SVGPathElement
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
  tl.call(() => prBtn.classList.add('idle'))
    .set([...bubble, synced], { opacity: 0 })
    .set(merge, { scale: 1, transformOrigin: '50% 50%' })
    .fromTo(bubble, { opacity: 0, scale: 0.7, transformOrigin: '12% 100%' }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.06 }, 0.3)
    .fromTo(finger, { x: 470, y: 190, opacity: 0 }, { x: 323, y: 115, opacity: 1, duration: 0.9, ease: 'power2.inOut' }, '+=0.5')
    .call(() => prBtn.classList.remove('idle'))
    .to(finger, { scale: 0.8, transformOrigin: '50% 50%', duration: 0.1, yoyo: true, repeat: 1 })
    .to(finger, { opacity: 0, duration: 0.3 }, '+=0.2')
    .set(card, { opacity: 1 })
    .to(card, { duration: 1.8, ease: 'power1.inOut', motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] } })
    .to(card, { opacity: 0, duration: 0.2 })
    .to(merge, { scale: 1.5, duration: 0.2, yoyo: true, repeat: 1 }, '<')
    .fromTo(synced, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 })
    .to([...bubble, synced], { opacity: 0, duration: 0.4 }, '+=1.6')
  return [scroll, blink, tl]
}

const easel: Build = (svg) => {
  const line = one<SVGPathElement>(svg, '.paint-line')
  const len = drawable(line)
  const bars = q(svg, '.paint-bar')
  const brush = one(svg, '.brush')
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
  tl.set(line, { strokeDashoffset: len })
    .set(bars, { scaleY: 0, transformOrigin: '50% 100%' })
    .to(bars, { scaleY: 1, duration: 0.3, stagger: 0.18, ease: 'back.out(2)' })
    .to(line, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, 0.2)
    .fromTo(brush, { x: 114, y: 180 }, { duration: 1.6, ease: 'none', motionPath: { path: line, align: line, alignOrigin: [0, 0] } }, 0.2)
    .to(brush, { x: 290, y: 60, duration: 0.8, ease: 'power2.inOut' }, '+=0.3')
    .to([line, ...bars], { opacity: 0, duration: 0.4 }, '+=0.8')
    .set([line, ...bars], { opacity: 1 })
  return [tl]
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

const builds: Record<string, Build> = { provision, govern, heal, easel, desk }

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
      q(svg, '.pr-btn').forEach((el) => el.classList.remove('idle'))
    })
  })
  return () => cleanups.forEach((c) => c())
}
