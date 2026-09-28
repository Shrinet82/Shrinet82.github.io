import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

// Easing: strong ease-out for entrances, none for scrubbed timelines so the
// scroll position maps linearly onto the story.
const OUT = 'expo.out'

// The markup is written in its finished state. Everything here animates *from*
// an earlier state, so with reduced motion (or no JS) the page is complete.

const mmss = (m: number) => `${String(Math.round(m)).padStart(2, '0')}:00`
const minsec = (s: number) => `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`

function trackChapters(root: HTMLElement) {
  const railLinks = root.querySelectorAll<HTMLAnchorElement>('[data-rail]')
  const nowNum = root.querySelector('.now-num')
  const nowLabel = root.querySelector('.now-label')
  root.querySelectorAll<HTMLElement>('[data-chapter]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return
        const id = el.dataset.chapter
        railLinks.forEach((a) => a.classList.toggle('on', a.dataset.rail === id))
        const link = root.querySelector<HTMLAnchorElement>(`[data-rail="${id}"]`)
        if (nowNum && nowLabel && link) {
          nowNum.textContent = link.querySelector('.mono')?.textContent ?? ''
          nowLabel.textContent = link.querySelector('.rail-label')?.textContent ?? ''
        }
      },
    })
  })

  gsap.to(root.querySelector('.rail-fill'), {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: true },
  })

  ScrollTrigger.create({
    start: 8,
    end: 'max',
    toggleClass: { targets: root.querySelector('.topbar')!, className: 'scrolled' },
  })
}

function heroIntro(root: HTMLElement) {
  const title = root.querySelector('.hero-title')!
  SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, { yPercent: 105, duration: 1.1, ease: OUT, stagger: 0.09, delay: 0.1 }),
  })
  gsap.from(root.querySelectorAll('.hero-in'), {
    y: 18,
    opacity: 0,
    duration: 0.9,
    ease: OUT,
    stagger: 0.08,
    delay: 0.35,
  })
}

// Replays the incident log line by line, then flips the status to resolved.
function terminal(root: HTMLElement) {
  const lines = root.querySelectorAll<HTMLElement>('.term-line')
  const state = root.querySelector<HTMLElement>('.term-state')!
  const tl = gsap.timeline({ delay: 0.9 })
  tl.call(() => state.setAttribute('data-state', 'firing'))
  lines.forEach((line, i) => {
    tl.from(line, { opacity: 0, x: -8, duration: 0.35, ease: OUT }, i === 0 ? 0 : i === 5 ? '+=1.1' : '+=0.45')
  })
  tl.call(() => state.setAttribute('data-state', 'resolved'), [], '+=0.2')
  tl.from(root.querySelector('.term-foot span'), { opacity: 0, duration: 0.5, ease: OUT })

  const replay = root.querySelector('.replay')
  const onReplay = () => tl.restart(false)
  replay?.addEventListener('click', onReplay)
  return () => replay?.removeEventListener('click', onReplay)
}

function reveals(root: HTMLElement) {
  const items = root.querySelectorAll('.rv')
  gsap.set(items, { opacity: 0, y: 22 })
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: OUT, stagger: 0.07 }),
  })

  root.querySelectorAll('.split').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 1,
          ease: OUT,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
    })
  })
}

type Scroll = { pin: boolean }

// 01: the clocks run down from the ticket-queue time to the golden-path time.
function provision(root: HTMLElement, { pin }: Scroll) {
  const section = root.querySelector<HTMLElement>('[data-pin="provision"]')!
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: pin
      ? { trigger: section, start: 'top top', end: '+=130%', pin: true, scrub: 0.6, refreshPriority: 1 }
      : { trigger: section.querySelector('.provision-viz'), start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
  })

  section.querySelectorAll<HTMLElement>('.clock').forEach((c, i) => {
    const before = Number(c.dataset.before)
    const after = Number(c.dataset.after)
    const num = c.querySelector('.clock-num')!
    const counter = { v: before }
    tl.fromTo(c.querySelector('.bar'), { width: `${(before / 60) * 100}%` }, { width: `${(after / 60) * 100}%`, duration: 1 }, i * 0.15)
    tl.fromTo(
      counter,
      { v: before },
      { v: after, duration: 1, onUpdate: () => void (num.textContent = mmss(counter.v)) },
      i * 0.15,
    )
  })
  tl.fromTo(
    section.querySelectorAll('.oldway li'),
    { backgroundSize: '0% 1px', color: 'var(--text)' },
    { backgroundSize: '100% 1px', color: 'var(--faint)', duration: 0.25, stagger: 0.12 },
    0.2,
  )
  tl.from(section.querySelector('.newway'), { opacity: 0, y: 14, duration: 0.4 }, '>-0.1')
}

// 02: a build moves through the five gates; Trivy flags two CVEs mid-way.
function ship(root: HTMLElement, { pin }: Scroll) {
  const section = root.querySelector<HTMLElement>('[data-pin="ship"]')!
  const pipe = section.querySelector<HTMLElement>('.pipe')!
  const stages = [...pipe.querySelectorAll<HTMLElement>('.stage')]
  const total = section.querySelector('.pipe-total strong')!
  const wall = 32 * 60 + 52
  pipe.classList.add('is-live')

  const update = (p: number) => {
    stages.forEach((s, i) => {
      const at = Number(s.dataset.at)
      const prev = i === 0 ? 0 : Number(stages[i - 1].dataset.at)
      s.classList.toggle('running', p > prev && p < at)
      s.classList.toggle('done', p >= at - 0.001)
      if (s.querySelector('.cve')) s.classList.toggle('cve-ok', p > prev + (at - prev) * 0.7)
      if (s.querySelector('.cve')) s.classList.toggle('cve-seen', p > prev + (at - prev) * 0.25)
    })
    total.textContent = minsec(p * wall)
  }

  gsap.fromTo(
    pipe.querySelector('.pipe-fill'),
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: pin
        ? { trigger: section, start: 'top top', end: '+=150%', pin: true, scrub: 0.6, refreshPriority: 1, onUpdate: (s) => update(s.progress) }
        : { trigger: pipe, start: 'top 80%', end: 'bottom 35%', scrub: 0.6, onUpdate: (s) => update(s.progress) },
    },
  )
  update(0)
  return () => {
    pipe.classList.remove('is-live')
    stages.forEach((s) => s.classList.remove('running', 'done', 'cve-ok', 'cve-seen'))
    total.textContent = '32m 52s'
  }
}

// 03: both response curves draw as the chart scrolls through.
function govern(root: HTMLElement) {
  const chart = root.querySelector<HTMLElement>('.chart')!
  const draw = (sel: string) => {
    const p = chart.querySelector<SVGPathElement>(sel)!
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len })
    return p
  }
  const human = draw('.line-human')
  const aegis = draw('.line-aegis')
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: chart, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 },
  })
  tl.fromTo(aegis, { strokeDashoffset: aegis.getTotalLength() }, { strokeDashoffset: 0, duration: 0.3 }, 0)
    .from(chart.querySelectorAll('.dot-aegis, .lbl-aegis'), { opacity: 0, duration: 0.08 }, 0.12)
    .fromTo(human, { strokeDashoffset: human.getTotalLength() }, { strokeDashoffset: 0, duration: 1 }, 0)
    .from(chart.querySelectorAll('.human-band, .band-label'), { opacity: 0, duration: 0.2 }, 0.55)
}

// 04: the five steps of the loop light up one at a time while pinned.
function heal(root: HTMLElement, { pin }: Scroll) {
  const section = root.querySelector<HTMLElement>('[data-pin="heal"]')!
  const list = section.querySelector<HTMLElement>('.steps')!
  const steps = [...list.querySelectorAll<HTMLElement>('.step')]
  if (!pin) {
    gsap.from(steps, {
      opacity: 0,
      y: 18,
      duration: 0.8,
      ease: OUT,
      stagger: 0.1,
      scrollTrigger: { trigger: list, start: 'top 80%', once: true },
    })
    return
  }
  list.classList.add('is-live')
  const card = section.querySelector<HTMLElement>('.slack')
  const set = (p: number) => {
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length))
    steps.forEach((s, i) => s.classList.toggle('active', i <= idx))
    list.style.setProperty('--p', String(p))
    if (card) card.dataset.step = String(idx + 1)
  }
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=160%',
    pin: true,
    scrub: 0.6,
    refreshPriority: 1,
    snap: { snapTo: 1 / (steps.length - 1), duration: 0.35, ease: 'power2.inOut' },
    onUpdate: (s) => set(s.progress),
  })
  set(0)
  return () => {
    list.classList.remove('is-live')
    steps.forEach((s) => s.classList.remove('active'))
    if (card) card.dataset.step = '5'
  }
}

// One small timeline per project diagram. The SVGs are drawn finished, so
// every timeline animates *from* an earlier state and ends where it started.
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

function glyphs(root: HTMLElement) {
  const hover = window.matchMedia('(hover: hover)').matches
  const cleanups: (() => void)[] = []
  root.querySelectorAll<HTMLElement>('.index-row').forEach((row) => {
    const svg = row.querySelector<SVGSVGElement>('.glyph')
    if (!svg) return
    const { tl, restore } = glyphTimeline(svg)
    tl.progress(0).pause()
    ScrollTrigger.create({ trigger: row, start: 'top 85%', once: true, onEnter: () => void tl.play(0) })
    const replay = () => {
      if (!tl.isActive()) tl.play(0)
    }
    if (hover) row.addEventListener('mouseenter', replay)
    cleanups.push(() => {
      row.removeEventListener('mouseenter', replay)
      tl.progress(1).kill()
      restore()
    })
  })
  return () => cleanups.forEach((c) => c())
}

function tagline(root: HTMLElement) {
  const words = root.querySelectorAll('.tagline .w')
  gsap.fromTo(
    words,
    { opacity: 0.18 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: root.querySelector('.tagline'), start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
    },
  )
}

export function setupMotion(root: HTMLElement) {
  trackChapters(root)

  const mm = gsap.matchMedia()
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      pin: '(min-width: 900px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const { motion, pin } = ctx.conditions as { motion: boolean; pin: boolean }
      if (!motion) return
      const cleanups: (void | (() => void))[] = []
      heroIntro(root)
      cleanups.push(terminal(root))
      reveals(root)
      provision(root, { pin })
      cleanups.push(ship(root, { pin }))
      govern(root)
      cleanups.push(heal(root, { pin }))
      tagline(root)
      cleanups.push(glyphs(root))
      return () => cleanups.forEach((c) => c && c())
    },
  )

  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  return () => mm.revert()
}
