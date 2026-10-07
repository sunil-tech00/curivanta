import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChatAnimation } from '../components/ChatAnimation';

const faqs = [
  {
    q: "Does this replace my front desk staff?",
    a: "Not necessarily. It acts as a safety net to ensure no calls or messages are missed when your staff is busy with clients in the salon. It handles the routine bookings and inquiries, freeing up your team to provide a better in-person experience."
  },
  {
    q: "What happens when the AI can't answer something?",
    a: "The AI is trained to hand off the conversation gracefully. It will notify your team that human assistance is needed, and you can jump right into the chat or call the customer back from the unified inbox."
  },
  {
    q: "Do I need to change my booking software?",
    a: "No, the AI integrates directly with your existing scheduling tools like Salon Ultimate, so appointments are booked exactly where you're used to seeing them."
  },
  {
    q: "Is there a contract?",
    a: "No, our plans are month-to-month and you can cancel at any time. We believe in earning your business every month."
  },
  {
    q: "How long does setup take?",
    a: "Typical setup takes less than 48 hours. We handle the technical configuration, test it thoroughly, and provide a simple onboarding session before going live."
  }
];

const PLAN_OPTIONS = [
  { id: 'starter', name: 'Starter', desc: 'AI Voice' },
  { id: 'autopilot', name: 'Autopilot', desc: 'Fully Automated' },
  { id: 'notsure', name: 'Not Sure', desc: 'Need a demo' }
];

// Analytics (see public/analytics.js). Clicks on elements with data-umami-event are tracked by Umami itself.
const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const HairSalonBot = () => {
  const [selectedPlan, setSelectedPlan] = useState('autopilot');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [invalidTracked, setInvalidTracked] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'salon',
          plan: selectedPlan,
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
      track('salon_form_submitted', { plan: selectedPlan });
    } catch (err) {
      track('salon_form_error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please email hello@curivanta.com.');
      setStatus('idle');
    }
  };

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
    
    const script = document.createElement('script');
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.setAttribute("data-resources-url", "https://widgets.leadconnectorhq.com/chat-widget/loader.js");
    script.setAttribute("data-widget-id", "6a49af730fa92556971f3ea3");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      io.disconnect();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
            <a className="btn ghost desktop-only" href="#contact" data-umami-event="salon_cta" data-umami-event-where="nav">Book a free audit</a>
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

      <section className="hero" style={{ paddingTop: '140px' }}>
        <div className="hero-inner hero-grid">
          <div className="hero-content">
            <p className="eyebrow badge reveal is-visible">
              <svg className="spark" viewBox="0 0 16 16" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1l1.2 4.3L13.5 6.5l-4.3 1.2L8 12l-1.2-4.3L2.5 6.5l4.3-1.2L8 1z" fill="currentColor"/>
              </svg> 
              Proven and Working at multiple locations
            </p>
            <h1 className="reveal is-visible" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Never miss a call, text or<br /><em>appointment</em> again.</h1>
            <p className="sub reveal is-visible" style={{ maxWidth: '600px' }}>Stop losing appointments to unanswered calls and manual processes. An AI-powered front desk that answers your phone and text/whatsapp messages, lets customers self-select appointment from available slots and books appointments in Salon Ultimate - so you can focus on managing the salon, not managing phones.</p>
            <div className="cta-row reveal is-visible">
              <a className="btn solid" href="#contact" onClick={() => setSelectedPlan('notsure')} data-umami-event="salon_cta" data-umami-event-where="hero_demo">Try Demo in Chat</a>
              <a className="btn ghost" href="#contact" data-umami-event="salon_cta" data-umami-event-where="hero_get_started">Get Started</a>
            </div>
          </div>
          
          <div className="hero-visual reveal is-visible d2" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'var(--brass)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
            <ChatAnimation />
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: 'var(--ink-soft)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          <div className="reveal d1">
            <h3 style={{ fontSize: '3.5rem', color: 'var(--bone)', marginBottom: '8px' }}>62%</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '240px' }}>of calls to salons go unanswered during peak hours</p>
          </div>
          <div className="reveal d2">
            <h3 style={{ fontSize: '3.5rem', color: 'var(--bone)', marginBottom: '8px' }}>85%</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '240px' }}>of missed callers won't call back — they book elsewhere</p>
          </div>
          <div className="reveal d3">
            <h3 style={{ fontSize: '3.5rem', color: 'var(--bone)', marginBottom: '8px' }}>24/7</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '240px' }}>Your AI answers calls and texts, even after close.</p>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section className="approach" id="how-it-works">
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">How It Works</p>
            <h2>Set up once. Capture every lead after that.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>No new software to learn, no changes to how you run your salon. It sits on top of what you already use.</p>
          </div>
          <div className="steps">
            <div className="step reveal">
              <span className="step-num">Step 01</span>
              <div>
                <h3>We configure your AI</h3>
                <p>Your hours, services, prices, and FAQs get loaded in. The AI speaks in your salon's voice, and knows what it can and can't answer.</p>
              </div>
            </div>
            <div className="step reveal d1">
              <span className="step-num">Step 02</span>
              <div>
                <h3>It handles every channel</h3>
                <p>Inbound calls, SMS and WhatsApp messages get answered instantly.</p>
              </div>
            </div>
            <div className="step reveal d2">
              <span className="step-num">Step 03</span>
              <div>
                <h3>You see every conversation</h3>
                <p>Full conversation history in one inbox. Step in and take over any chat, any time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="pricing" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">Pricing</p>
            <h2>Simple plans. No contracts.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>Month to month, cancel anytime. Built and priced by an operator, not a software vendor.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Starter Plan */}
            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Starter — AI Voice</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>$149</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--bone-dimmer)' }}>$99 setup</span>
                <span style={{ color: 'var(--brass)' }}>$49 for new customers</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Every call answered, 24/7 — no dead ends, no voicemail
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> AI handles the full call — answers questions, checks availability, captures booking requests, no staff needed to pick up
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Bilingual English &amp; Spanish
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Works during peak hours and closed hours
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Clean booking notification sent to your team
                </li>
              </ul>
              <a className="btn ghost" href="#contact" onClick={() => setSelectedPlan('starter')} data-umami-event="salon_cta" data-umami-event-where="pricing_starter" style={{ width: '100%', justifyContent: 'center' }}>Choose Starter</a>
            </div>

            {/* Autopilot Plan */}
            <div className="service-card reveal d2" style={{ display: 'flex', flexDirection: 'column', borderColor: 'var(--brass)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--brass)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Autopilot — Fully Automated Booking</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>$249</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--bone-dimmer)' }}>$199 setup</span>
                <span style={{ color: 'var(--brass)' }}>$149 for new customers</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Voice + two-way SMS included — customers can call or text to book
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Fully hands-free — zero manual action from owner
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Books appointments 24/7 — even when closed
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Eliminates booking errors and missed notifications
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Owner/Manager/Receptionist completely freed from phone management
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Scales during Saturday rush without missing a booking
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Usage overage billed at cost — no markup
                </li>
              </ul>
              <a className="btn solid" href="#contact" onClick={() => setSelectedPlan('autopilot')} data-umami-event="salon_cta" data-umami-event-where="pricing_autopilot" style={{ width: '100%', justifyContent: 'center' }}>Choose Autopilot</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* WhatsApp Add-On */}
            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--brass)', color: 'var(--ink)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>W</span>
                WhatsApp Add-On
              </h3>
              <div style={{ fontSize: '0.85rem', margin: '16px 0', display: 'flex', gap: '8px' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--bone-dimmer)' }}>$49 setup</span>
                <span style={{ color: 'var(--brass)' }}>FREE Setup</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--brass)', marginBottom: '16px' }}>Add to Starter or Autopilot</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Untapped channel — competitors aren't using it
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Immediate differentiation in Latino and Asian-dense markets
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Meets families where they already communicate
                </li>
              </ul>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$49</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <a className="btn ghost" href="#contact" data-umami-event="salon_cta" data-umami-event-where="pricing_whatsapp" style={{ width: '100%', justifyContent: 'center' }}>Add WhatsApp</a>
            </div>

            {/* SMS Add-On */}
            <div className="service-card reveal d2" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--brass)', color: 'var(--ink)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>S</span>
                SMS Add-On
              </h3>
              <div style={{ fontSize: '0.85rem', margin: '16px 0', display: 'flex', gap: '8px' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--bone-dimmer)' }}>$49 setup</span>
                <span style={{ color: 'var(--brass)' }}>$35 for new customers</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--bone-dimmer)', marginBottom: '8px' }}>Covers required SMS carrier/A2P registration.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--brass)', marginBottom: '16px' }}>Available on Starter only — Autopilot already includes SMS.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Two-way text booking — customers can text instead of call
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Works alongside your existing Salon Ultimate reminders
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Same AI, same inbox — one more way clients reach you
                </li>
              </ul>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$49</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <a className="btn ghost" href="#contact" data-umami-event="salon_cta" data-umami-event-where="pricing_sms" style={{ width: '100%', justifyContent: 'center' }}>Add SMS</a>
            </div>
          </div>

          <div className="reveal d3" style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px', textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: 'var(--bone-dim)' }}>💡 If this system books just <strong>1 extra appointment per day</strong>, that's <strong style={{ color: 'var(--brass)' }}>$300–400/month</strong> in added revenue against a $149 cost.</p>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="story" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div className="reveal">
            <p className="eyebrow" style={{ marginBottom: '16px' }}>Built by an Owner</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>This isn't vendor software. It runs in my own salons.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.8 }}>
              <p>I own and operate two franchise hair salon locations. I built Curivanta because my own front desk couldn't answer the phone during weekend rush and every missed call was a family booking somewhere else.</p>
              <p>Every feature was tested on real customers, real bookings, and real weekend chaos before it was ever offered to another owner. When something breaks, it breaks in my salon first.</p>
            </div>
          </div>
          <div className="reveal d1" style={{ marginTop: '48px', padding: '40px', background: 'var(--ink-soft)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--bone)', lineHeight: 1.6 }}>"You're not buying software from a salesperson. You're getting the exact system another franchise salon owner built to fix the same problem you have."</p>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="faq" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">Knowledge Base</p>
            <h2>Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className={`reveal d${(i % 3) + 1} border-none`} style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', borderRadius: '12px', padding: '0 24px' }}>
                <AccordionTrigger className="hover:no-underline py-6" style={{ fontSize: '1.1rem' }}>
                  <span className="text-left font-serif font-[440] text-[color:var(--bone)]">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="text-[color:var(--bone-dim)] text-base leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="final-cta" id="contact" style={{ padding: '100px 0', background: 'var(--ink-soft)' }}>
        <div className="wrap" style={{ maxWidth: '600px' }}>
          <h2 className="reveal">Ready to get started?</h2>
          <p className="sub reveal d1" style={{ color: 'var(--bone-dim)', marginBottom: '40px' }}>Leave your details below and our team will reach out to get your Hair Salon Bot configured and running.</p>
          
          {status === 'sent' ? (
            <div className="reveal d2 is-visible form-success" role="status" style={{ background: 'var(--ink)', padding: '40px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3>Thanks — we've got it.</h3>
              <p>We'll reach out within one business day to get your Hair Salon Bot set up.</p>
            </div>
          ) : (
          <form
            className="reveal d2"
            onSubmit={handleSubmit}
            onFocus={() => { if (!started) { setStarted(true); track('salon_form_started'); } }}
            onInvalidCapture={(e) => {
              if (invalidTracked) return;
              setInvalidTracked(true);
              track('salon_form_invalid', { field: (e.target as HTMLInputElement).name || 'unknown' });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink)', padding: '40px', borderRadius: '12px', border: '1px solid var(--line)', textAlign: 'left' }}
          >
            <input type="text" name="name" placeholder="Your name" autoComplete="name" required style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', color: 'var(--bone)', width: '100%', boxSizing: 'border-box' }} />
            <input type="text" name="business" placeholder="Business name & location" autoComplete="organization" required style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', color: 'var(--bone)', width: '100%', boxSizing: 'border-box' }} />
            <input type="tel" name="phone" placeholder="Mobile number" autoComplete="tel" required style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', color: 'var(--bone)', width: '100%', boxSizing: 'border-box' }} />
            <input type="email" name="email" placeholder="Email" autoComplete="email" required style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', color: 'var(--bone)', width: '100%', boxSizing: 'border-box' }} />
            <input type="text" name="website" className="form-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div role="radiogroup" aria-label="Plan" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedPlan === p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  style={{ border: selectedPlan === p.id ? '1px solid var(--brass)' : '1px solid var(--line)', background: selectedPlan === p.id ? 'rgba(77,107,246,0.1)' : 'transparent', padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: 'inherit', font: 'inherit' }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--bone-dim)' }}>{p.desc}</div>
                </button>
              ))}
            </div>

            <label className="consent-checkbox">
              <input type="checkbox" name="smsConsent" required />
              <span>By checking this box, I agree to receive SMS text messages regarding my inquiry and service updates. Message and data rates may apply.</span>
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn solid full-width" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Get Started'}
            </button>
          </form>
          )}
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

export default HairSalonBot;
