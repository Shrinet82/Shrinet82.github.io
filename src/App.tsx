import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { glyphTimelines, setupMotion } from './motion'
import Glyph from './Glyphs'
import { DeskScene, EaselScene } from './Scenes'
import { ConveyorPlayer, FPS, FRAMES, frameAt, GoldenPathPlayer, HarbourPlayer, LighthousePlayer, LoopPlayer } from './remotion/players'
import { useScrollProgress } from './scroll'
import { pipelineSecs } from './remotion/Conveyor'
import {
  awards,
  certs,
  education,
  elsewhere,
  filmSteps,
  ledger,
  pipeline,
  plates,
  profile,
  provision,
  repos,
  sent,
  stack,
  upstream,
  verses,
} from './content'

const ext = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

function Links({ links }: { links: { label: string; href: string }[] }) {
  return (
    <div className="links">
      {links.map((l) => (
        <a key={l.href} href={l.href} {...ext(l.href)}>
          {l.label} <Arrow />
        </a>
      ))}
    </div>
  )
}

// Shared SVG filters: a pen wobble for ink lines and a bleeding edge for
// watercolour washes.
function Defs() {
  return (
    <svg className="defs" aria-hidden="true" focusable="false">
      <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="1" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
      <filter id="wash" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="8" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46" result="d" />
        <feGaussianBlur in="d" stdDeviation="7" />
      </filter>
    </svg>
  )
}

function Verse({ lines }: { lines: string[] }) {
  return (
    <blockquote className="verse">
      {lines.map((l, i) => (
        <span key={i} className="verse-line">
          {l.split(' ').map((w, j) => (
            <span key={j} className="vw">
              {w}{' '}
            </span>
          ))}
        </span>
      ))}
    </blockquote>
  )
}

function PlateHead({
  roman,
  label,
  title,
  verse,
  scene,
}: {
  roman: string
  label: string
  title: string
  verse: string[]
  scene?: React.ReactNode
}) {
  return (
    <div className={`plate-top ${scene ? '' : 'plate-top-solo'}`}>
      <header className="plate-head">
        <span className="numeral" aria-hidden="true">
          {roman}
        </span>
        <p className="plate-label mono ink-in">
          Plate {roman} · {label}
        </p>
        <h2 className="plate-title ink-in">{title}</h2>
        <Verse lines={verse} />
      </header>
      {scene && <figure className="scene-wrap">{scene}</figure>}
    </div>
  )
}

// A film pinned under the top bar while the scroll plays it. The section is
// taller than the screen by `len`; the film stays put for that distance,
// finishes, holds its last frame, then scrolls away with the page. The
// caption under it names the step on screen.
function Film({
  name,
  len,
  wide = false,
  aside,
  children,
}: {
  name: keyof typeof FRAMES
  len: number
  wide?: boolean
  aside?: (beat: number) => React.ReactNode
  children: (progress: number) => React.ReactNode
}) {
  const [ref, p] = useScrollProgress<HTMLDivElement>()
  const steps = filmSteps[name]
  const frame = frameAt(p, FRAMES[name])
  const beat = (frame * 30) / FPS[name]
  let on = 0
  steps.forEach((s, i) => beat >= s.at && (on = i))
  return (
    <div ref={ref} className={`film-stage ${wide ? 'film-stage-wide' : ''}`} style={{ '--len': `${len}vh` } as React.CSSProperties}>
      <div className="film-pin">
        <div className="film-box">{children(p)}</div>
        <div className="film-caption">
          <ol className="film-steps" aria-hidden="true">
            {steps.map((s, i) => (
              <li key={s.title} className={i === on ? 'on' : i < on ? 'done' : undefined}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span> {s.title}
              </li>
            ))}
          </ol>
          <p className="film-now" aria-live="off">
            <span className="mono">
              fig. {on + 1} of {steps.length}
            </span>{' '}
            <b className="film-title">{steps[on].title}.</b> {steps[on].text}
          </p>
          {aside?.(beat)}
        </div>
      </div>
    </div>
  )
}

const minsec = (s: number) => `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, '0')}s`

function Topbar() {
  return (
    <header className="topbar">
      <a href="#top" className="signature">
        Shashwat <em>Pratap Singh</em>
      </a>
      <nav className="plates-nav" aria-label="Plates">
        {plates.map((p) => (
          <a key={p.id} href={`#${p.id}`} data-nav={p.id} title={p.label}>
            {p.roman}
          </a>
        ))}
      </nav>
      <span className="now mono" aria-hidden="true" />
      <a href={`mailto:${profile.email}`} className="write mono">
        Write to me
      </a>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top" data-plate="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="kicker mono hero-in">Painter · poet · platform engineer</p>
          <h1 className="hero-title">
            Some people write poems about 3am. <em>I make sure nobody has to be awake for it.</em>
          </h1>
          <p className="hero-dek hero-in">
            I&apos;m {profile.name}. I paint, I write, and since January 2025 I&apos;ve worked independently on
            internal platforms, GitOps delivery and policy guardrails for 4 engineering teams. This sketchbook holds
            the engineering, including an SRE agent that took 1st place at the Agents of SigNoz hackathon.
          </p>
          <div className="actions hero-in">
            <a className="btn btn-ink" href="#provision">
              Open the sketchbook
            </a>
            <a className="btn btn-line" href={`mailto:${profile.email}`}>
              Write to me
            </a>
          </div>
        </div>
        <figure className="hero-art">
          <HarbourPlayer />
        </figure>
        <dl className="ledger hero-in">
          {ledger.map((l) => (
            <div key={l.what}>
              <dt>{l.big}</dt>
              <dd>
                {l.what}
                <span className="mono">{l.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Provision() {
  return (
    <section className="plate" id="provision" data-plate="provision">
      <div className="wrap">
        <PlateHead roman="I" label="Provision" title="Infrastructure used to be a ticket." verse={verses.provision} />
      </div>
      <Film name="golden" len={200}>
        {(p) => <GoldenPathPlayer progress={p} />}
      </Film>
      <div className="wrap">
        <div className="two facts">
          <p className="prose">{provision.newWay}</p>
          <Links links={repos.opsie} />
        </div>
      </div>
    </section>
  )
}

function Ship() {
  return (
    <section className="plate" id="ship" data-plate="ship">
      <div className="wrap">
        <PlateHead roman="II" label="Ship" title="Every image rides through five checks." verse={verses.ship} />
      </div>
      <Film
        name="conveyor"
        len={280}
        wide
        aside={(beat) => (
          <p className="film-clock">
            <span className="mono">commit → verified deploy</span>
            <strong>{minsec(pipelineSecs(beat))}</strong>
          </p>
        )}
      >
        {(p) => <ConveyorPlayer progress={p} />}
      </Film>
      <div className="wrap">
        <div className="ship-foot">
          <p className="big-num">
            <span className="mono">commit → verified deploy</span>
            <strong>{pipeline.total}</strong>
          </p>
          <div>
            <p className="prose">
              A zero-trust Azure pipeline for AKS: secrets scan, IaC scan, image scan with SBOM, then DAST against the
              running app. Trivy found two critical CVEs; both were fixed with dependency upgrades and a hardened
              rebuild. Secrets arrive at runtime from Key Vault CSI.
            </p>
            <Links links={repos.devsecops} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Govern() {
  return (
    <section className="plate" id="govern" data-plate="govern">
      <div className="wrap">
        <PlateHead roman="III" label="Govern" title="Then a glitch started spawning buckets." verse={verses.govern} />
      </div>
      <Film name="lighthouse" len={220}>
        {(p) => <LighthousePlayer progress={p} />}
      </Film>
      <div className="wrap">
        <div className="two facts">
          <p className="prose">
            <strong className="fact">Mark, then sweep.</strong> Cloud Custodian policies run across AWS and Azure:
            resources that break a rule are tagged, then removed, and rules like SSH open to 0.0.0.0/0 are revoked with
            an audit trail.
          </p>
          <div>
            <p className="prose">
              <strong className="fact">0 manual steps</strong> per incident, down from seven. The runaway-resource
              incident went from 4 to 24 hours to under 2 minutes.
            </p>
            <Links links={repos.aegis} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Heal() {
  return (
    <section className="plate" id="heal" data-plate="heal">
      <div className="wrap">
        <PlateHead roman="IV" label="Heal" title="So I taught the cluster to open its own PRs." verse={verses.heal} />
      </div>
      <Film name="loop" len={300} wide>
        {(p) => <LoopPlayer progress={p} />}
      </Film>
      <div className="wrap">
        <div className="heal-foot">
          <p className="prose">
            Aegis Observe: rule-based signal detection over SigNoz, an LLM that selects one remediation, a human who
            keeps the veto in Slack, and GitOps that keeps the record. 1st place at the Agents of SigNoz hackathon.
          </p>
          <Links links={repos.observe} />
        </div>
      </div>
    </section>
  )
}

function Tagline() {
  const text = 'Good infrastructure is boring to operate. Getting it there is the art.'
  return (
    <section className="tagline" aria-label={text}>
      <p className="wrap tagline-text" aria-hidden="true">
        {text.split(' ').map((w, i) => (
          <span key={i} className="tw">
            {w}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}

// Plate V is a pinned gallery walk. The section holds still under the top
// bar while the scroll carries the wall of framed studies sideways, one pixel
// across for each pixel down. Each diagram draws itself as its frame comes
// to the middle, is complete by then, and undraws if you scroll back.
const GALLERY_HOLD = 0.92
function Studies() {
  const [ref, p] = useScrollProgress<HTMLDivElement>()
  const track = useRef<HTMLDivElement>(null)
  const [geo, setGeo] = useState({ travel: 0, view: 1, centers: [] as number[] })
  const [ready, setReady] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      const t = track.current
      if (!t) return
      const view = t.parentElement!.clientWidth
      const frames = [...t.querySelectorAll<HTMLElement>('.frame')]
      setGeo({ travel: Math.max(0, t.scrollWidth - view), view, centers: frames.map((f) => f.offsetLeft + f.offsetWidth / 2) })
    }
    measure()
    document.fonts?.ready.then(measure)
    const onReady = () => setReady((n) => n + 1)
    window.addEventListener('resize', measure)
    window.addEventListener('glyphs-ready', onReady)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('glyphs-ready', onReady)
    }
  }, [])

  // the stage's height comes from the measured wall; triggers below it move
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [geo.travel])

  const k = Math.min(1, p / GALLERY_HOLD)
  const x = k * geo.travel

  // each diagram's progress: 0 as its frame enters on the right, 1 by the time
  // it reaches the middle of the wall
  useLayoutEffect(() => {
    track.current?.querySelectorAll<SVGSVGElement>('.frame .glyph').forEach((svg, i) => {
      const c = (geo.centers[i] ?? 0) - x
      const g = Math.min(1, Math.max(0, (geo.view * 0.96 - c) / (geo.view * 0.46)))
      glyphTimelines.get(svg)?.progress(g)
    })
  }, [x, geo, ready])

  return (
    <section className="plate plate-gallery" id="studies" data-plate="studies">
      <div className="gallery-stage" ref={ref} style={{ height: `calc(100vh + ${Math.round(geo.travel / GALLERY_HOLD)}px)` }}>
        <div className="gallery-pin">
          <div className="gallery-track" ref={track} style={{ transform: `translate3d(${-x}px, 0, 0)` }}>
            <div className="gallery-intro">
          <header className="plate-head">
            <span className="numeral" aria-hidden="true">
              V
            </span>
            <p className="plate-label mono ink-in">Plate V · Studies</p>
            <h2 className="plate-title ink-in">Smaller studies, same hand.</h2>
            <p className="prose lead ink-in">
              Model serving, security streams, and one farm that pages you before the plants die.
            </p>
          </header>
          <figure className="scene-wrap scene-wrap-sm">
            <EaselScene />
          </figure>
            </div>
          {elsewhere.map((p, i) => (
            <article key={p.title} className="frame">
              <div className="frame-inner" style={{ '--tilt': `${[-1.4, 0.9, -0.6, 1.2, -1, 0.7, -0.8][i % 7]}deg` } as React.CSSProperties}>
                <div className="mat">{p.glyph && <Glyph kind={p.glyph} />}</div>
                {p.caption && <span className="fig-cap">{p.caption}</span>}
                <div className="label">
                  <h3>{p.title}</h3>
                  <p className="mono medium">{p.kind}</p>
                  <p className="label-line">{p.line}</p>
                  <Links links={p.links} />
                </div>
              </div>
            </article>
          ))}
          </div>
          <div className="gallery-progress" aria-hidden="true">
            <i style={{ transform: `scaleX(${k})` }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Catalogue() {
  return (
    <section className="plate" id="catalogue" data-plate="catalogue">
      <div className="wrap">
        <header className="plate-head">
          <span className="numeral" aria-hidden="true">
            VI
          </span>
          <p className="plate-label mono ink-in">Plate VI · Catalogue</p>
          <h2 className="plate-title ink-in">Collections, honours, materials.</h2>
          <p className="prose lead ink-in">An artist&apos;s CV, kept by an engineer.</p>
        </header>
        <div className="cv">
          <div className="cv-block ink-in">
            <h3 className="cv-h mono">Collections · merged upstream</h3>
            <ul>
              {upstream.slice(0, 2).map((u) => (
                <li key={u.where}>
                  <a href={u.href} {...ext(u.href)}>
                    <strong>{u.where}</strong> <span className="mono stars">{u.stars}</span> <span className="mono tag">{u.state}</span>
                  </a>
                  <span>{u.what}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cv-block ink-in">
            <h3 className="cv-h mono">Publications</h3>
            <ul>
              {upstream.slice(2).map((u) => (
                <li key={u.where}>
                  <a href={u.href} {...ext(u.href)}>
                    <strong>{u.where}</strong> <Arrow />
                  </a>
                  <span>{u.what}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cv-block ink-in">
            <h3 className="cv-h mono">Sent upstream · pull requests opened</h3>
            <ul>
              {sent.map((u) => (
                <li key={u.where}>
                  <a href={u.href} {...ext(u.href)}>
                    <strong>{u.where}</strong> <span className="mono stars">{u.stars}</span> <Arrow />
                  </a>
                  <span>{u.what}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cv-block ink-in">
            <h3 className="cv-h mono">Honours</h3>
            <ul>
              {awards.map((a) => (
                <li key={a.what}>
                  <strong>{a.what}</strong>
                  <span>{a.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cv-block ink-in">
            <h3 className="cv-h mono">Training</h3>
            <ul className="compact">
              {certs.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="cv-block cv-wide ink-in">
            <h3 className="cv-h mono">Materials</h3>
            <dl>
              {stack.map(([k, v]) => (
                <div key={k}>
                  <dt className="mono">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <div>
                <dt className="mono">Schooling</dt>
                <dd>{education}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

function Letters() {
  return (
    <footer className="plate letters" id="contact" data-plate="contact">
      <div className="wrap">
        <p className="plate-label mono ink-in">Plate VII · Letters</p>
        <h2 className="letters-title">
          Hand me{' '}
          <span className="underlined">
            the pager.
            <svg className="brush-under" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true">
              <path d="M6 20 C 90 8, 210 26, 394 12" filter="url(#rough)" />
            </svg>
          </span>
        </h2>
        <div className="letters-grid">

          <figure className="portrait ink-in">
            <img src="/assets/profile.jpg" alt="Shashwat Pratap Singh" width="200" height="250" loading="lazy" />
          </figure>
          <div className="ink-in">
            <p className="prose">
              {profile.availability}. I live in {profile.location} and work remotely. Tell me what keeps paging you.
            </p>
            <div className="actions">
              <a className="btn btn-ink" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
            <div className="links">
              <a href={profile.github} {...ext(profile.github)}>
                GitHub <Arrow />
              </a>
              <a href={profile.linkedin} {...ext(profile.linkedin)}>
                LinkedIn <Arrow />
              </a>
            </div>
          </div>
          <figure className="scene-wrap letters-scene">
            <DeskScene />
          </figure>
        </div>
        <p className="colophon mono">
          © {new Date().getFullYear()} {profile.name}. Set in Fraunces, Instrument Sans and IBM Plex Mono. Ink on
          paper; the pigments mean what they mean on a dashboard.
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => setupMotion(root.current!), { scope: root })
  return (
    <div ref={root} className="page">
      <Defs />
      <a className="skip" href="#provision">
        Skip to plate one
      </a>
      <svg className="thread" aria-hidden="true">
        <path />
      </svg>
      <Topbar />
      <main>
        <Hero />
        <Provision />
        <Ship />
        <Govern />
        <Heal />
        <Tagline />
        <Studies />
        <Catalogue />
      </main>
      <Letters />
    </div>
  )
}
