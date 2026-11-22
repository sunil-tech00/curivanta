import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import './next/next.css';

// Sample of a calmer, more human homepage (2026-11-21, branch homepage-human). Served at /new, not
// prerendered and noindex. Photos are Unsplash stand-ins until real salon photos arrive.
// Anything in <Ph> is a placeholder to fill with real numbers or photos.

const START_URL = 'https://app.curivanta.com/start';
const SIGNIN_URL = 'https://app.curivanta.com/login';

const Ph = ({ children }: { children: React.ReactNode }) => <span className="ph" title="Placeholder">{children}</span>;

const HomeNext = () => {
  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex';
    document.head.appendChild(m);
    document.title = 'Curivanta: never lose a booking to a missed call';
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
            <a href="#what">How it helps</a>
            <a href="#pricing">Pricing</a>
            <a href="#story">Our story</a>
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
          <div className="nx-wrap nx-hero-grid">
            <div className="nx-hero-copy">
              <h1>Never lose a booking to a missed call.</h1>
              <p className="nx-lede">
                When you're with a client and the phone rings, Curivanta texts the caller back, answers their
                questions and books them into your calendar. Afterwards, it asks happy clients for a Google review.
              </p>
              <div className="nx-ctas">
                <a className="nx-btn" href={START_URL}>Get started</a>
                <a className="nx-link" href="#pricing">See pricing</a>
              </div>
              <p className="nx-small">From $49 a month. Set up in about 15 minutes. Made by a salon owner.</p>
            </div>
            <figure className="nx-hero-photo">
              <img src="/photos/cape.jpg" alt="A stylist putting a cape on a laughing client" />
            </figure>
          </div>
          <div className="nx-wrap">
            <p className="nx-works">
              Works with <Link to="/salonultimate">SalonUltimate</Link>, <Link to="/square">Square</Link>, or any
              online booking link. Keep your salon number, or get a new one.
            </p>
          </div>
        </section>

        <section className="nx-note" id="story">
          <div className="nx-wrap nx-note-grid">
            <div className="nx-face"><Ph>Owner photo</Ph></div>
            <div>
              <p className="nx-note-text">
                "I own salons, and I can't stand behind every front desk. Saturdays were the worst: the phone rang
                while everyone had scissors in their hands, and those callers just booked somewhere else. I built
                Curivanta for my own salons first. It's been running there every day since, and our Google rating
                went from 4.3 to 4.5 in the first month."
              </p>
              <p className="nx-sign">Salon owner and founder, Curivanta</p>
            </div>
          </div>
        </section>

        <section className="nx-what" id="what">
          <div className="nx-wrap">
            <h2 className="nx-h2">What it does for you</h2>

            <div className="nx-row">
              <img className="nx-photo" src="/photos/scissors.jpg" alt="A stylist cutting a client's hair" />
              <div className="nx-row-copy">
                <h3>Every missed call gets a text back.</h3>
                <p>
                  Within a minute of a missed call, the caller gets a friendly text from your salon. Most people would
                  rather text than leave a voicemail anyway. Voicemails come to your phone as text, so you can read
                  them between clients.
                </p>
                <div className="nx-sms" aria-label="Example text">
                  <p className="us">Hi, it's Glow Studio. Sorry we missed your call! How can we help? You can book right here.</p>
                  <p className="them">Do you have anything Saturday for a cut?</p>
                </div>
                <p className="nx-aside">On Pro, it can also pick up the phone when nobody else can.</p>
              </div>
            </div>

            <div className="nx-row flip">
              <img className="nx-photo" src="/photos/desk.jpg" alt="An empty salon front desk" />
              <div className="nx-row-copy">
                <h3>Clients book by text, even when nobody's at the desk.</h3>
                <p>
                  It knows your services, prices and stylists, and only offers times that are really free. Booked
                  appointments go straight into SalonUltimate or Square. On anything else, it sends your own booking
                  link.
                </p>
                <p>
                  It remembers returning clients too, so a regular gets "Another cut with Maya?" instead of twenty
                  questions. Anything unusual comes to you.
                </p>
              </div>
            </div>

            <div className="nx-row">
              <img className="nx-photo" src="/photos/smile.jpg" alt="A smiling client in the salon chair" />
              <div className="nx-row-copy">
                <h3>More 5-star reviews, without asking at the counter.</h3>
                <p>
                  After a visit, clients get one short text with your Google review link. Everyone gets the link,
                  happy or not. If something wasn't right, they can reply and it comes straight to you, so you can
                  fix it.
                </p>
                <p>New Google reviews show up in your app with a reply ready for you to approve.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="nx-proof">
          <div className="nx-wrap">
            <h2 className="nx-h2">At our own salon, last month</h2>
            <dl className="nx-stats">
              <div><dt>Missed calls texted back</dt><dd><Ph>46</Ph></dd></div>
              <div><dt>Booked by text</dt><dd><Ph>19</Ph></dd></div>
              <div><dt>New Google reviews</dt><dd><Ph>23</Ph></dd></div>
              <div><dt>Google rating</dt><dd>4.3 → 4.5</dd></div>
            </dl>
          </div>
        </section>

        <section className="nx-setup">
          <div className="nx-wrap nx-setup-grid">
            <div>
              <h2 className="nx-h2">About 15 minutes of your time. We do the rest.</h2>
              <p>No new hardware, no new booking system, no training calls.</p>
            </div>
            <ol className="nx-steps">
              <li><b>Paste one link.</b> Your website, booking page or Google listing. We fill in your services, hours and stylists from it.</li>
              <li><b>Connect your booking.</b> SalonUltimate, Square, or just your online booking link.</li>
              <li><b>Pick your number.</b> We register it with the phone carriers so your texts get delivered. Texting usually goes live a few days later.</li>
            </ol>
          </div>
        </section>

        <section className="nx-pricing" id="pricing">
          <div className="nx-wrap">
            <h2 className="nx-h2">Simple monthly plans, priced right here</h2>
            <table className="nx-plans">
              <tbody>
                <tr><th>Starter<small>Solo stylists</small></th><td>Your own business number, text-back, texting that books, review requests</td><td className="p">$49<small>/month</small></td></tr>
                <tr><th>Light<small>Salons with a team</small></th><td>Keep your salon number, team logins, ratings by stylist, 30 minutes of calls answered for you</td><td className="p">$99<small>/month</small></td></tr>
                <tr><th>Pro<small>Every call answered</small></th><td>Everything in Light, and every call nobody picks up gets answered, all month</td><td className="p">$149<small>/month</small></td></tr>
              </tbody>
            </table>
            <p className="nx-small">Per location. $49 to get started, credited to your first month. No contract; cancel any time. <a href="#pricing">See everything in each plan</a></p>
          </div>
        </section>

        <section className="nx-final">
          <img src="/photos/salon.jpg" alt="" className="nx-final-photo" />
          <div className="nx-wrap nx-final-in">
            <h2>Try it at your salon.</h2>
            <p>Your monthly plan starts only when texting goes live. Questions first? Email <a href="mailto:hello@curivanta.com">hello@curivanta.com</a>, a real person answers.</p>
            <a className="nx-btn" href={START_URL}>Get started</a>
          </div>
        </section>
      </main>

      <footer className="nx-foot">
        <div className="nx-wrap nx-foot-in">
          <span>© 2026 Curivanta</span>
          <Link to="/square">Square</Link>
          <Link to="/salonultimate">SalonUltimate</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={SIGNIN_URL}>Sign in</a>
        </div>
      </footer>
    </div>
  );
};

export default HomeNext;
