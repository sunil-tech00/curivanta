import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

// Post-checkout page for Review Automation: confirms the order with Stripe (via /api/salon/reviews-confirm).
type Summary = {
  plan: string; planName: string; software: string; monthly: number;
  paidToday: number; billingStarts: string | null; salonName: string; name: string;
};

const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const ReviewsWelcome = () => {
  const sessionId = new URLSearchParams(window.location.search).get('session_id') || '';
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!sessionId) { setLoadError("We couldn't find your order. Check your email for the receipt, or contact hello@curivanta.com."); return; }
    fetch('/api/salon/reviews-confirm?session_id=' + encodeURIComponent(sessionId), { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Something went wrong.');
        setSummary(j);
        try {
          if (sessionStorage.getItem('cv-reviews-tracked') !== sessionId) {
            track('reviews_purchased', { plan: j.plan });
            sessionStorage.setItem('cv-reviews-tracked', sessionId);
          }
        } catch (e) { /* storage blocked */ }
      })
      .catch((e) => setLoadError(e.message + ' If you were charged, email hello@curivanta.com and we will sort it out.'));
  }, [sessionId]);

  const starts = summary?.billingStarts
    ? new Date(summary.billingStarts).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="curivanta-theme">
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <img src="/brand/logo-dark.png" alt="Curivanta" className="dark-logo" style={{ height: '32px', width: 'auto' }} />
            <img src="/brand/logo-light.png" alt="Curivanta" className="light-logo" style={{ height: '32px', width: 'auto' }} />
          </Link>
          <nav className="links"><ThemeToggle /></nav>
        </div>
      </header>

      <section style={{ padding: '140px 0 100px' }}>
        <div className="wrap" style={{ maxWidth: '720px' }}>
          {loadError ? (
            <>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '16px' }}>Hmm, we couldn't load your order.</h1>
              <p style={{ color: 'var(--bone-dim)' }}>{loadError}</p>
            </>
          ) : !summary ? (
            <p style={{ color: 'var(--bone-dim)' }}>Confirming your order…</p>
          ) : (
            <>
              <p className="eyebrow">You're in</p>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', margin: '12px 0 16px' }}>Welcome to Curivanta{summary.name ? `, ${summary.name.split(' ')[0]}` : ''}.</h1>
              <p style={{ color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.7 }}>Your receipt from Stripe is on its way to your inbox. Here's what you signed up for and what happens next.</p>

              <div className="welcome-card">
                <div className="pb-line"><span>Plan</span><strong>{summary.planName}</strong></div>
                {summary.software && <div className="pb-line"><span>Booking software</span><strong>{summary.software}</strong></div>}
                <div className="pb-line"><span>Paid today (registration)</span><strong>${(summary.paidToday / 100).toFixed(2)}</strong></div>
                <div className="pb-line"><span>First month</span><strong>Free</strong></div>
                <div className="pb-line"><span>Monthly{starts ? `, first charge ${starts}` : ''}</span><strong>${(summary.monthly / 100).toFixed(0)}/mo</strong></div>
              </div>

              <ol className="welcome-steps">
                <li><strong>We'll email you within one business day</strong> to book a short setup call.</li>
                <li><strong>We connect your client list</strong>, straight from your booking software where we can or through a simple daily export, and write your messages with you.</li>
                <li><strong>We register your text messaging</strong> with the carriers. Email requests can start sooner.</li>
                <li><strong>You go live</strong> and your free month begins. Every visit after that gets asked for a review.</li>
              </ol>

              <p style={{ marginTop: '32px', fontSize: '0.9rem', color: 'var(--bone-dimmer)' }}>
                No contract: cancel anytime by emailing hello@curivanta.com. Cancel before your first charge and you won't be billed. Cancel before you go live and your registration fee is refunded in full.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReviewsWelcome;
