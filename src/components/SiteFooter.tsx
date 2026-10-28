import { Link } from 'react-router-dom';

// Shared footer for the React pages. /solar is a static page outside the SPA, so it's a plain link.
export function SiteFooter() {
  return (
    <footer>
      <div className="wrap foot-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
          <Link to="/">
            <img src="/brand/logo-dark.png" alt="Curivanta" className="dark-logo" style={{ height: '28px', width: 'auto' }} />
            <img src="/brand/logo-light.png" alt="Curivanta" className="light-logo" style={{ height: '28px', width: 'auto' }} />
          </Link>
        </div>
        <div style={{ flex: 1, textAlign: 'center', minWidth: '200px' }}>
          <span className="foot-meta">© 2026 Curivanta. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '200px' }}>
          <span className="foot-meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link className="foot-link" to="/privacy" data-umami-event="footer_privacy">Privacy Policy</Link>
            <span style={{ opacity: 0.3 }}>|</span>
            <Link className="foot-link" to="/terms" data-umami-event="footer_terms">Terms of Service</Link>
          </span>
        </div>
      </div>
      <nav className="wrap foot-services" aria-label="Services">
        <Link className="foot-link" to="/website-development" data-umami-event="footer_websites">Websites</Link>
        <Link className="foot-link" to="/hair-salon-bot" data-umami-event="footer_hair_salon_bot">Hair Salon Bot</Link>
        <Link className="foot-link" to="/reviewautomation" data-umami-event="footer_review_automation">Review Automation</Link>
        <a className="foot-link" href="/solar" data-umami-event="footer_solar">Solar</a>
      </nav>
    </footer>
  );
}
