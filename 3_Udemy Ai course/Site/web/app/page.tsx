import Nav from "@/components/Nav";
import TwinChat from "@/components/TwinChat";
import SurfaceHero from "@/components/SurfaceHero";
import { Reveal, CountUp } from "@/components/Reveal";
import {
  profile,
  stats,
  roles,
  capabilities,
  marquee,
  projects,
  education,
  certifications,
} from "@/lib/data";

export default function Home() {
  const loop = [...marquee, ...marquee];
  return (
    <>
      <Nav />
      <TwinChat />
      <main id="top">
        {/* HERO */}
        <section className="hero">
          <SurfaceHero />
          <div className="hero-grid" aria-hidden="true" />
          <div className="wrap hero-inner">
            <p className="eyebrow">
              <span className="dot" /> {profile.location}
            </p>
            <h1 className="mega">
              <span className="line"><span>{profile.first}</span></span>
              <span className="line"><span className="outline">{profile.last}</span></span>
            </h1>
            <div className="hero-foot">
              <p className="lede">
                {profile.headline}. <em>{profile.tagline}.</em>
              </p>
              <div className="cta-row">
                <a className="btn primary" href="#portfolio">View work <span aria-hidden>→</span></a>
                <a className="btn" href="#journey">Career journey</a>
              </div>
            </div>
          </div>
          <div className="scroll-hint" aria-hidden="true"><span /> Scroll</div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="track">
            {loop.map((m, i) => (
              <span key={i}>{m}<i>/</i></span>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <section id="about" className="section wrap">
          <Reveal className="sec-head">
            <span className="idx">01</span>
            <h2>About</h2>
          </Reveal>
          <div className="about-grid">
            <Reveal className="statement">
              <p>
                Design must <mark>improve the quality of life</mark> of people.
              </p>
            </Reveal>
            <Reveal delay={120} className="about-copy">
              <p>{profile.summary}</p>
              <p className="muted">{profile.philosophy}</p>
              <p className="muted">
                Today I design at Brompton Bicycle in London, and help other designers
                bring AI and modern workflows into their craft, without losing the taste
                that makes the work theirs.
              </p>
            </Reveal>
          </div>
          <ul className="stats">
            {stats.map((s, i) => (
              <Reveal as="li" key={s.label} delay={i * 90}>
                <strong><CountUp to={s.value} suffix={s.suffix} /></strong>
                <span>{s.label}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* JOURNEY */}
        <section id="journey" className="section wrap">
          <Reveal className="sec-head">
            <span className="idx">02</span>
            <h2>Career journey</h2>
            <p className="sec-sub">From quality control and machine drawing in Italy to product design in London.</p>
          </Reveal>
          <ol className="timeline">
            {roles.map((r, i) => (
              <Reveal as="li" key={r.company + r.from} delay={Math.min(i, 4) * 40} className={r.current ? "role current" : "role"}>
                <div className="when">
                  <span>{r.from}</span>
                  <span className="dash" />
                  <span>{r.to}</span>
                </div>
                <div className="what">
                  <h3>
                    {r.company}
                    {r.current && <b className="now">Now</b>}
                  </h3>
                  <p className="title">{r.title}</p>
                  {r.note && <p className="note">{r.note}</p>}
                </div>
                <div className="where">{r.place}</div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* CAPABILITIES */}
        <section id="capabilities" className="section wrap">
          <Reveal className="sec-head">
            <span className="idx">03</span>
            <h2>Capabilities</h2>
          </Reveal>
          <div className="caps">
            {capabilities.map((c, i) => (
              <Reveal as="article" key={c.id} delay={i * 80} className="cap">
                <span className="cap-id">{c.id}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <ul>
                  {c.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        {/* PORTFOLIO */}
        <section id="portfolio" className="section wrap">
          <Reveal className="sec-head">
            <span className="idx">04</span>
            <h2>Portfolio</h2>
            <p className="sec-sub">Case studies are being prepared. This is where they will live.</p>
          </Reveal>
          <div className="work">
            {projects.map((p, i) => {
              const inner = (
                <>
                  <div className="thumb" aria-hidden="true">
                    <svg viewBox="0 0 200 120" preserveAspectRatio="none">
                      {Array.from({ length: 12 }, (_, k) => (
                        <path
                          key={k}
                          d={`M0 ${100 - k * 2} C ${40 + i * 35} ${(i % 2 ? 110 : 10) + k * (i % 2 ? -4 : 4)}, ${150 - i * 30} ${(i % 2 ? 10 : 110) + k * (i % 2 ? 5 : -3)}, 200 ${20 + k * (5 + i)}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.6"
                          opacity={0.25 + k * 0.05}
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="meta">
                    <span className="mono">{p.index} · {p.category}</span>
                    <h3>{p.title}</h3>
                    <p>{p.blurb}</p>
                  </div>
                  <span className={`badge ${p.status}`}>
                    {p.status === "live" ? "View ↗" : "In preparation"}
                  </span>
                </>
              );
              return (
                <Reveal as="article" key={p.index} delay={i * 80} className="card">
                  {p.status === "live" && p.href ? (
                    <a href={p.href} className="card-link">{inner}</a>
                  ) : (
                    <div className="card-link">{inner}</div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* EDUCATION */}
        <section className="section wrap">
          <Reveal className="sec-head">
            <span className="idx">05</span>
            <h2>Foundations</h2>
          </Reveal>
          <div className="found">
            <Reveal>
              <h4 className="mono">Education</h4>
              <ul>
                {education.map((e) => (
                  <li key={e.title}>
                    <strong>{e.place}</strong>
                    <span>{e.title}</span>
                    <em>{e.years}</em>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <h4 className="mono">Certifications</h4>
              <ul>
                {certifications.map((c) => (
                  <li key={c}><span>{c}</span></li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="contact">
          <div className="wrap">
            <Reveal>
              <p className="eyebrow"><span className="dot" /> Get in touch</p>
              <h2 className="mega small">
                Let&rsquo;s make<br /><span className="outline">something better.</span>
              </h2>
              <a className="btn primary big" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                Connect on LinkedIn <span aria-hidden>↗</span>
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="mono">{profile.location}</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  );
}
