import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../../components/ThemeToggle';

// Shared pieces of the sample pages (/new, /new/roi): nav, footer, icons, placeholder marker.

export const START_URL = 'https://app.curivanta.com/start';
export const SIGNIN_URL = 'https://app.curivanta.com/login';

export const Ph = ({ children }: { children: React.ReactNode }) => <span className="ph" title="Placeholder">{children}</span>;

export const I = {
  check: <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  phone: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor" /></svg>,
  missed: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l6 6 4-4 6 6M19 11v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chat: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  cal: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  star: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" /></svg>,
  reply: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 8V4l-7 7 7 7v-4c5 0 8 1.5 11 6-1-6-4-11-11-12z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  chart: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>,
  user: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  headset: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0116 0v2M4 14h3v6H5a1 1 0 01-1-1zM20 14h-3v6h2a1 1 0 001-1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  scissors: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8.5 7.5L20 18M8.5 16.5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  arrow: <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

export const useSamplePage = (title: string) => {
  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex';
    document.head.appendChild(m);
    document.title = title;
    window.scrollTo(0, 0);
    return () => { m.remove(); };
  }, [title]);
};

export const NxNav = () => (
  <header className="nx-nav">
    <div className="nx-wrap nx-nav-in">
      <Link className="nx-brand" to="/new" aria-label="Curivanta">
        <img src="/brand/logo-light.png" alt="Curivanta" className="nx-logo-light" />
        <img src="/brand/logo-dark.png" alt="" className="nx-logo-dark" />
      </Link>
      <nav className="nx-links" aria-label="Site">
        <Link to="/new#product">Product</Link>
        <Link to="/new#journey">How it works</Link>
        <Link to="/new#pricing">Pricing</Link>
        <Link to="/new/roi">ROI calculator</Link>
        <Link to="/blog">Blog</Link>
      </nav>
      <div className="nx-nav-cta">
        <ThemeToggle />
        <a className="nx-signin" href={SIGNIN_URL}>Sign in</a>
        <a className="nx-btn nx-btn-sm" href={START_URL}>Get started</a>
      </div>
    </div>
  </header>
);

export const NxFoot = () => (
  <footer className="nx-foot">
    <div className="nx-wrap nx-foot-grid">
      <div className="nx-foot-brand"><img src="/brand/logo-light.png" alt="Curivanta" className="nx-logo-light" /><img src="/brand/logo-dark.png" alt="" className="nx-logo-dark" /><p>The front desk for salons.</p><a href="mailto:hello@curivanta.com">hello@curivanta.com</a></div>
      <div><h4>Product</h4><Link to="/new#product">Missed calls and texts</Link><Link to="/new#product">Reviews</Link><Link to="/new#product">Phone</Link><Link to="/new#product">Owner app</Link><Link to="/new#pricing">Pricing</Link></div>
      <div><h4>Who it's for</h4><Link to="/new#pricing">Salons with a team</Link><Link to="/new#pricing">Solo stylists</Link><Link to="/new#pricing">Several locations</Link></div>
      <div><h4>Resources</h4><Link to="/new/roi">ROI calculator</Link><Link to="/blog">Blog</Link><Link to="/salonultimate">SalonUltimate</Link><Link to="/square">Square</Link></div>
      <div><h4>Company</h4><Link to="/new#story">Our story</Link><a href={SIGNIN_URL}>Sign in</a><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
    </div>
    <div className="nx-wrap nx-copy">© 2026 Curivanta</div>
  </footer>
);
