import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const TermsOfService = () => {
  return (
    <div className="curivanta-theme">
      <header className="nav">
        <div className="nav-inner">
          <div className="brand">
            <Link to="/">
              <img src="/brand/logo-dark.png" alt="Curivanta" className="dark-logo" style={{ height: '32px', width: 'auto' }} />
              <img src="/brand/logo-light.png" alt="Curivanta" className="light-logo" style={{ height: '32px', width: 'auto' }} />
            </Link>
          </div>
          <nav className="links">
            <Link className="navlink" to="/hair-salon-bot">Hair Salon Bot</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section style={{ paddingTop: '160px', paddingBottom: '100px', minHeight: '80vh' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>Terms of Service</h1>
          <div style={{ color: 'var(--bone-dim)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Please read these Terms of Service carefully before using the curivanta.com website operated by Curivanta.</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Conditions of Use</h3>
            <p>By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly.</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Intellectual Property</h3>
            <p>You agree that all materials, products, and services provided on this website are the property of Curivanta, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property.</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Contact Us</h3>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:hello@curivanta.com" style={{ color: 'var(--brass)' }}>hello@curivanta.com</a>.</p>
          </div>
        </div>
      </section>

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
              <Link className="foot-link" to="/privacy">Privacy Policy</Link>
              <span style={{ opacity: 0.3 }}>|</span>
              <Link className="foot-link" to="/terms">Terms of Service</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;