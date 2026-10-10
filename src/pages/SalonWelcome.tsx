import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

// Post-checkout page for Hair Salon Bot subscriptions: confirms the order with Stripe
// (via /api/salon/confirm) and collects what we need to set the salon up.
const PORTAL_URL = ''; // Stripe customer portal login link; hidden until set

type Summary = {
  plan: string; planName: string; addons: string[]; software: string; monthly: number;
  paidToday: number; billingStarts: string | null; salonName: string; name: string; onboardingForm: boolean;
};

const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const FIELDS: { name: string; label: string; area?: boolean; placeholder?: string }[] = [
  { name: 'salon_name', label: 'Salon name' },
  { name: 'address', label: 'Salon address' },
  { name: 'salon_phone', label: "Your salon's current phone number" },
  { name: 'hours', label: 'Opening hours', area: true, placeholder: 'e.g. Tue–Fri 10–6, Sat–Sun 9–6, closed Mon' },
  { name: 'services', label: 'Services and prices', area: true, placeholder: 'e.g. Boys cut $32, Girls cut $36, First haircut $40' },
  { name: 'stylists', label: 'Stylists (and any specialties or languages)', area: true },
  { name: 'kickoff_time', label: 'Best days and times for a 20-minute kickoff call' },
  { name: 'notes', label: 'Anything else we should know?', area: true }
];

const SalonWelcome = () => {
  const sessionId = new URLSearchParams(window.location.search).get('session_id') || '';
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) { setLoadError("We couldn't find your order. Check your email for the receipt, or contact hello@curivanta.com."); return; }
    fetch('/api/salon/confirm?session_id=' + encodeURIComponent(sessionId), { cache: 'no-store' })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'Something went wrong.');
        setSummary(j);
        try {
          if (sessionStorage.getItem('cv-salon-tracked') !== sessionId) {
            track('salon_purchased', { plan: j.plan });
            sessionStorage.setItem('cv-salon-tracked', sessionId);
          }
        } catch (e) { /* storage blocked */ }
      })
      .catch((e) => setLoadError(e.message + ' If you were charged, email hello@curivanta.com and we will sort it out.'));
  }, [sessionId]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/salon/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, session_id: sessionId })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Something went wrong. Please email hello@curivanta.com.');
      setStatus('sent');
      track('salon_onboarding_sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('idle');
    }
  };

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
                {summary.addons.length > 0 && <div className="pb-line"><span>Add-ons</span><strong>{summary.addons.join(', ')}</strong></div>}
                <div className="pb-line"><span>Booking software</span><strong>{summary.software}</strong></div>
                <div className="pb-line"><span>Paid today (setup)</span><strong>${(summary.paidToday / 100).toFixed(2)}</strong></div>
                <div className="pb-line"><span>Monthly{starts ? `, starting ${starts}` : ''}</span><strong>${(summary.monthly / 100).toFixed(0)}/mo</strong></div>
              </div>

              <ol className="welcome-steps">
                <li><strong>Send us your salon details</strong> {summary.onboardingForm ? 'using the form below (5 minutes).' : "when we email you within one business day (5 minutes)."}</li>
                <li><strong>Kickoff call</strong> (20 minutes): we confirm your setup and connect {summary.software}.</li>
                <li><strong>We build and test</strong> your AI front desk, your greeting, services and FAQs.</li>
                <li><strong>You go live</strong>, usually within about a week. Your monthly fee starts after the setup period.</li>
              </ol>

              {!summary.onboardingForm ? (
                <div className="welcome-card">
                  <h3 style={{ fontSize: '1.3rem' }}>We'll be in touch within one business day</h3>
                  <p style={{ color: 'var(--bone-dim)' }}>We'll email you to collect your salon's hours, services and stylists, and to book your kickoff call. Questions in the meantime? Write to hello@curivanta.com.</p>
                </div>
              ) : status === 'sent' ? (
                <div className="welcome-card form-success" role="status">
                  <h3>Thanks, we've got everything.</h3>
                  <p>We'll be in touch within one business day to book your kickoff call.</p>
                </div>
              ) : (
                <form className="audit-form welcome-form" onSubmit={submit}>
                  <h2 style={{ fontSize: '1.6rem' }}>Your salon details</h2>
                  {FIELDS.map((f) => (
                    <label key={f.name} className="welcome-field">
                      <span>{f.label}</span>
                      {f.area
                        ? <textarea name={f.name} className="form-input" rows={3} placeholder={f.placeholder} />
                        : <input name={f.name} className="form-input" placeholder={f.placeholder} defaultValue={f.name === 'salon_name' ? summary.salonName : undefined} required={f.name === 'salon_name'} />}
                    </label>
                  ))}
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <button type="submit" className="btn solid full-width" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send my salon details'}</button>
                  <p style={{ fontSize: '0.85rem', color: 'var(--bone-dimmer)' }}>Rather talk it through? Just reply to your welcome email or write to hello@curivanta.com.</p>
                </form>
              )}

              <p style={{ marginTop: '32px', fontSize: '0.9rem', color: 'var(--bone-dimmer)' }}>
                No contract: you can cancel anytime{PORTAL_URL ? <> from your <a href={PORTAL_URL} style={{ color: 'var(--brass-light)' }}>billing page</a></> : ' by emailing hello@curivanta.com'}. If we can't connect your booking software, or you cancel before go-live, your setup fee is refunded in full.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SalonWelcome;
