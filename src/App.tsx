import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { setupMotion } from './motion'
import Glyph from './Glyphs'
import {
  awards,
  certs,
  education,
  elsewhere,
  healSteps,
  pipeline,
  plates,
  profile,
  provision,
  repos,
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
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
      <filter id="wash" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="8" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="46" result="d" />
        <feGaussianBlur in="d" stdDeviation="7" />
      </filter>
    </svg>
  )
}

type Pigment = 'ultra' | 'ochre' | 'vermilion' | 'sap'
function Wash({ className = '', blobs }: { className?: string; blobs: [Pigment, number, number, number, number][] }) {
  return (
    <svg className={`wash ${className}`} viewBox="0 0 400 300" aria-hidden="true">
      <g filter="url(#wash)">
        {blobs.map(([c, cx, cy, rx, ry], i) => (
          <ellipse key={i} className={`pig-${c}`} cx={cx} cy={cy} rx={rx} ry={ry} />
        ))}
      </g>
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

function PlateHead({ roman, label, title, verse }: { roman: string; label: string; title: string; verse: string[] }) {
  return (
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
  )
}

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

// The Kubernetes wheel, painted: seven spokes, one brush ring.
function HeroArt() {
  const cx = 200
  const cy = 200
  const pts = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(a) * 150, cy + Math.sin(a) * 150, cx + Math.cos(a) * 40, cy + Math.sin(a) * 40]
  })
  const ring = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z'
  return (
    <figure className="hero-art">
      <Wash className="wash-hero" blobs={[['ultra', 190, 150, 150, 120], ['ochre', 290, 210, 90, 70]]} />
      <svg viewBox="0 0 400 400" className="wheel" role="img" aria-label="A hand-painted Kubernetes wheel">
        <g filter="url(#rough)">
          <path className="ink-draw brush" d={ring} />
          {pts.map(([x, y, x2, y2], i) => (
            <line key={i} className="ink-draw spoke" x1={x2} y1={y2} x2={x} y2={y} />
          ))}
          <circle className="ink-draw hub" cx={cx} cy={cy} r="40" />
        </g>
      </svg>
      <figcaption className="mono fig">fig. 1, the wheel. Seven spokes, painted by hand.</figcaption>
    </figure>
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
        <HeroArt />
      </div>
    </section>
  )
}

const mins = (m: number) => `${m} min`

function Provision() {
  return (
    <section className="plate" id="provision" data-plate="provision">
      <div className="wrap">
        <PlateHead roman="I" label="Provision" title="Infrastructure used to be a ticket." verse={verses.provision} />
        <div className="two">
          <figure className="sketch">
            <svg viewBox="0 0 520 250" role="img" aria-label="A pile of tickets crossed out, becoming one form">
              <g filter="url(#rough)">
                {[
                  [30, 60, -7],
                  [52, 84, 3],
                  [38, 112, -2],
                ].map(([x, y, r], i) => (
                  <g key={i} transform={`rotate(${r} ${x + 70} ${y + 30})`}>
                    <rect className="ink-draw" x={x} y={y} width="140" height="62" />
                    <line className="ink-draw thin" x1={x + 14} y1={y + 20} x2={x + 110} y2={y + 20} />
                    <line className="ink-draw thin" x1={x + 14} y1={y + 36} x2={x + 86} y2={y + 36} />
                  </g>
                ))}
                <path className="ink-draw strike" d="M24 190 L 206 58" />
                <path className="ink-draw" d="M228 124 C 262 100, 292 100, 318 122" />
                <path className="ink-draw" d="M308 112 L 320 124 L 304 130" />
                <rect className="ink-draw" x="340" y="44" width="150" height="170" />
                {[78, 110, 142].map((y) => (
                  <line key={y} className="ink-draw thin" x1="356" y1={y} x2="474" y2={y} />
                ))}
                <rect className="ink-draw fill-ultra" x="356" y="166" width="70" height="26" />
                <path className="ink-draw check" d="M442 176 l 8 9 l 18 -20" />
              </g>
              <text className="note" x="36" y="228">
                ticket queue
              </text>
              <text className="note" x="352" y="234">
                one Backstage form
              </text>
            </svg>
          </figure>
          <div>
            <ul className="clocks">
              {provision.rows.map((r) => (
                <li className="clock" key={r.what} data-before={r.before} data-after={r.after}>
                  <span className="clock-what">{r.what}</span>
                  <svg className="clock-stroke" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true">
                    <line className="ghost" x1="4" y1="7" x2={4 + (r.before / 60) * 292} y2="7" />
                    <line className="stroke" x1="4" y1="7" x2={4 + (r.after / 60) * 292} y2="7" />
                  </svg>
                  <span className="clock-num">
                    <b>{mins(r.after)}</b>
                    <s className="mono">was {r.before}</s>
                  </span>
                </li>
              ))}
            </ul>
            <p className="prose">{provision.newWay}</p>
            <Links links={repos.opsie} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Ship() {
  const total = pipeline.stages.reduce((a, s) => a + s.secs, 0)
  return (
    <section className="plate" id="ship" data-plate="ship">
      <div className="wrap">
        <PlateHead roman="II" label="Ship" title="Every commit walks through five doors." verse={verses.ship} />
      </div>
      <div className="wrap stage" data-stage="ship">
        <div className="gates">
          <span className="drop" aria-hidden="true" />
          <span className="ground" aria-hidden="true" />
          {pipeline.stages.map((s, i) => (
            <div
              key={s.name}
              className={`gate ${s.flag ? 'gate-flag' : ''}`}
              style={{ flexGrow: s.secs / total }}
              data-at={pipeline.stages.slice(0, i + 1).reduce((a, x) => a + x.secs, 0) / total}
            >
              <span className="arch" aria-hidden="true" />
              {s.flag && (
                <span className="blot" aria-hidden="true">
                  <Wash className="blot-red" blobs={[['vermilion', 200, 150, 120, 100]]} />
                  <Wash className="blot-green" blobs={[['sap', 200, 150, 130, 110]]} />
                </span>
              )}
              <span className="gate-name">{s.name}</span>
              <span className="gate-tools mono">{s.tools}</span>
              <span className="gate-time mono">{s.time}</span>
              {s.flag && (
                <span className="gate-note mono">
                  <span className="n-red">2 critical CVEs</span>
                  <span className="n-green">patched, rebuilt</span>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="ship-foot">
          <p className="big-num">
            <span className="mono">commit → verified deploy</span>
            <strong className="ship-total">{pipeline.total}</strong>
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
        <figure className="chart">
          <div className="chart-scroll">
            <Wash className="wash-band" blobs={[['vermilion', 200, 150, 150, 140]]} />
            <svg className="chart-svg" viewBox="0 0 880 340" role="img" aria-labelledby="gt gd">
              <title id="gt">Runaway resources over time</title>
              <desc id="gd">
                Waiting for a human, the count climbs for 4 to 24 hours. With Aegis policies it is contained in under 2
                minutes.
              </desc>
              <g filter="url(#rough)">
                <line className="axis" x1="40" x2="860" y1="300" y2="300" />
                <path
                  className="ink-draw line-human"
                  d="M40 300 C 120 280, 200 250, 318 220 L 336 214 C 420 190, 500 150, 600 110 C 680 80, 760 60, 820 52 L 830 300"
                />
                <path className="ink-draw line-aegis" d="M40 300 C 80 288, 115 272, 136 264 L 146 300 L 860 300" />
              </g>
              <text className="note" x="40" y="326">
                t = 0
              </text>
              <text className="note" x="128" y="326">
                2 min
              </text>
              <text className="note" x="560" y="326">
                4h
              </text>
              <text className="note" x="820" y="326">
                24h
              </text>
              <text className="note n-ultra" x="156" y="252">
                the policy, under 2 min
              </text>
              <text className="note n-red" x="600" y="40">
                waiting to page someone: 4 to 24h
              </text>
            </svg>
          </div>
          <figcaption className="mono fig">
            fig. 3, the curve is drawn from memory. Both response times are from the real incident.
          </figcaption>
        </figure>
        <div className="two facts">
          <p className="prose">
            <strong className="fact">0 manual steps</strong> per incident, down from seven: alert, ack, log in, find,
            fix, verify, close.
          </p>
          <div>
            <p className="prose">
              <strong className="fact">Mark, then sweep.</strong> Cloud Custodian revokes rules like SSH open to
              0.0.0.0/0 with an audit trail, and tags orphaned volumes before deleting them.
            </p>
            <Links links={repos.aegis} />
          </div>
        </div>
      </div>
    </section>
  )
}

// Ensō: one brush circle for the whole loop. Step dots sit on the arc.
const ENSO_START = -100
const ENSO_SWEEP = 330
function Heal() {
  const r = 190
  const c = 230
  const angle = (t: number) => ((ENSO_START + ENSO_SWEEP * t) * Math.PI) / 180
  const pt = (t: number) => [c + Math.cos(angle(t)) * r, c + Math.sin(angle(t)) * r]
  const [sx, sy] = pt(0)
  const [ex, ey] = pt(1)
  const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 1 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`
  return (
    <section className="plate" id="heal" data-plate="heal">
      <div className="wrap">
        <PlateHead roman="IV" label="Heal" title="So I taught the cluster to open its own PRs." verse={verses.heal} />
      </div>
      <div className="wrap stage heal-stage" data-stage="heal">
        <figure className="enso">
          <svg viewBox="0 0 460 460" aria-hidden="true">
            <g filter="url(#rough)">
              <path className="enso-path" d={d} />
            </g>
            {healSteps.map((s, i) => {
              const [x, y] = pt((i + 0.5) / healSteps.length)
              return (
                <g key={s.verb} className="enso-dot" data-i={i}>
                  <circle cx={x} cy={y} r="13" />
                  <text x={x} y={y + 4}>
                    {i + 1}
                  </text>
                </g>
              )
            })}
          </svg>
          <figcaption className="enso-center">
            <span className="enso-name">Aegis Observe</span>
            <span className="mono">1st place · Agents of SigNoz</span>
          </figcaption>
        </figure>
        <div>
          <ol className="steps">
            {healSteps.map((s, i) => (
              <li key={s.verb} className="step">
                <span className="step-num">{i + 1}</span>
                <div>
                  <h3>{s.verb}</h3>
                  <p>{s.what}</p>
                </div>
              </li>
            ))}
          </ol>
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

function Studies() {
  return (
    <section className="plate" id="studies" data-plate="studies">
      <div className="wrap">
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
        <div className="gallery">
          {elsewhere.map((p, i) => (
            <article key={p.title} className="frame" data-speed={[0.9, 1.15, 1, 1.2, 0.95, 1.1, 1.05][i % 7]}>
              <div className="frame-inner" style={{ '--tilt': `${[-1.4, 0.9, -0.6, 1.2, -1, 0.7, -0.8][i % 7]}deg` } as React.CSSProperties}>
                <div className="mat">{p.glyph && <Glyph kind={p.glyph} />}</div>
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
                    <strong>{u.where}</strong> <span className="mono tag">{u.state}</span>
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
