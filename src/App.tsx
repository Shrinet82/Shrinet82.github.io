import { useEffect, useRef, type ComponentType } from 'react'
import { certs, education, experience, features, headline, lab, nav, profile, stack, stats, upstream, wins, type Feature } from './content'
import { onScroll, useScrollProgress } from './scroll'
import { SceneFrame, stepAt } from './Scene'
import { Ship } from './remotion/Ship'
import { Observe } from './remotion/Observe'
import { Opsie } from './remotion/Opsie'
import { Govern } from './remotion/Govern'
import { Gates } from './remotion/Gates'

const SCENES: Record<Feature['scene'], { component: ComponentType; label: string }> = {
  observe: { component: Observe, label: 'Animation: a 504 latency spike in SigNoz; the agent proposes a fix, a human clicks PR in Slack, ArgoCD syncs and latency recovers.' },
  opsie: { component: Opsie, label: 'Animation: a Backstage form provisions an S3 bucket through Terraform; bars compare 45, 60 and 30 minutes by hand with 8, 12 and 10 minutes on OPSIE.' },
  govern: { component: Govern, label: 'Animation: untagged buckets and instances multiply, a Cloud Custodian policy marks them and a sweep removes them; time to fix drops from 4–24 hours to under 2 minutes.' },
  gates: { component: Gates, label: 'Animation: five pipeline stages run in turn; Trivy flags two critical CVEs which are patched, and the clock stops at 32 minutes 52 seconds.' },
}

function Header() {
  const bar = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLElement>(null)
  useEffect(
    () =>
      onScroll((y) => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        bar.current?.style.setProperty('transform', `scaleX(${max > 0 ? y / max : 0})`)
        head.current?.classList.toggle('scrolled', y > 8)
      }),
    [],
  )
  return (
    <header className="topbar" ref={head}>
      <a className="brand" href="#top" aria-label="Back to top">
        <span className="brand-mark">~/</span>
        {profile.handle}
      </a>
      <nav aria-label="Sections">
        {nav.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <a className="status" href="#contact">
        <span className="dot" /> <span className="status-text">Open for work</span>
      </a>
      <div className="readout" ref={bar} aria-hidden />
    </header>
  )
}

function Hero() {
  const [ref, p] = useScrollProgress<HTMLElement>()
  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-stage">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="dot" /> {profile.role} · {profile.location}
          </p>
          <h1>
            {headline.lines.map((l, i) => (
              <span key={l} className={i ? 'hl' : undefined}>
                {l}
              </span>
            ))}
          </h1>
          <p className="lede">{headline.sub}</p>
          <div className="ctas">
            <a className="btn primary" href="#work">
              See it run
            </a>
            <a className="btn" href={`mailto:${profile.email}`}>
              Page me
            </a>
          </div>
          <p className="hint" style={{ opacity: Math.max(0, 1 - p * 4) }}>
            <span className="mouse" /> scroll to deploy
          </p>
        </div>
        <div className="canvas hero-canvas">
          <SceneFrame component={Ship} progress={p} label="Animation: a git push travels lint, scan, build, sign and deploy stages, then rolls out pod by pod to a Kubernetes cluster as traffic shifts from v1 to v2 with zero downtime." />
        </div>
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="stats" aria-label="Highlights">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <strong>{s.big}</strong>
          <span>{s.label}</span>
          <small>{s.note}</small>
        </div>
      ))}
    </section>
  )
}

function FeatureScene({ f }: { f: Feature }) {
  const [ref, p] = useScrollProgress<HTMLElement>()
  const n = f.steps.length
  const active = stepAt(p, n)
  const local = p * n - active
  const scene = SCENES[f.scene]
  const meta = (
    <>
      <ul className="chips" aria-label="Stack">
        {f.stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="links">
        {f.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
            {l.label} ↗
          </a>
        ))}
      </p>
    </>
  )
  return (
    <article className="feature" id={f.id} aria-labelledby={`${f.id}-h`}>
      {/* phones read the pitch before the pinned part starts */}
      <div className="feature-intro">
        <p className="kicker">
          <span>{f.index}</span> {f.kicker}
        </p>
        <h3 id={`${f.id}-h`}>{f.name}</h3>
        {f.badge && <p className="badge">★ {f.badge}</p>}
        <p className="pitch">{f.pitch}</p>
        <div className="intro-meta">{meta}</div>
      </div>
      <section className="scene" ref={ref} style={{ ['--steps' as string]: n }}>
        <div className="scene-stage">
          <div className="scene-copy">
            <div className="scene-head">
              <p className="kicker">
                <span>{f.index}</span> {f.kicker}
              </p>
              <p className="scene-name" aria-hidden>
                {f.name}
              </p>
              {f.badge && <p className="badge">★ {f.badge}</p>}
              <p className="pitch">{f.pitch}</p>
            </div>
            <ol className="steps">
              {f.steps.map((s, i) => (
                <li key={s.title} className={i === active ? 'on' : i < active ? 'done' : undefined}>
                  <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <b>{s.title}</b>
                    <p>{s.body}</p>
                  </div>
                  <i className="step-bar" style={{ transform: `scaleX(${i < active ? 1 : i === active ? local : 0})` }} />
                </li>
              ))}
            </ol>
            <div className="scene-meta">{meta}</div>
          </div>
          <div className="canvas">
            <SceneFrame component={scene.component} progress={p} label={scene.label} />
          </div>
        </div>
      </section>
    </article>
  )
}

function Work() {
  return (
    <section className="work" id="work">
      <div className="section-head">
        <p className="kicker">
          <span>/work</span> selected systems
        </p>
        <h2>
          Four systems. <em>Scroll to run them.</em>
        </h2>
        <p className="section-sub">Each one is a real repo with real numbers. The animations are Remotion compositions driven frame by frame by your scroll bar.</p>
      </div>
      {features.map((f) => (
        <FeatureScene key={f.id} f={f} />
      ))}
    </section>
  )
}

function Lab() {
  return (
    <section className="lab" id="lab">
      <div className="section-head">
        <p className="kicker">
          <span>/lab</span> more builds
        </p>
        <h2>
          The rest of the <em>cluster.</em>
        </h2>
      </div>
      <div className="lab-grid">
        {lab.map((l) => (
          <a className="card" key={l.name} href={l.href} target="_blank" rel="noreferrer">
            <p className="card-kind">
              {l.kind}
              {l.flag && <span className="flag">{l.flag}</span>}
            </p>
            <h3>{l.name}</h3>
            <p>{l.line}</p>
            <ul className="chips">
              {l.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <span className="card-go" aria-hidden>
              ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

function Upstream() {
  return (
    <section className="upstream" id="upstream">
      <div className="section-head">
        <p className="kicker">
          <span>/upstream</span> open source
        </p>
        <h2>
          Code in other people’s <em>main.</em>
        </h2>
        <p className="section-sub">Merged into Cognee and LikeC4, with pull requests into the security tooling half the industry runs.</p>
      </div>
      <ul className="up-list">
        {upstream.map((u) => (
          <li key={u.href}>
            <a href={u.href} target="_blank" rel="noreferrer">
              <span className={`state ${u.state}`}>{u.state === 'merged' ? '● merged' : '○ PR opened'}</span>
              <span className="up-name">
                {u.project} <small>★ {u.stars}</small>
              </span>
              <span className="up-what">{u.what}</span>
              <span className="up-go" aria-hidden>
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Record() {
  return (
    <section className="record" id="record">
      <div className="section-head">
        <p className="kicker">
          <span>/record</span> the receipts
        </p>
        <h2>
          On call for <em>four teams.</em>
        </h2>
      </div>
      <div className="record-grid">
        <div className="job">
          <p className="job-when">{experience.when}</p>
          <h3>{experience.role}</h3>
          <p className="job-where">{experience.where}</p>
          <ul>
            {experience.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </div>
        <aside className="me">
          <img src="/assets/profile.jpg" alt="Shashwat Pratap Singh" width={590} height={1024} loading="lazy" decoding="async" />
          <div>
            <p className="me-name">{profile.name}</p>
            <p className="me-line">
              Shrinet to the internet. {education}. I came for electronics and stayed for the part where infrastructure fixes itself.
            </p>
          </div>
        </aside>
      </div>

      <div className="stack">
        {stack.map(([k, v]) => (
          <div key={k} className="stack-row">
            <span>{k}</span>
            <p>
              {v.map((t) => (
                <em key={t}>{t}</em>
              ))}
            </p>
          </div>
        ))}
      </div>

      <div className="honours">
        <div>
          <h3 className="mini">Wins</h3>
          <ul className="wins">
            {wins.map((w) => (
              <li key={w.what}>
                {w.href ? (
                  <a href={w.href} target="_blank" rel="noreferrer">
                    {w.what} ↗
                  </a>
                ) : (
                  <b>{w.what}</b>
                )}
                <span>{w.note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mini">Certified</h3>
          <ul className="certs">
            {certs.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <p className="kicker">
        <span>/pager</span> contact
      </p>
      <h2>
        Got a platform that pages people at 3am? <em>Let’s fix that.</em>
      </h2>
      <p className="section-sub">Open to contract engagements and full-time platform, SRE or DevOps roles. Remote from India, overlapping with most time zones.</p>
      <div className="ctas">
        <a className="btn primary big" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
        <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <a className="skip" href="#work">
        Skip to work
      </a>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Work />
        <Lab />
        <Upstream />
        <Record />
        <Contact />
      </main>
      <footer className="footer">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>React + Remotion · every frame scrubbed by your scroll</span>
      </footer>
    </>
  )
}
