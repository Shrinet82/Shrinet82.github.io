import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { scenes } from './sceneMotion'
import { players, SCRUBS } from './remotion/players'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Markup is written in its finished state; everything here animates *from*
// an earlier state, so reduced motion (or no JS) shows the complete page.
const OUT = 'expo.out'
type Opts = { pin: boolean }
type Cleanup = void | (() => void)

const minsec = (s: number) => `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`

// Prepare an SVG stroke so it can be drawn by animating dashoffset.
function inkable(el: SVGGeometryElement) {
  const len = el.getTotalLength() + 1
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
  return len
}

function trackPlates(root: HTMLElement) {
  const links = root.querySelectorAll<HTMLAnchorElement>('[data-nav]')
  const now = root.querySelector('.now')
  root.querySelectorAll<HTMLElement>('[data-plate]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return
        const id = el.dataset.plate
        links.forEach((a) => a.classList.toggle('on', a.dataset.nav === id))
        const on = root.querySelector<HTMLAnchorElement>(`[data-nav="${id}"]`)
        if (now) now.textContent = on ? `${on.textContent} · ${on.title}` : ''
      },
    })
  })
  ScrollTrigger.create({
    start: 8,
    end: 'max',
    toggleClass: { targets: root.querySelector('.topbar')!, className: 'scrolled' },
  })
}

// A pen line that wanders down the margin as you read.
function thread(root: HTMLElement) {
  const svg = root.querySelector<SVGSVGElement>('.thread')!
  const path = svg.querySelector('path')!
  const build = () => {
    const h = document.documentElement.scrollHeight
    svg.setAttribute('height', String(h))
    svg.setAttribute('viewBox', `0 0 80 ${h}`)
    let d = 'M 40 0'
    for (let y = 40; y <= h; y += 40) {
      const x = 40 + Math.sin(y / 260) * 14 + Math.sin(y / 97) * 5
      d += ` L ${x.toFixed(1)} ${y}`
    }
    path.setAttribute('d', d)
    return inkable(path)
  }
  let len = build()
  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (s) => gsap.set(path, { strokeDashoffset: len * (1 - s.progress) }),
    onRefresh: (s) => {
      len = build()
      gsap.set(path, { strokeDashoffset: len * (1 - s.progress) })
    },
  })
  return () => {
    st.kill()
    gsap.set(path, { clearProps: 'all' })
  }
}

function hero(root: HTMLElement) {
  SplitText.create(root.querySelector('.hero-title')!, {
    type: 'words',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, { opacity: 0, y: 10, filter: 'blur(8px)', duration: 1.1, ease: OUT, stagger: 0.045, delay: 0.15 }),
  })
  gsap.from(root.querySelectorAll('.hero-in'), { opacity: 0, y: 14, duration: 1, ease: OUT, stagger: 0.1, delay: 0.6 })

  const art = root.querySelector<HTMLElement>('.hero-art')!
  gsap.from(art, { opacity: 0, y: 24, duration: 1.4, ease: OUT, delay: 0.3 })

  // As you leave, the scene drifts up a little slower than the page.
  gsap.to(art, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
}

function plates(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.plate').forEach((plate) => {
    const numeral = plate.querySelector('.numeral')
    if (numeral)
      gsap.fromTo(numeral, { yPercent: 40 }, { yPercent: -40, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } })

    const words = plate.querySelectorAll('.verse .vw')
    if (words.length)
      gsap.fromTo(
        words,
        { opacity: 0.1, filter: 'blur(4px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: plate.querySelector('.verse'), start: 'top 85%', end: 'bottom 45%', scrub: 0.6 },
        },
      )
  })

  root.querySelectorAll<HTMLElement>('.plate .scene-wrap').forEach((w) => {
    if (!w.querySelector('svg.scene')) return
    gsap.from(w, { opacity: 0, y: 40, rotate: 1.5, duration: 1.2, ease: OUT, scrollTrigger: { trigger: w, start: 'top 88%', once: true } })
    gsap.fromTo(w.firstElementChild, { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true } })
  })

  const inks = root.querySelectorAll('.ink-in')
  gsap.set(inks, { opacity: 0, y: 16, filter: 'blur(6px)' })
  ScrollTrigger.batch(inks, {
    start: 'top 88%',
    once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: OUT, stagger: 0.08 }),
  })
}

// Plates I-IV are Remotion compositions whose frame is the scroll position.
// Ship and Heal pin while they play; Provision and Govern play as they pass.
function scrubbed(root: HTMLElement, name: keyof typeof SCRUBS, { pin }: Opts, onProgress?: (p: number) => void): Cleanup {
  const { selector, frames, pinned, length } = SCRUBS[name]
  const stage = root.querySelector<HTMLElement>(selector)
  if (!stage) return
  const last = frames - 1
  const update = (p: number) => {
    players[name]?.seekTo(Math.round(p * last))
    onProgress?.(p)
  }
  ScrollTrigger.create(
    pin && pinned
      ? { trigger: stage, start: 'top 10%', end: `+=${length}%`, pin: true, scrub: 0.6, refreshPriority: 1, onUpdate: (s) => update(s.progress) }
      : { trigger: stage, start: 'top 85%', end: 'bottom 40%', scrub: 0.6, onUpdate: (s) => update(s.progress) },
  )
  update(0)
  return () => {
    players[name]?.seekTo(last)
    onProgress?.(1)
  }
}

function shipCounter(root: HTMLElement) {
  const total = root.querySelector('.ship-total')
  const wall = 32 * 60 + 52
  return (p: number) => {
    if (total) total.textContent = minsec(p * wall)
  }
}

function tagline(root: HTMLElement) {
  gsap.fromTo(
    root.querySelectorAll('.tagline .tw'),
    { color: 'var(--faint)', y: 8 },
    {
      color: 'var(--ink)',
      y: 0,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: root.querySelector('.tagline'), start: 'top 75%', end: 'bottom 50%', scrub: 0.5 },
    },
  )
}

// Framed studies hang at slightly different depths and drift at different
// speeds; each diagram plays when its frame arrives and replays on hover.
function glyphTimeline(svg: SVGSVGElement) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: OUT } })
  const q = <T extends Element>(sel: string) => [...svg.querySelectorAll<T>(sel)]
  const drawFrom = (el: SVGGeometryElement) => {
    const len = el.getTotalLength()
    return { strokeDasharray: len, strokeDashoffset: len }
  }
  const restore: (() => void)[] = []
  switch (svg.dataset.glyph) {
    case 'roc': {
      const curve = q<SVGPathElement>('.g-draw')[0]
      const num = q<SVGTextElement>('.g-num')[0]
      const v = { n: 0 }
      tl.fromTo(curve, drawFrom(curve), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' })
      tl.fromTo(v, { n: 0.5 }, { n: 0.78, duration: 1.2, ease: 'power2.inOut', onUpdate: () => void (num.textContent = v.n.toFixed(2)) }, 0)
      restore.push(() => (num.textContent = '0.78'))
      break
    }
    case 'trace':
      tl.from(q('.g-root'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, ease: 'none' })
      tl.from(q('.g-bar'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.35, ease: 'power1.out', stagger: 0.32 }, 0.05)
      break
    case 'stream':
      tl.from(q('.g-evt'), { x: -30, opacity: 0, duration: 0.5, stagger: 0.12 })
      tl.to(q('.g-hot'), { attr: { r: 6 }, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' })
      tl.from(q('.g-alert, .g-alert-t'), { y: -8, opacity: 0, duration: 0.4 }, '>-0.05')
      break
    case 'drift':
      tl.from(q('.g-hist'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, stagger: 0.06 })
      tl.from(q('.g-hist'), { x: -9, duration: 0.8, ease: 'power2.inOut' }, 0.2)
      break
    case 'graph':
      tl.from(q('.g-node'), { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.07 })
      q<SVGLineElement>('.g-edge').forEach((e, i) =>
        tl.fromTo(e, drawFrom(e), { strokeDashoffset: 0, duration: 0.3, ease: 'power1.out' }, 0.25 + i * 0.09),
      )
      break
    case 'pods': {
      const sick = q<SVGRectElement>('.g-pod-sick')[0]
      const count = q<SVGTSpanElement>('.g-count')[0]
      const v = { n: 0 }
      tl.call(() => sick.classList.add('sick'))
      tl.set(q('.g-fix'), { opacity: 0 })
      tl.fromTo(v, { n: 0 }, { n: 4, duration: 1.2, ease: 'steps(4)', onUpdate: () => void (count.textContent = String(Math.round(v.n))) })
      tl.to(sick, { opacity: 0.3, duration: 0.15, yoyo: true, repeat: 3 }, '<')
      tl.call(() => sick.classList.remove('sick'))
      tl.to(q('.g-fix'), { opacity: 1, duration: 0.4 })
      restore.push(() => {
        sick.classList.remove('sick')
        count.textContent = '4'
      })
      break
    }
    case 'rule': {
      q<SVGTextElement>('.g-type').forEach((t, i) => {
        const full = t.dataset.full ?? ''
        const v = { n: 0 }
        tl.fromTo(
          v,
          { n: 0 },
          { n: full.length, duration: full.length * 0.045, ease: 'none', onUpdate: () => void (t.textContent = full.slice(0, Math.round(v.n))) },
          i === 0 ? 0 : '+=0.25',
        )
        restore.push(() => (t.textContent = full))
      })
      tl.from(q('.g-kw'), { opacity: 0, duration: 0.3, stagger: 0.5 }, 0)
      break
    }
  }
  return { tl, restore: () => restore.forEach((r) => r()) }
}

function studies(root: HTMLElement): Cleanup {
  const hover = window.matchMedia('(hover: hover)').matches
  const cleanups: (() => void)[] = []
  root.querySelectorAll<HTMLElement>('.frame').forEach((frame) => {
    const speed = Number(frame.dataset.speed ?? 1)
    gsap.fromTo(
      frame,
      { y: (speed - 1) * 260 },
      { y: -(speed - 1) * 260, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
    gsap.from(frame.querySelector('.frame-inner'), {
      opacity: 0,
      rotate: -4,
      y: 30,
      duration: 1.1,
      ease: OUT,
      scrollTrigger: { trigger: frame, start: 'top 90%', once: true },
    })
    const svg = frame.querySelector<SVGSVGElement>('.glyph')
    if (!svg) return
    const { tl, restore } = glyphTimeline(svg)
    ScrollTrigger.create({ trigger: frame, start: 'top 80%', once: true, onEnter: () => void tl.play(0) })
    const replay = () => {
      if (!tl.isActive()) tl.play(0)
    }
    if (hover) frame.addEventListener('mouseenter', replay)
    cleanups.push(() => {
      frame.removeEventListener('mouseenter', replay)
      tl.progress(1).kill()
      restore()
    })
  })
  return () => cleanups.forEach((c) => c())
}

function letters(root: HTMLElement) {
  const under = root.querySelector<SVGPathElement>('.brush-under path')!
  const len = inkable(under)
  gsap.fromTo(under, { strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.letters-title', start: 'top 85%', end: 'top 45%', scrub: 0.6 } })
  SplitText.create(root.querySelector('.letters-title')!, {
    type: 'words',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        opacity: 0,
        y: 24,
        filter: 'blur(8px)',
        duration: 1.1,
        ease: OUT,
        stagger: 0.08,
        scrollTrigger: { trigger: '.letters-title', start: 'top 85%', once: true },
      }),
  })
}

export function setupMotion(root: HTMLElement) {
  trackPlates(root)
  const mm = gsap.matchMedia()
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      pin: '(min-width: 960px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)',
      wide: '(min-width: 1180px)',
    },
    (ctx) => {
      const { motion, pin, wide } = ctx.conditions as { motion: boolean; pin: boolean; wide: boolean }
      if (!motion) return
      const cleanups: Cleanup[] = []
      hero(root)
      plates(root)
      cleanups.push(scrubbed(root, 'golden', { pin }))
      cleanups.push(scrubbed(root, 'conveyor', { pin }, shipCounter(root)))
      cleanups.push(scrubbed(root, 'lighthouse', { pin }))
      cleanups.push(scrubbed(root, 'loop', { pin }))
      tagline(root)
      cleanups.push(studies(root))
      letters(root)
      cleanups.push(scenes(root))
      if (wide) cleanups.push(thread(root))
      return () => cleanups.forEach((c) => c && c())
    },
  )
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  return () => mm.revert()
}
