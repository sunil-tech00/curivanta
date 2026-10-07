import { useEffect, useState } from 'react';
import { DeviceAnimation } from '../components/DeviceAnimation';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Index = () => {
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    revealEls.forEach(el => io.observe(el));
    
    return () => io.disconnect();
  }, []);

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          business: data.get('business'),
          phone: data.get('phone'),
          email: data.get('email'),
          website: data.get('website'),
          smsConsent: data.get('smsConsent') === 'on'
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please email hello@curivanta.com.');
      setStatus('sent');
      (window as Window & { cvTrack?: (name: string) => void }).cvTrack?.('audit_form_submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please email hello@curivanta.com.');
      setStatus('idle');
    }
  };



  return (
    <div className="curivanta-theme">
      <header className="nav">
        <div className="nav-inner">
          <div className="brand">
            <img src="/brand/logo-dark.png" alt="Curivanta" className="dark-logo" style={{ height: '32px', width: 'auto' }} />
            <img src="/brand/logo-light.png" alt="Curivanta" className="light-logo" style={{ height: '32px', width: 'auto' }} />
          </div>
          <nav className="links">
            <Link className="navlink" to="/hair-salon-bot">Hair Salon Bot</Link>
            <a className="btn ghost desktop-only" href="#contact">Book a free audit</a>
            <ThemeToggle />
            
            <div className="mobile-menu-trigger">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -mr-2 flex items-center justify-center text-foreground" aria-label="Menu">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col gap-6 pt-16 bg-background border-border">
                  <SheetClose asChild><Link className="text-xl font-medium" to="/hair-salon-bot">Hair Salon Bot</Link></SheetClose>
                  <SheetClose asChild><a className="btn solid text-center mt-4 justify-center" href="#contact">Book a free audit</a></SheetClose>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner hero-grid">
          <div className="hero-content">
            <p className="eyebrow badge reveal is-visible">
              <svg className="spark" viewBox="0 0 16 16" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1l1.2 4.3L13.5 6.5l-4.3 1.2L8 12l-1.2-4.3L2.5 6.5l4.3-1.2L8 1z" fill="currentColor"/>
              </svg> 
              AI consulting &amp; automation for small business
            </p>
            <h1 className="reveal is-visible">Turn every customer interaction<br />into something that<br /><em>runs itself.</em></h1>
            <p className="sub reveal is-visible">Curivanta helps small businesses win more customers with AI workflows, websites, voice agents, and chat automation. Built by an owner who was tired of doing everything by hand.</p>
            <div className="cta-row reveal is-visible">
              <a className="btn solid" href="#contact">Book a free automation audit</a>
              <a className="btn ghost" href="#services">See what we build</a>
            </div>
          </div>
          <div className="hero-visual reveal is-visible d2">
            <DeviceAnimation />
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section className="services" id="services">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">What we build</p>
            <h2 className="md:whitespace-nowrap">Four ways to take manual work off your plate.</h2>
          </div>
          <div className="service-grid">
            <div className="service-card reveal d1">
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M6 17h9M15 17l-3-3M15 17l-3 3" stroke="#4d6bf6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 17h-9M19 17l3-3M19 17l3 3" stroke="#7c93ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="17" r="15" stroke="#4d6bf6" strokeWidth="1" opacity="0.4"/>
              </svg>
              <h3>AI Workflow Automation</h3>
              <p>The busywork that eats your week - lead follow-up, appointment reminders, review requests, internal reporting; rebuilt as automated workflows that run without you touching them.</p>
            </div>
            <div className="service-card reveal d2">
              <svg viewBox="0 0 34 34" fill="none">
                <rect x="4" y="7" width="26" height="20" rx="1.5" stroke="#4d6bf6" strokeWidth="1.6"/>
                <path d="M4 12h26" stroke="#4d6bf6" strokeWidth="1.6"/>
                <circle cx="8" cy="9.5" r="0.9" fill="#7c93ff"/>
                <circle cx="11" cy="9.5" r="0.9" fill="#7c93ff"/>
              </svg>
              <h3>AI Websites</h3>
              <p>A site that does more than sit there. Booking, lead capture, and AI chat wired in from day one; not bolted on six months after launch.</p>
            </div>
            <div className="service-card reveal d1">
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M9 13v8a1 1 0 0 0 1 1h1l3 4v-4h9a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1z" stroke="#4d6bf6" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M14 17v.01M17 17v.01M20 17v.01" stroke="#7c93ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Voice Bots</h3>
              <p>A phone line that never goes to voicemail. Answers calls in your business's own voice, books real appointments, day or night.</p>
            </div>
            <div className="service-card reveal d2">
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M8 22c-2.5-1.8-4-4.5-4-7.5C4 9.3 9.8 5 17 5s13 4.3 13 9.5S24.2 24 17 24c-1.4 0-2.7-.2-4-.5L8 26z" stroke="#4d6bf6" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
              <h3>Conversation Bots</h3>
              <p>SMS, WhatsApp, and web chat that qualifies leads and books meetings while you're with a customer; not stuck answering your phone.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section className="approach" id="approach">
        <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">How we work</p>
          <h2>One audit. One build.</h2>
        </div>
          <div className="steps">
            <div className="step reveal">
              <span className="step-num">01 — Audit</span>
              <div>
                <h3>We map where manual work is actually costing you</h3>
                <p>A short, honest look at where calls, leads, and follow-ups are falling through. Not a generic checklist, a read on your actual business.</p>
              </div>
            </div>
            <div className="step reveal d1">
              <span className="step-num">02 — Build</span>
              <div>
                <h3>We wire it into tools you already use</h3>
                <p>Workflows, bots, and sites built on infrastructure you can see and control, not a black box you're locked into.</p>
              </div>
            </div>
            <div className="step reveal d2">
              <span className="step-num">03 — Launch &amp; tune</span>
              <div>
                <h3>Live against real customers, not a demo script</h3>
                <p>We stay on it after launch, refining against how people actually call, text, and book; not how the pitch deck said they would.</p>
              </div>
            </div>
          </div>
      </div>
    </section>

    <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

    <section className="final-cta" id="contact">
        <div className="wrap">
          <p className="eyebrow reveal">Ready when you are</p>
          <h2 className="reveal d1">Let's find the manual work worth automating.</h2>
          <p className="sub reveal d2">A free audit is 20 minutes: a look at your calls, your site, and your follow-ups, and an honest read on what's actually worth automating first.</p>
          <div className="audit-form-container reveal d3">
            {status === 'sent' ? (
              <div className="form-success" role="status">
                <h3>Thanks — we've got it.</h3>
                <p>We'll reach out within one business day to schedule your free audit.</p>
              </div>
            ) : (
            <form className="audit-form" onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Your name" className="form-input" autoComplete="name" required />
              <input type="text" name="business" placeholder="Business name & location" className="form-input" autoComplete="organization" required />
              <input type="tel" name="phone" placeholder="Mobile number" className="form-input" autoComplete="tel" required />
              <input type="email" name="email" placeholder="Email" className="form-input" autoComplete="email" required />
              <input type="text" name="website" className="form-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <label className="consent-checkbox">
                <input type="checkbox" name="smsConsent" required />
                <span>By checking this box, I agree to receive SMS text messages regarding my inquiry and service updates. Message and data rates may apply.</span>
              </label>

              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className="btn solid full-width" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Book a free automation audit'}
              </button>
            </form>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap foot-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
            <img src="/brand/logo-dark.png" alt="Curivanta" className="dark-logo" style={{ height: '28px', width: 'auto' }} />
            <img src="/brand/logo-light.png" alt="Curivanta" className="light-logo" style={{ height: '28px', width: 'auto' }} />
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

export default Index;
