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
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Hair Salon Bot Subscriptions</h3>
            <p>These terms apply when you buy a Hair Salon Bot plan (Text-Back, Voice or Voice Pro, and any add-ons) on curivanta.com. Each purchase covers one salon location.</p>
            <p><strong>Billing.</strong> A one-time setup fee is charged when you sign up. Your monthly subscription fee starts after a 14-day setup period and is then billed automatically every month to the card you provided, through our payment processor, Stripe. Prices are shown on the Hair Salon Bot page at the time you sign up.</p>
            <p><strong>Included usage.</strong> Text-Back includes up to 1,000 text messages a month: 500 for missed-call text-back and 500 for AI text booking. Voice Pro includes AI text booking with up to 500 text messages a month, and on Voice the same is available as the Text Booking add-on. Additional text messages are billed at $20 per 500 on a later invoice. Voice includes 300 AI voice minutes a month and Voice Pro includes 1,000; voice usage beyond the included minutes is billed at our cost, with no markup, on a later invoice.</p>
            <p><strong>No contract; cancelling.</strong> Plans are month to month. You can cancel at any time by emailing hello@curivanta.com. Cancellation takes effect at the end of the billing month you are in, and we do not charge you again after that. Monthly fees already paid are not refunded for partial months.</p>
            <p><strong>Setup fee refunds.</strong> If we are unable to connect the service to your booking software, or you cancel before your service goes live, we refund your setup fee in full.</p>
            <p><strong>What we need from you.</strong> Setup depends on accurate information about your salon (hours, services, prices, staff) and on access or approval for your booking software. Text messaging features require carrier registration, which we handle with information you provide; approval times are set by the carriers.</p>
            <p><strong>Service.</strong> The AI front desk is designed to answer calls and messages and book appointments around the clock, but like any phone or software service it may occasionally be unavailable or make mistakes. You remain responsible for your appointments and customer relationships. We may update features and the AI over time to improve the service.</p>
            
            <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>Review Automation Subscriptions</h3>
            <p>These terms apply when you buy a Review Automation plan (Starter or Growth) on curivanta.com. Each purchase covers one salon location.</p>
            <p><strong>Billing and free month.</strong> A one-time text message carrier registration fee is charged when you sign up. Your first month after your service goes live is free. After that, your monthly subscription fee is billed automatically every month to the card you provided, through our payment processor, Stripe. Your first charge date is shown at checkout. Prices are shown on the Review Automation page at the time you sign up.</p>
            <p><strong>Included usage.</strong> Starter includes up to 100 review requests a month and Growth up to 200. Follow-up reminders do not count toward these limits.</p>
            <p><strong>No contract; cancelling.</strong> Plans are month to month. You can cancel at any time by emailing hello@curivanta.com. If you cancel before your first charge, you will not be billed. Otherwise cancellation takes effect at the end of the billing month you are in, and monthly fees already paid are not refunded for partial months.</p>
            <p><strong>Registration fee.</strong> The one-time registration fee covers text message carrier registration and is non-refundable, including if you cancel before your service goes live or during your free month.</p>
            <p><strong>Reviews.</strong> We ask your clients for reviews in line with Google's policies: every client is asked the same way, and we do not filter out unhappy clients or offer anything in exchange for a review. We cannot remove or guarantee reviews, and what clients write is up to them. You are responsible for having your clients' permission to contact them by text and email.</p>

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