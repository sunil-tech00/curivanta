import { useEffect, useState } from 'react';
import { DeviceAnimation } from '../components/DeviceAnimation';
import { ThemeToggle } from '../components/ThemeToggle';
import { SiteFooter } from '../components/SiteFooter';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Analytics (see public/analytics.js). Clicks on elements with data-umami-event are tracked by Umami itself.
const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const Index = () => {
  useEffect(() => { document.title = 'Curivanta | AI Consulting & Automation for Small Business'; }, []);
  // Scroll funnel: how far down the page visitors get (once per section per visit).
  useEffect(() => {
    const seen = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = (entry.target as HTMLElement).dataset.trackView;
        if (entry.isIntersecting && id && !seen.has(id)) {
          seen.add(id);
          track('reached_' + id);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('[data-track-view]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

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
  const [started, setStarted] = useState(false);
  const [invalidTracked, setInvalidTracked] = useState(false);

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
      track('audit_form_submitted');
    } catch (err) {
      track('audit_form_error');
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
            <Link className="navlink" to="/website-development" data-umami-event="nav_websites" data-umami-event-where="nav">Websites</Link>
            <Link className="navlink" to="/hair-salon-bot" data-umami-event="nav_hair_salon_bot" data-umami-event-where="nav">Hair Salon Bot</Link>
            <Link className="navlink" to="/reviewautomation" data-umami-event="nav_review_automation" data-umami-event-where="nav">Review Automation</Link>
            <ThemeToggle />
            
            <div className="mobile-menu-trigger">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -mr-2 flex items-center justify-center text-foreground" aria-label="Menu" data-umami-event="mobile_menu_open">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col gap-6 pt-16 bg-background border-border">
                  <SheetClose asChild><Link className="text-xl font-medium" to="/website-development" data-umami-event="nav_websites" data-umami-event-where="mobile_menu">Websites</Link></SheetClose>
                  <SheetClose asChild><Link className="text-xl font-medium" to="/hair-salon-bot" data-umami-event="nav_hair_salon_bot" data-umami-event-where="mobile_menu">Hair Salon Bot</Link></SheetClose>
                  <SheetClose asChild><Link className="text-xl font-medium" to="/reviewautomation" data-umami-event="nav_review_automation" data-umami-event-where="mobile_menu">Review Automation</Link></SheetClose>
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
            <p className="sub reveal is-visible">Curivanta helps small businesses answer every call, book every appointment, and answer every review, with AI workflows, websites, and custom builds wired into the tools you already use. Built by an owner who was tired of doing everything by hand.</p>
            <div className="cta-row reveal is-visible">
              <a className="btn solid" href="#contact" data-umami-event="cta_book_audit" data-umami-event-where="hero">Book a free automation audit</a>
              <a className="btn ghost" href="#services" data-umami-event="cta_see_services" data-umami-event-where="hero">See what we build</a>
            </div>
          </div>
          <div className="hero-visual reveal is-visible d2">
            <DeviceAnimation />
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section className="services" id="services" data-track-view="services">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">What we build</p>
            <h2>Your front desk and back office, minus the manual work.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>Customer-facing AI that answers, books, and follows up, plus the builds and integrations behind it. Every engagement is scoped around your business: your tools, your workflows, your customers.</p>
          </div>
          <div className="service-grid three">
            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M8 22c-2.5-1.8-4-4.5-4-7.5C4 9.3 9.8 5 17 5s13 4.3 13 9.5S24.2 24 17 24c-1.4 0-2.7-.2-4-.5L8 26z" stroke="#4d6bf6" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M12 14.5v.01M17 14.5v.01M22 14.5v.01" stroke="#7c93ff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Conversational Booking</h3>
              <p>Missed-call text-back, built in. When a call goes unanswered, the AI texts the caller within seconds, answers their questions, and books the appointment over SMS, WhatsApp, or web chat, straight into your calendar.</p>
              <Link className="svc-link" to="/hair-salon-bot" data-umami-event="home_product" data-umami-event-product="conversational_booking">See it for salons →</Link>
            </div>
            <div className="service-card reveal d2" style={{ display: 'flex', flexDirection: 'column' }}>
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M27 22.5v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 6.5 9.2 2 2 0 0 1 8.5 7h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" stroke="#4d6bf6" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
              <h3>AI Voice Answering</h3>
              <p>A phone line that never goes to voicemail. The AI answers every call in your business's own voice, day, night, and during your busiest hour, and books real appointments on the spot.</p>
              <Link className="svc-link" to="/hair-salon-bot" data-umami-event="home_product" data-umami-event-product="voice_answering">See it for salons →</Link>
            </div>
            <div className="service-card reveal d3" style={{ display: 'flex', flexDirection: 'column' }}>
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M17 5l3.6 7.3 8 1.2-5.8 5.6 1.4 8L17 23.3l-7.2 3.8 1.4-8-5.8-5.6 8-1.2z" stroke="#4d6bf6" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
              <h3>Review &amp; Reputation Automation</h3>
              <p>More reviews, every one answered. Review requests go out automatically after each visit, every Google review gets a considered reply, and a negative review is routed to you first. No gating, fully in line with Google's rules.</p>
              <Link className="svc-link" to="/reviewautomation" data-umami-event="home_product" data-umami-event-product="review_automation">See Review Automation →</Link>
            </div>
          </div>
          <div className="service-grid" style={{ marginTop: '28px' }}>
            <div className="service-card reveal d1">
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M6 17h9M15 17l-3-3M15 17l-3 3" stroke="#4d6bf6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28 17h-9M19 17l3-3M19 17l3 3" stroke="#7c93ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="17" r="15" stroke="#4d6bf6" strokeWidth="1" opacity="0.4"/>
              </svg>
              <h3>AI Workflow Automation</h3>
              <p>The busywork that eats your week: lead follow-up, appointment reminders, rebooking nudges, internal reporting. Rebuilt as automated workflows that run without you touching them.</p>
            </div>
            <div className="service-card reveal d2" style={{ display: 'flex', flexDirection: 'column' }}>
              <svg viewBox="0 0 34 34" fill="none">
                <rect x="4" y="7" width="26" height="20" rx="1.5" stroke="#4d6bf6" strokeWidth="1.6"/>
                <path d="M4 12h26" stroke="#4d6bf6" strokeWidth="1.6"/>
                <circle cx="8" cy="9.5" r="0.9" fill="#7c93ff"/>
                <circle cx="11" cy="9.5" r="0.9" fill="#7c93ff"/>
              </svg>
              <h3>AI Websites</h3>
              <p>A site that does more than sit there. Booking, lead capture, and AI chat wired in from day one; not bolted on six months after launch.</p>
              <Link className="svc-link" to="/website-development" data-umami-event="home_product" data-umami-event-product="websites">See Websites →</Link>
            </div>
            <div className="service-card reveal d1">
              <svg viewBox="0 0 34 34" fill="none">
                <path d="M12 10l-7 7 7 7M22 10l7 7-7 7" stroke="#4d6bf6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 7l-4 20" stroke="#7c93ff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <h3>Custom Application Development</h3>
              <p>When no off-the-shelf tool fits, we build the one that does: quoting and sizing tools, internal dashboards, customer portals. Scoped to the one problem you're solving, built on infrastructure you own, with no per-seat rent on your own tool.</p>
            </div>
            <div className="service-card reveal d2">
              <svg viewBox="0 0 34 34" fill="none">
                <circle cx="8" cy="17" r="4" stroke="#4d6bf6" strokeWidth="1.6"/>
                <circle cx="26" cy="9" r="4" stroke="#4d6bf6" strokeWidth="1.6"/>
                <circle cx="26" cy="25" r="4" stroke="#4d6bf6" strokeWidth="1.6"/>
                <path d="M12 15.5l10-4.5M12 18.5l10 4.5" stroke="#7c93ff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <h3>Custom Integrations</h3>
              <p>Your phone, booking software, CRM, and inbox don't talk to each other, so your staff re-types everything. We build the connections: APIs and middleware that move calls, bookings, and customer data between the tools you already use, in real time. Our salon bots book through exactly this kind of bridge.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section className="approach" id="approach" data-track-view="approach">
        <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">How we work</p>
          <h2>One audit. One build.</h2>
        </div>
          <div className="steps">
            <div className="step reveal">
              <span className="step-num">01 · Audit</span>
              <div>
                <h3>We map where manual work is actually costing you</h3>
                <p>A short, honest look at where calls, leads, and follow-ups are falling through. Not a generic checklist, a read on your actual business.</p>
              </div>
            </div>
            <div className="step reveal d1">
              <span className="step-num">02 · Build</span>
              <div>
                <h3>We wire it into tools you already use</h3>
                <p>Workflows, bots, and sites built on infrastructure you can see and control, not a black box you're locked into.</p>
              </div>
            </div>
            <div className="step reveal d2">
              <span className="step-num">03 · Launch &amp; tune</span>
              <div>
                <h3>Live against real customers, not a demo script</h3>
                <p>We stay on it after launch, refining against how people actually call, text, and book; not how the pitch deck said they would.</p>
              </div>
            </div>
          </div>
      </div>
    </section>

    <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

    <section className="final-cta" id="contact" data-track-view="contact">
        <div className="wrap">
          <p className="eyebrow reveal">Ready when you are</p>
          <h2 className="reveal d1">Let's find the manual work worth automating.</h2>
          <p className="sub reveal d2">A free audit is 20 minutes: a look at your calls, your site, and your follow-ups, and an honest read on what's actually worth automating first.</p>
          <div className="audit-form-container reveal d3">
            {status === 'sent' ? (
              <div className="form-success" role="status">
                <h3>Thanks, we've got it.</h3>
                <p>We'll reach out within one business day to schedule your free audit.</p>
              </div>
            ) : (
            <form
              className="audit-form"
              onSubmit={handleSubmit}
              onFocus={() => { if (!started) { setStarted(true); track('audit_form_started'); } }}
              onInvalidCapture={(e) => {
                if (invalidTracked) return;
                setInvalidTracked(true);
                track('audit_form_invalid', { field: (e.target as HTMLInputElement).name || 'unknown' });
              }}
            >
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

      <SiteFooter />
    </div>
  );
};

export default Index;
