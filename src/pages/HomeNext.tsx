import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import './next/next.css';

// Sample of a simpler, product-first homepage (2026-11-21, branch homepage-human), modeled on the
// structure of getweave.com: centered hero over the product, outcome tabs, a product panel, results, a
// founder band, short pricing. Served at /new, not prerendered, noindex. <Ph> marks placeholders.

const START_URL = 'https://app.curivanta.com/start';
const SIGNIN_URL = 'https://app.curivanta.com/login';

const Ph = ({ children }: { children: React.ReactNode }) => <span className="ph" title="Placeholder">{children}</span>;

const I = {
  check: <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  phone: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor" /></svg>,
  cal: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  star: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" /></svg>,
  chart: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>,
  scissors: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8.5 7.5L20 18M8.5 16.5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  tag: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><circle cx="8" cy="8" r="1.6" fill="currentColor" /></svg>,
  bolt: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor" /></svg>,
};

// Small pieces of the product, drawn in HTML.
const Sms = () => (
  <div className="nx-card nx-sms">
    <div className="nx-card-h"><span className="nx-dot red" />Missed call · (949) 555-0142</div>
    <p className="us">Hi, it's Glow Studio. Sorry we missed your call! How can we help? You can book right here.</p>
    <p className="them">Any openings Saturday for a cut and color?</p>
    <p className="us">Maya has 10:00 or 1:30 on Saturday. Which works?</p>
    <p className="them">10 please!</p>
    <div className="nx-booked">{I.check}Booked Sat 10:00 with Maya</div>
  </div>
);

const Dash = () => (
  <div className="nx-card nx-dash">
    <div className="nx-dash-top"><b>Glow Studio</b><span className="nx-seg"><i className="on">Today</i><i>Week</i><i>Month</i></span></div>
    <div className="nx-dash-tiles">
      <div><b>21</b><span>calls</span></div>
      <div><b>7</b><span>missed, all texted back</span></div>
      <div><b>6</b><span>booked</span><em>$540</em></div>
      <div><b>2</b><span>new Google reviews</span></div>
    </div>
    <div className="nx-bars" aria-hidden="true">
      {[30, 45, 60, 38, 72, 90, 55, 40, 66, 80, 48, 35].map((h, i) => <i key={i} style={{ height: h + '%' }} />)}
    </div>
  </div>
);

const Review = () => (
  <div className="nx-card nx-review">
    <div className="nx-stars">{I.star}{I.star}{I.star}{I.star}{I.star}</div>
    <p>"Booked by text in two minutes. Maya is the best!"</p>
    <small>New Google review · reply ready to approve</small>
  </div>
);

const ClientCard = () => (
  <div className="nx-card nx-client">
    <div className="nx-client-h"><span className="nx-av">SL</span><div><b>Sarah L.</b><small>Usually: root touch-up with Jess · 9 visits</small></div></div>
    <ul>
      <li><span className="nx-tl blue" />Texted: "Anything Saturday?" <time>8:47 PM</time></li>
      <li><span className="nx-tl green" />Booked Sat 10:00, root touch-up <time>8:49 PM</time></li>
      <li><span className="nx-tl amber" />Rated Jess 5 ★ after her last visit <time>Oct 4</time></li>
      <li><span className="nx-tl gray" />Missed call, texted back <time>Sep 12</time></li>
    </ul>
  </div>
);

const TABS = [
  {
    key: 'calls', icon: I.phone, tab: 'Catch every caller',
    title: 'Every missed call gets a text back',
    text: 'When nobody can pick up, the caller gets a text from your salon within a minute. Most people would rather text than leave a voicemail.',
    points: ['A text back for every missed call, day or night', 'Voicemails arrive as text you can read between clients', 'On Pro, calls nobody picks up get answered for you'],
    art: <Sms />,
  },
  {
    key: 'book', icon: I.cal, tab: 'Book more appointments',
    title: 'Clients book by text, into your real calendar',
    text: 'Curivanta knows your services, prices and stylists, and only offers times that are really open.',
    points: ['Books straight into SalonUltimate or Square', 'Remembers returning clients and what they usually book', 'Anything unusual comes to you, with the whole conversation'],
    art: <ClientCard />,
  },
  {
    key: 'reviews', icon: I.star, tab: 'Get more reviews',
    title: 'More 5-star Google reviews, on autopilot',
    text: 'After a visit, clients get one short text with your Google review link. Unhappy clients can reply and it comes to you first.',
    points: ['Every client gets the link, never filtered', 'Ratings by stylist, so you see who clients love', 'New Google reviews come with a reply ready to approve'],
    art: <Review />,
  },
  {
    key: 'day', icon: I.chart, tab: 'Know your day',
    title: 'See how the salon did, any time',
    text: 'Calls, bookings and reviews on one screen, on your phone or computer, plus a short email every morning.',
    points: ['Today, this week or this month, compared with before', 'What needs you, at the top', 'Each stylist\'s ratings and reviews'],
    art: <Dash />,
  },
];

const HomeNext = () => {
  const [tab, setTab] = useState(TABS[0].key);
  const t = TABS.find(x => x.key === tab)!;

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex';
    document.head.appendChild(m);
    document.title = 'Curivanta | Turn missed calls into booked appointments';
    return () => { m.remove(); };
  }, []);

  return (
    <div className="nx">
      <header className="nx-nav">
        <div className="nx-wrap nx-nav-in">
          <a className="nx-brand" href="#top" aria-label="Curivanta">
            <img src="/brand/logo-light.png" alt="Curivanta" className="nx-logo-light" />
            <img src="/brand/logo-dark.png" alt="" className="nx-logo-dark" />
          </a>
          <nav className="nx-links" aria-label="Site">
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#why">Why Curivanta</a>
            <Link to="/blog">Blog</Link>
          </nav>
          <div className="nx-nav-cta">
            <ThemeToggle />
            <a className="nx-signin" href={SIGNIN_URL}>Sign in</a>
            <a className="nx-btn nx-btn-sm" href={START_URL}>Get started</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="nx-hero">
          <div className="nx-wrap nx-hero-in">
            <h1>Turn missed calls into booked appointments.</h1>
            <p className="nx-lede">
              Curivanta texts back every caller, books them into your calendar and asks happy clients for a Google
              review. Built for salons, by a salon owner.
            </p>
            <div className="nx-ctas">
              <a className="nx-btn" href={START_URL}>Get started</a>
              <a className="nx-btn nx-btn-ghost" href="#pricing">See pricing</a>
            </div>
            <p className="nx-fine">From $49/month · Set up in about 15 minutes · No contract</p>
          </div>
          <div className="nx-wrap">
            <div className="nx-stage">
              <div className="nx-stage-l"><Sms /></div>
              <div className="nx-stage-c"><Dash /></div>
              <div className="nx-stage-r"><Review /></div>
            </div>
          </div>
        </section>

        <div className="nx-works">
          <div className="nx-wrap nx-works-in">
            <span>Works with</span>
            <Link to="/salonultimate">SalonUltimate</Link>
            <Link to="/square">Square</Link>
            <b>Google</b>
            <b>Any online booking link</b>
          </div>
        </div>

        <section className="nx-sec" id="product">
          <div className="nx-wrap">
            <div className="nx-head">
              <h2>Everything your front desk does, even when nobody's at it</h2>
              <p>One simple app for calls, texts, bookings and reviews.</p>
            </div>
            <div className="nx-tabs" role="tablist">
              {TABS.map(x => (
                <button key={x.key} role="tab" aria-selected={x.key === tab} className={x.key === tab ? 'on' : ''} onClick={() => setTab(x.key)}>
                  {x.icon}<span>{x.tab}</span>
                </button>
              ))}
            </div>
            <div className="nx-panel" role="tabpanel">
              <div className="nx-panel-copy">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <ul className="nx-checks">{t.points.map(p => <li key={p}>{I.check}{p}</li>)}</ul>
              </div>
              <div className="nx-panel-art">{t.art}</div>
            </div>
          </div>
        </section>

        <section className="nx-sec nx-tight">
          <div className="nx-wrap">
            <div className="nx-split">
              <div>
                <h2>Every client, one page</h2>
                <p className="nx-sub">Every call, text, visit and review for each client, in one place. Your team sees the whole story before they reply.</p>
                <div className="nx-mini">
                  <div>{I.phone}<b>Call from the app</b><span>With your salon's number. Hold and transfer included.</span></div>
                  <div>{I.bolt}<b>One alert, not five</b><span>Only what needs you, on your phone.</span></div>
                  <div>{I.scissors}<b>Team logins</b><span>Front desk sees clients. Billing stays with you.</span></div>
                </div>
              </div>
              <div className="nx-split-art"><ClientCard /></div>
            </div>
          </div>
        </section>

        <section className="nx-results">
          <div className="nx-wrap">
            <h2>Results from our own salon, last month</h2>
            <div className="nx-stats">
              <div><b><Ph>46</Ph></b><span>missed calls texted back</span></div>
              <div><b><Ph>19</Ph></b><span>appointments booked by text</span></div>
              <div><b><Ph>23</Ph></b><span>new Google reviews</span></div>
              <div><b>4.3 → 4.5</b><span>Google rating in the first month</span></div>
            </div>
          </div>
        </section>

        <section className="nx-sec" id="why">
          <div className="nx-wrap">
            <div className="nx-head"><h2>Why salons choose Curivanta</h2></div>
            <div className="nx-three">
              <div><span className="nx-ic">{I.scissors}</span><h3>Made for salons</h3><p>Stylists, services and salon software, not a tool for every business at once.</p></div>
              <div><span className="nx-ic">{I.tag}</span><h3>Prices on the page</h3><p>Three monthly plans, no contract, no sales call to find out what it costs.</p></div>
              <div><span className="nx-ic">{I.bolt}</span><h3>Live in days</h3><p>About 15 minutes of your time. We handle carrier registration and setup.</p></div>
            </div>
          </div>
        </section>

        <section className="nx-wrap">
          <div className="nx-founder">
            <div className="nx-founder-copy">
              <p className="nx-quote">"I own salons and can't stand behind every front desk. I built Curivanta to catch the calls we were missing, and it runs in my own salons every day."</p>
              <p className="nx-who"><b>Salon owner</b> · Founder, Curivanta</p>
              <a className="nx-btn nx-btn-light" href={START_URL}>Get started</a>
            </div>
            <div className="nx-founder-photo"><Ph>Owner photo</Ph></div>
          </div>
        </section>

        <section className="nx-sec" id="pricing">
          <div className="nx-wrap">
            <div className="nx-head"><h2>Simple plans. Prices right here.</h2><p>Per location, month to month. $49 to get started, credited to your first month.</p></div>
            <div className="nx-prices">
              <div className="nx-price"><h3>Starter</h3><p className="nx-for">For solo stylists</p><div className="nx-amt">$49<small>/month</small></div><p>Your own business number, text-back, booking by text and review requests.</p><a className="nx-btn nx-btn-ghost" href={START_URL + '?plan=starter'}>Start with Starter</a></div>
              <div className="nx-price main"><span className="nx-tag">Most salons</span><h3>Light</h3><p className="nx-for">For salons with a team</p><div className="nx-amt">$99<small>/month</small></div><p>Keep your salon number. Team logins, ratings by stylist, and 30 minutes a month of calls answered for you.</p><a className="nx-btn" href={START_URL}>Start with Light</a></div>
              <div className="nx-price"><h3>Pro</h3><p className="nx-for">Every call answered</p><div className="nx-amt">$149<small>/month</small></div><p>Everything in Light, and calls nobody picks up are answered all month.</p><a className="nx-btn nx-btn-ghost" href={START_URL + '?plan=pro'}>Start with Pro</a></div>
            </div>
            <p className="nx-center"><a href="#pricing">Compare plans in detail →</a></p>
          </div>
        </section>

        <section className="nx-final">
          <div className="nx-wrap nx-final-in">
            <h2>Stop losing bookings to missed calls.</h2>
            <p>Set up in about 15 minutes. Your monthly plan starts only when texting goes live.</p>
            <div className="nx-ctas"><a className="nx-btn" href={START_URL}>Get started</a><a className="nx-btn nx-btn-ghost" href="mailto:hello@curivanta.com">Email us</a></div>
          </div>
        </section>
      </main>

      <footer className="nx-foot">
        <div className="nx-wrap nx-foot-grid">
          <div className="nx-foot-brand"><img src="/brand/logo-light.png" alt="Curivanta" className="nx-logo-light" /><img src="/brand/logo-dark.png" alt="" className="nx-logo-dark" /><p>The front desk for salons.</p><a href="mailto:hello@curivanta.com">hello@curivanta.com</a></div>
          <div><h4>Product</h4><a href="#product">Missed calls and texts</a><a href="#product">Reviews</a><a href="#product">Phone</a><a href="#product">Owner app</a><a href="#pricing">Pricing</a></div>
          <div><h4>Works with</h4><Link to="/salonultimate">SalonUltimate</Link><Link to="/square">Square</Link></div>
          <div><h4>Company</h4><a href="#why">Our story</a><Link to="/blog">Blog</Link><a href={SIGNIN_URL}>Sign in</a></div>
          <div><h4>Legal</h4><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
        </div>
        <div className="nx-wrap nx-copy">© 2026 Curivanta</div>
      </footer>
    </div>
  );
};

export default HomeNext;
