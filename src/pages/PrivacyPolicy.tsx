import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const PrivacyPolicy = () => {
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
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>Privacy Policy</h1>
          <div style={{ color: 'var(--bone-dim)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>At Curivanta, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from curivanta.com.</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Personal Information We Collect</h3>
            <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Website Analytics</h3>
            <p>We use Umami, a privacy-focused analytics service, to count page visits and actions such as using a calculator or starting a checkout. Umami does not use cookies, does not track you across other websites, and does not collect personal information; visits are reported only in aggregate.</p>

            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>How Do We Use Your Personal Information?</h3>
            <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>AI Solar Quote Review</h3>
            <p>When you use the AI Solar Quote Review at curivanta.com/solar/review, the documents you upload (solar quotes and utility bills) are sent to our AI provider, Anthropic, to read the numbers, and are then deleted. We do not keep your uploaded files: larger files are held briefly in private storage only while they are read, and any leftovers are removed within a day. We ask the AI not to extract names, street addresses, account numbers, or phone numbers.</p>
            <p>Your finished report — the numbers you confirmed and the written review — is stored privately and is viewable by anyone who has its unique link. Reports are automatically deleted 12 months after they are created. Payments are processed by Stripe; we never see or store your card details. When you buy a review, we share your email address, report link, and verdict with our customer-management system (GoHighLevel) so we can email you your report. To have a report deleted sooner, email us.</p>

            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Contact Us</h3>
            <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:hello@curivanta.com" style={{ color: 'var(--brass)' }}>hello@curivanta.com</a>.</p>
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

export default PrivacyPolicy;