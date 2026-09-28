import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { setupMotion } from './motion'
import Glyph from './Glyphs'
import {
  awards,
  certs,
  chapters,
  education,
  elsewhere,
  healSteps,
  incident,
  pipeline,
  profile,
  provision,
  repos,
  stack,
  upstream,
} from './content'

const Arrow = ({ down = false }: { down?: boolean }) => (
  <svg className={`arrow ${down ? 'arrow-down' : ''}`} viewBox="0 0 16 16" aria-hidden="true">
    {down ? (
      <path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    ) : (
      <path d="M4.5 11.5l7-7M6 4.5h5.5V10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    )}
  </svg>
)

const ext = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})

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

function ChapterHead({ num, label, title, dek }: { num: string; label: string; title: React.ReactNode; dek: string }) {
  return (
    <header className="chapter-head">
      <p className="chapter-num mono rv">
        {num} <span>/ {label}</span>
      </p>
      <h2 className="chapter-title split">{title}</h2>
      <p className="dek rv">{dek}</p>
    </header>
  )
}

function Rail() {
  return (
    <nav className="rail" aria-label="Chapters">
      <div className="rail-track" aria-hidden="true">
        <div className="rail-fill" />
      </div>
      <ol>
        {chapters.map((c) => (
          <li key={c.id}>
            <a href={`#${c.id}`} data-rail={c.id}>
              <span className="mono">{c.num}</span>
              <span className="rail-label">{c.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Topbar() {
  return (
    <div className="topbar">
      <a href="#top" className="mono brand">
        shashwat<span>@</span>shrinet82
      </a>
      <span className="mono now" aria-hidden="true">
        <span className="now-num">00</span> <span className="now-label">Incident</span>
      </span>
      <a href={`mailto:${profile.email}`} className="mono topbar-mail">
        Email
      </a>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero chapter" id="top" data-chapter="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="mono kicker hero-in">
            <span className="dot-live" aria-hidden="true" />
            {profile.name} · {profile.role}
          </p>
          <h1 className="hero-title">
            <span className="hl">Most outages end with someone awake at 3am.</span>{' '}
            <span className="hl amber">Mine end with a pull request.</span>
          </h1>
          <p className="hero-dek hero-in">
            I&apos;m {profile.short}, an independent DevOps and platform engineer. Since January 2025 I&apos;ve built
            internal platforms, GitOps delivery and policy guardrails for 4 engineering teams, plus an SRE agent that
            took 1st place at the Agents of SigNoz hackathon.
          </p>
          <div className="hero-actions hero-in">
            <a className="btn btn-primary" href="#provision">
              Read the incident <Arrow down />
            </a>
            <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
              Email me
            </a>
          </div>
        </div>

        <figure className="term hero-in" aria-label="Replay of the Aegis Observe incident loop">
          <div className="term-bar mono">
            <span className="term-state" data-state="resolved">
              <i aria-hidden="true" />
              <b className="state-firing">firing</b>
              <b className="state-resolved">resolved</b>
            </span>
            <span className="term-title">aegis-observe · demo loop</span>
          </div>
          <ol className="term-body mono">
            {incident.map((l, i) => (
              <li key={i} className={`term-line tone-${l.tone ?? 'base'}`}>
                <span className="t">{l.t}</span>
                <span className="src">{l.src}</span>
                <span className="msg">{l.msg}</span>
              </li>
            ))}
          </ol>
          <figcaption className="term-foot mono">
            <span>One tap in Slack. No terminal opened.</span>
            <button type="button" className="replay" aria-label="Replay the incident">
              replay
            </button>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

const mmss = (m: number) => `${String(m).padStart(2, '0')}:00`

function Provision() {
  return (
    <section className="chapter" id="provision" data-chapter="provision">
      <div className="wrap pin-wrap" data-pin="provision">
        <div className="split-grid">
          <ChapterHead
            num="01"
            label="Provision"
            title={
              <>
                Infrastructure used to <br className="br-lg" />
                be a ticket.
              </>
            }
            dek="Four teams, one platform engineer, and every bucket went through a queue. OPSIE turned the queue into a form."
          />
          <div className="provision-viz">
            <div className="clocks">
              {provision.rows.map((r) => (
                <div className="clock" key={r.what} data-before={r.before} data-after={r.after}>
                  <div className="clock-top">
                    <span className="clock-what">{r.what}</span>
                    <span className="clock-num mono">{mmss(r.after)}</span>
                  </div>
                  <div className="track">
                    <div className="bar" style={{ width: `${(r.after / 60) * 100}%` }} />
                    <div className="ghost" style={{ width: `${(r.before / 60) * 100}%` }} />
                  </div>
                  <p className="clock-was mono">was {mmss(r.before)}</p>
                </div>
              ))}
            </div>
            <div className="oldway">
              <ul className="mono">
                {provision.oldWay.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="newway">{provision.newWay}</p>
            </div>
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
    <section className="chapter" id="ship" data-chapter="ship">
      <div className="wrap pin-wrap" data-pin="ship">
        <ChapterHead
          num="02"
          label="Ship"
          title={
            <>
              Every commit walks <br className="br-lg" />
              through five gates.
            </>
          }
          dek="A zero-trust Azure pipeline for AKS. Nothing reaches the cluster unless secrets, infrastructure code, the image and the running app all pass."
        />
        <div className="pipe" role="list">
          <div className="pipe-flow" aria-hidden="true">
            <div className="pipe-fill" />
          </div>
          {pipeline.stages.map((s, i) => (
            <div
              className="stage"
              role="listitem"
              key={s.name}
              style={{ flexGrow: s.secs / total }}
              data-at={pipeline.stages.slice(0, i + 1).reduce((a, x) => a + x.secs, 0) / total}
            >
              <span className="stage-idx mono">0{i + 1}</span>
              <span className="stage-name">{s.name}</span>
              <span className="stage-tools mono">{s.tools}</span>
              <span className="stage-time mono">{s.time}</span>
              {s.flag && (
                <span className="cve mono" aria-label="Trivy found 2 critical CVEs, both patched">
                  <b className="cve-open">2 CRITICAL</b>
                  <b className="cve-fixed">patched</b>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="pipe-foot">
          <p className="pipe-total">
            <span className="mono">commit → verified deploy</span>
            <strong>{pipeline.total}</strong>
          </p>
          <p className="caption">
            Stage times from the measured run. Trivy caught two critical CVEs in the image; both were fixed with
            dependency upgrades and a hardened rebuild. Secrets arrive at runtime from Key Vault CSI.
          </p>
          <Links links={repos.devsecops} />
        </div>
      </div>
    </section>
  )
}

function Govern() {
  return (
    <section className="chapter" id="govern" data-chapter="govern">
      <div className="wrap">
        <ChapterHead
          num="03"
          label="Govern"
          title={
            <>
              Then a glitch started <br className="br-lg" />
              spawning buckets.
            </>
          }
          dek="A platform bug kept creating S3 buckets and EC2 instances. The fix was never going to be a faster human. It was a policy that doesn't wait for one."
        />
        <figure className="chart rv">
          <svg viewBox="0 0 880 340" role="img" aria-labelledby="chart-t chart-d">
            <title id="chart-t">Runaway resources over time</title>
            <desc id="chart-d">
              Without automation the count keeps climbing until someone responds, 4 to 24 hours later. With Aegis
              policies it is contained in under 2 minutes.
            </desc>
            <g className="grid-lines">
              {[60, 130, 200, 270].map((y) => (
                <line key={y} x1="40" x2="860" y1={y} y2={y} />
              ))}
            </g>
            <rect className="human-band" x="560" y="30" width="300" height="270" />
            <text className="band-label mono" x="572" y="52">
              someone gets paged: 4 to 24h
            </text>
            <line className="axis" x1="40" x2="860" y1="300" y2="300" />
            <line className="break" x1="318" x2="328" y1="306" y2="294" />
            <line className="break" x1="326" x2="336" y1="306" y2="294" />
            <text className="tick mono" x="40" y="324">t=0</text>
            <text className="tick mono" x="136" y="324">2 min</text>
            <text className="tick mono" x="280" y="324">10 min</text>
            <text className="tick mono" x="560" y="324">4h</text>
            <text className="tick mono" x="822" y="324">24h</text>
            <path
              className="line-human"
              d="M40 300 C 120 280, 200 250, 318 220 L 336 214 C 420 190, 500 150, 600 110 C 680 80, 760 60, 820 52 L 830 300"
            />
            <path className="line-aegis" d="M40 300 C 80 288, 115 272, 136 264 L 146 300 L 860 300" />
            <circle className="dot-aegis" cx="136" cy="264" r="5" />
            <text className="lbl-aegis mono" x="152" y="256">
              policy fires, under 2 min
            </text>
          </svg>
          <figcaption className="caption">
            The shape of the curve is illustrative. Both response times are from the real incident: 4 to 24 hours
            through the old on-call path, under 2 minutes with Cloud Custodian auto-remediation.
          </figcaption>
        </figure>
        <div className="govern-foot">
          <div className="facts">
            <p>
              <strong className="mono">0</strong> manual steps per incident, down from 7: alert, ack, log in, find,
              fix, verify, close.
            </p>
            <p>
              <strong className="mono">mark → sweep</strong> Insecure rules like SSH open to 0.0.0.0/0 are revoked
              with an audit trail. Orphaned volumes are tagged, then deleted.
            </p>
          </div>
          <Links links={repos.aegis} />
        </div>
      </div>
    </section>
  )
}

// Mirrors the pinned steps: data-step goes 1..5 as the loop advances.
function SlackCard() {
  return (
    <div className="slack rv" data-step="5" aria-hidden="true">
      <div className="slack-head mono">
        <i className="slack-mark" />
        <b>aegis</b>
        <span>#incidents</span>
      </div>
      <p className="slack-title">fraud-detection-api · 504 SLO breach</p>
      <p className="slack-line mono s-diag">searching SigNoz logs…</p>
      <p className="slack-line mono s-prop">proposed: patch the fraud-api manifest</p>
      <div className="slack-btns mono">
        <span className="sb">Approve</span>
        <span className="sb sb-pr">PR</span>
        <span className="sb">Reject</span>
      </div>
      <p className="slack-line mono s-done">PR merged · argocd synced · verified</p>
    </div>
  )
}

function Heal() {
  return (
    <section className="chapter" id="heal" data-chapter="heal">
      <div className="wrap pin-wrap" data-pin="heal">
        <div className="split-grid">
          <div>
            <ChapterHead
              num="04"
              label="Heal"
              title={
                <>
                  So I taught the cluster <br className="br-lg" />
                  to open its own PRs.
                </>
              }
              dek="Aegis Observe is the loop from the top of this page. Rules find the signal, an LLM picks the fix, a human keeps the veto, and Git keeps the record."
            />
            <SlackCard />
            <p className="badge mono rv">1st place · Agents of SigNoz hackathon</p>
            <Links links={repos.observe} />
          </div>
          <ol className="steps">
            {healSteps.map((s, i) => (
              <li className="step" key={s.verb}>
                <span className="step-num mono">0{i + 1}</span>
                <div>
                  <h3>{s.verb}</h3>
                  <p>{s.what}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Tagline() {
  const text = 'Good infrastructure is boring to operate. Getting it there is the interesting part.'
  return (
    <section className="tagline" aria-label={text}>
      <p className="wrap tagline-text" aria-hidden="true">
        {text.split(' ').map((w, i) => (
          <span key={i} className="w">
            {w}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}

function Elsewhere() {
  return (
    <section className="chapter" id="elsewhere" data-chapter="elsewhere">
      <div className="wrap">
        <ChapterHead
          num="05"
          label="Elsewhere"
          title="Other things I've shipped."
          dek="Same instincts, different surfaces: model serving, security streams, and one farm that pages you before the plants die."
        />
        <ul className="index">
          {elsewhere.map((p) => (
            <li key={p.title} className="index-row rv">
              <span className="mono index-kind">{p.kind}</span>
              <h3 className="index-title">{p.title}</h3>
              <p className="index-line">{p.line}</p>
              <div className="index-glyph">{p.glyph && <Glyph kind={p.glyph} />}</div>
              <Links links={p.links} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Proof() {
  return (
    <section className="chapter" id="proof" data-chapter="proof">
      <div className="wrap">
        <ChapterHead
          num="06"
          label="Proof"
          title="Merged, published, certified."
          dek="Work that other people reviewed before it counted."
        />
        <div className="proof-grid">
          <div className="proof-col">
            <h3 className="col-label mono">Upstream</h3>
            <ul className="upstream">
              {upstream.map((u) => (
                <li key={u.where} className="rv">
                  <a href={u.href} {...ext(u.href)}>
                    <span className="up-top">
                      <strong>{u.where}</strong>
                      <span className="mono state-ok">{u.state}</span>
                    </span>
                    <span className="up-what">{u.what}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="proof-col">
            <h3 className="col-label mono">Recognition</h3>
            <ul className="plain">
              {awards.map((a) => (
                <li key={a.what} className="rv">
                  <strong>{a.what}</strong>
                  <span>{a.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="proof-col">
            <h3 className="col-label mono">Certified</h3>
            <ul className="plain certs">
              {certs.map((c) => (
                <li key={c} className="rv">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <dl className="spec rv">
          {stack.map(([k, v]) => (
            <div key={k} className="spec-row">
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="spec-row">
            <dt className="mono">Education</dt>
            <dd>{education}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <footer className="chapter contact" id="contact" data-chapter="contact">
      <div className="wrap">
        <p className="chapter-num mono rv">
          07 <span>/ Pager</span>
        </p>
        <h2 className="contact-title split">
          Hand me <span className="amber">the pager.</span>
        </h2>
        <div className="contact-grid">
          <img className="me rv" src="/assets/profile.jpg" alt="Shashwat Pratap Singh" width="160" height="200" loading="lazy" />
          <div className="rv">
            <p className="contact-dek">
              {profile.availability}. I&apos;m in {profile.location} and work remotely. Tell me what keeps paging you.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
            <div className="links contact-links">
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
          © {new Date().getFullYear()} {profile.name}. Set in Geist and Geist Mono. Status colours mean what they
          mean on a dashboard.
        </p>
      </div>
    </footer>
  )
}

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => setupMotion(root.current!), { scope: root })
  return (
    <div ref={root}>
      <a className="skip" href="#provision">
        Skip to chapter one
      </a>
      <Topbar />
      <Rail />
      <main>
        <Hero />
        <Provision />
        <Ship />
        <Govern />
        <Heal />
        <Tagline />
        <Elsewhere />
        <Proof />
      </main>
      <Contact />
    </div>
  )
}
