import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import './home/home.css';

// One page per booking system Curivanta works with (/square, /salonultimate): what Curivanta does with it, how it
// connects, and the questions owners ask, in their words (also what AI assistants and search engines match against).
// Keep every claim in step with curivanta-app (docs/curivanta-features.md, "What NOT to claim yet").

const START_URL = 'https://app.curivanta.com/start';
const SIGNIN_URL = 'https://app.curivanta.com/login';

export type Integration = {
  key: string;                       // for analytics
  title: string;                     // document title
  kicker: string;
  h1: JSX.Element;
  sub: string;
  does: string[];
  points: { h: string; p: string }[];
  stepsTitle: string;
  stepsLede: string;
  steps: { h: string; p: string; t: string }[];
  faq: { q: string; a: string }[];
  other: { to: string; label: string };
};

const IntegrationPage = ({ page }: { page: Integration }) => {
  useEffect(() => { document.title = page.title; }, [page.title]);
  return (
    <div className="cvh">
      <header className="h-nav">
        <div className="h-wrap h-nav-in">
          <Link className="h-brand" to="/" aria-label="Curivanta home">
            <img src="/brand/logo-light.png" alt="Curivanta" className="h-logo-onlight" />
            <img src="/brand/logo-dark.png" alt="" className="h-logo-ondark" />
          </Link>
          <nav className="h-links" aria-label="Page">
            <Link to="/#product">Product</Link>
            <Link to="/#pricing">Pricing</Link>
            <a href="#faq">Questions</a>
          </nav>
          <div className="h-nav-cta">
            <ThemeToggle />
            <a className="h-signin" href={SIGNIN_URL}>Sign in</a>
            <a className="h-btn h-btn-primary h-btn-sm" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where={`${page.key}_nav`}>Get started</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="h-hero">
          <div className="h-wrap">
            <div style={{ maxWidth: '760px' }}>
              <div className="h-kicker">{page.kicker}</div>
              <h1>{page.h1}</h1>
              <p className="h-sub">{page.sub}</p>
              <ul className="h-does">{page.does.map(d => <li key={d}>{d}</li>)}</ul>
              <div className="h-ctas">
                <a className="h-btn h-btn-primary" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where={`${page.key}_hero`}>Get started</a>
                <Link className="h-btn h-btn-ghost" to="/#pricing">See plans and prices</Link>
              </div>
              <div className="h-notes">
                <span>From $49/mo, starts when texting goes live</span>
                <span>For salons and solo stylists</span>
                <span>Built by a salon owner</span>
              </div>
            </div>
          </div>
        </section>

        <section className="h-block flush">
          <div className="h-wrap">
            <div className="h-head"><div className="h-kicker">What it does</div><h2>Your front desk, working inside your booking system</h2></div>
            <div className="h-points h-points4">
              {page.points.map(pt => <div className="h-pt" key={pt.h}><h3>{pt.h}</h3><p>{pt.p}</p></div>)}
            </div>
          </div>
        </section>

        <section className="h-block flush">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">How it connects</div>
              <h2>{page.stepsTitle}</h2>
              <p>{page.stepsLede}</p>
            </div>
            <div className="h-steps">
              {page.steps.map((s, i) => (
                <div className="h-step" key={s.h}><div className="n">{i + 1}</div><h3>{s.h}</h3><p>{s.p}</p><span className="t">{s.t}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="h-block flush" id="faq">
          <div className="h-wrap">
            <div className="h-head center"><div className="h-kicker">Questions</div><h2>Asked by owners like you</h2></div>
            <div className="h-faq">
              {page.faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="h-block flush">
          <div className="h-wrap">
            <div className="h-final">
              <h2>Your next missed call could be your next booking.</h2>
              <p>Set up in about 15 minutes. Plans from $49 a month, starting only when texting goes live.</p>
              <div className="row2">
                <a className="h-btn h-btn-light" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where={`${page.key}_final`}>Get started</a>
                <Link className="h-btn h-btn-outline-light" to="/">See everything Curivanta does</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-foot">
        <div className="h-wrap h-foot-in">
          <span>© 2026 Curivanta</span>
          <Link to="/">Home</Link>
          <Link to={page.other.to}>{page.other.label}</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={SIGNIN_URL}>Sign in</a>
          <span className="r">Built by a salon owner. Priced on the page.</span>
        </div>
      </footer>
    </div>
  );
};

export default IntegrationPage;
