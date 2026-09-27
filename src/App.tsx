import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { useGlass } from './gl/useGlass'
import { paletteStore } from './gl/registry'
import {
  certifications,
  education,
  experience,
  moreBuilds,
  openSource,
  profile,
  projects,
  publication,
  recognition,
  stack,
  stats,
  type Project,
} from './content'

type GlassProps = {
  as?: ElementType
  className?: string
  children?: ReactNode
  tint?: number
  dark?: number
  strength?: number
  priority?: number
  [key: string]: unknown
}

function Glass({ as: Tag = 'div', className = '', children, tint, dark, strength, priority, ...rest }: GlassProps) {
  const ref = useRef<HTMLElement>(null)
  useGlass(ref, { tint, dark, strength, priority })
  const El = Tag as 'div'
  return (
    <El ref={ref as React.RefObject<HTMLDivElement>} className={`glass ${className}`} {...rest}>
      {children}
    </El>
  )
}

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 12L12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

// Switches the background palette as each section reaches mid-screen, and
// reveals elements as they scroll in.
function useScrollEffects() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-palette]')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && paletteStore.set((e.target as HTMLElement).dataset.palette!)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    sections.forEach((s) => io.observe(s))

    const reveals = document.querySelectorAll<HTMLElement>('.reveal')
    const ro = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            ro.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    reveals.forEach((r) => ro.observe(r))
    return () => {
      io.disconnect()
      ro.disconnect()
    }
  }, [])
}

function Nav() {
  return (
    <header className="nav-wrap">
      <Glass as="nav" className="nav" priority={10} dark={0.45} aria-label="Primary">
        <a href="#top" className="nav-logo">
          SPS<span>.</span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#open-source">Open source</a>
          <a href="#stack">Stack</a>
        </div>
        <a href="#contact" className="nav-cta">
          Let&apos;s talk
        </a>
      </Glass>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top" data-palette="hero">
      <div className="container hero-inner">
        <Glass as="p" className="status intro" dark={0.4}>
          <span className="pulse" aria-hidden="true" />
          {profile.availability}
        </Glass>
        <h1 className="hero-title intro">
          Platforms that
          <br />
          <em>run themselves.</em>
        </h1>
        <p className="hero-sub intro">
          I&apos;m Shashwat, an independent DevOps &amp; platform engineer. I build internal developer platforms, GitOps delivery,
          policy-as-code guardrails, and AI SRE agents that detect, fix and <em>commit</em> their own remediations.
        </p>
        <div className="hero-actions intro">
          <Glass as="a" href="#work" className="btn btn-primary" dark={0.1} tint={0.22}>
            See the work
          </Glass>
          <a href={profile.github} className="btn-link" target="_blank" rel="noreferrer">
            github.com/{profile.handle} <Arrow />
          </a>
        </div>
      </div>
      <div className="hero-caption mono" aria-hidden="true">
        <span>control-plane</span>
        <span className="ok">● 7/7 pods Running</span>
      </div>
      <a href="#proof" className="scroll-hint mono">
        scroll
      </a>
    </section>
  )
}

function Proof() {
  return (
    <section className="proof" id="proof" data-palette="proof">
      <div className="container proof-grid">
        {stats.map((s) => (
          <Glass key={s.label} className="stat reveal">
            <div className="stat-value">
              {s.value}
              <span>{s.unit}</span>
            </div>
            <p>{s.label}</p>
          </Glass>
        ))}
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section about" id="about" data-palette="proof">
      <div className="container about-grid">
        <Glass className="photo reveal" strength={1.4}>
          <img src="/assets/profile.jpg" alt="Shashwat Pratap Singh" loading="lazy" />
        </Glass>
        <div className="about-copy reveal">
          <p className="eyebrow mono">About</p>
          <h2 className="section-title">
            Infrastructure should feel <em>invisible.</em>
          </h2>
          <p>
            Since January 2025 I&apos;ve worked independently with SaaS startups and internal tooling teams on
            Kubernetes delivery, GitOps, Infrastructure as Code, cloud governance and cost controls. I treat the
            platform as a product: if it isn&apos;t self-service, it isn&apos;t finished.
          </p>
          <p>
            Lately I&apos;ve been building on top of observability: agents that read OpenTelemetry signals, choose a
            fix behind human-in-the-loop gates, and ship it through GitOps.
          </p>
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="section" id="experience" data-palette="experience">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow mono">Experience</p>
          <h2 className="section-title">
            Where the numbers <em>come from.</em>
          </h2>
        </div>
        <Glass className="exp reveal" dark={0.45}>
          <div className="exp-head">
            <div>
              <h3>{experience.title}</h3>
              <p className="muted">{experience.org}</p>
            </div>
            <span className="mono pill-label">{experience.period}</span>
          </div>
          <div className="exp-groups">
            {experience.groups.map((g) => (
              <div key={g.heading} className="exp-group">
                <p className="mono group-label">{g.heading}</p>
                <ul>
                  {g.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Glass>
      </div>
    </section>
  )
}

function ProjectCard({ p, index }: { p: Project; index: number }) {
  return (
    <Glass as="article" className={`project reveal ${index === 0 ? 'project-wide' : ''}`} style={{ '--hue': p.hue }}>
      <div className="project-top">
        <span className="mono kicker">
          <i className="hue-dot" aria-hidden="true" />
          {p.kicker}
        </span>
        {p.badge && <span className="badge mono">★ {p.badge}</span>}
      </div>
      <h3 className="project-title">{p.title}</h3>
      <p className="project-blurb">{p.blurb}</p>
      <div className="metrics">
        {p.metrics.map((m) => (
          <div key={m.label} className="metric">
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
      <p className="stack-line mono">{p.stack.join(' · ')}</p>
      <div className="project-links">
        {p.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {l.label} <Arrow />
          </a>
        ))}
      </div>
    </Glass>
  )
}

function Work() {
  return (
    <section className="section" id="work" data-palette="work">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow mono">Selected work · {projects.length}</p>
          <h2 className="section-title">
            Systems I&apos;ve <em>shipped.</em>
          </h2>
        </div>
        <div className="projects">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} p={p} index={i} />
          ))}
        </div>

        <div className="more reveal">
          <p className="eyebrow mono">More builds</p>
          <div className="more-grid">
            {moreBuilds.map((b) => (
              <Glass as="a" key={b.title} href={b.href} target="_blank" rel="noreferrer" className="more-item" dark={0.5}>
                <span className="more-title">
                  {b.title} <Arrow />
                </span>
                <span className="muted">{b.blurb}</span>
              </Glass>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function OpenSource() {
  return (
    <section className="section" id="open-source" data-palette="oss">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow mono">Open source & recognition</p>
          <h2 className="section-title">
            Merged <em>upstream.</em>
          </h2>
        </div>
        <div className="oss-grid">
          <div className="oss-col">
            {openSource.map((o) => (
              <Glass as="a" key={o.project} href={o.href} target="_blank" rel="noreferrer" className="oss reveal">
                <span className="mono kicker">{o.what}</span>
                <h3>
                  {o.project} <Arrow />
                </h3>
                <p>{o.detail}</p>
              </Glass>
            ))}
            <Glass as="a" href={publication.href} target="_blank" rel="noreferrer" className="oss reveal">
              <span className="mono kicker">Publication · {publication.venue}</span>
              <h3>
                {publication.title} <Arrow />
              </h3>
              <p>{publication.detail}</p>
            </Glass>
          </div>
          <Glass className="recog reveal" dark={0.45}>
            <p className="mono group-label">Hackathons & awards</p>
            <ul>
              {recognition.map((r) => (
                <li key={r.title}>
                  <strong>{r.title}</strong>
                  <span className="muted">{r.note}</span>
                </li>
              ))}
            </ul>
          </Glass>
        </div>
      </div>
    </section>
  )
}

function Stack() {
  return (
    <section className="section" id="stack" data-palette="stack">
      <div className="container">
        <div className="section-head reveal">
          <p className="eyebrow mono">Stack</p>
          <h2 className="section-title">
            The <em>toolbox.</em>
          </h2>
        </div>
        <Glass className="stack reveal" dark={0.45}>
          {stack.map((s) => (
            <div key={s.group} className="stack-row">
              <p className="mono group-label">{s.group}</p>
              <div className="chips">
                {s.items.map((i) => (
                  <span key={i} className="chip">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Glass>

        <div className="creds">
          <Glass className="edu reveal" dark={0.45}>
            <p className="mono group-label">Education</p>
            <h3>{education.school}</h3>
            <p>{education.degree}</p>
            <p className="mono muted">{education.period}</p>
          </Glass>
          <Glass className="certs reveal" dark={0.45}>
            <p className="mono group-label">Certifications</p>
            <ul>
              {certifications.map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <span className="muted mono">
                    {c.by}
                    {c.year ? ` · ${c.year}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </Glass>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <footer className="contact" id="contact" data-palette="contact">
      <div className="container">
        <p className="eyebrow mono reveal">Contact</p>
        <h2 className="contact-title reveal">
          Let&apos;s build something
          <br />
          that <em>runs itself.</em>
        </h2>
        <div className="reveal">
          <Glass as="a" href={`mailto:${profile.email}`} className="mail" tint={0.2} dark={0.15} strength={1.3}>
            {profile.email} <Arrow />
          </Glass>
        </div>
        <div className="contact-links reveal">
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub <Arrow />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <Arrow />
          </a>
          <a href={publication.href} target="_blank" rel="noreferrer">
            IEEE paper <Arrow />
          </a>
        </div>
        <p className="colophon mono">
          © {new Date().getFullYear()} {profile.name} · {profile.location} · Built with react-three-fiber,
          shadergradient & a liquid-glass shader
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  useScrollEffects()
  return (
    <>
      <a className="skip" href="#work">
        Skip to work
      </a>
      <Nav />
      <main>
        <Hero />
        <Proof />
        <About />
        <Experience />
        <Work />
        <OpenSource />
        <Stack />
      </main>
      <Contact />
    </>
  )
}
