import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChatAnimation } from '../components/ChatAnimation';
import { SalonPlanBuilder, type PlanId, type AddonId } from '../components/SalonPlanBuilder';

const faqs = [
  {
    q: "What if the caller doesn't reply to the text?",
    a: "Then nothing is lost compared with today's missed call, except they now have a text from your salon ready whenever they want to book. Every missed call and text shows up in one inbox, so you can follow up yourself any time."
  },
  {
    q: "Is it OK to text people who called us?",
    a: "We only text people who just called your salon, never a purchased list. Every first message tells them how to opt out (reply STOP), and we register your number with the carriers as part of setup."
  },
  {
    q: "Which booking software do you work with?",
    a: "Salon Ultimate. The AI reads your live availability and writes confirmed bookings straight into your appointment book, so your staff keeps using the same calendar. Using something else? Talk to us first."
  },
  {
    q: "Can I add voice answering?",
    a: "Yes. With the Voice plans, the AI picks up every call live, in English or Spanish, and books it on the spot. Missed-call text-back is included in every plan."
  },
  {
    q: "What happens after hours?",
    a: "The same as during the day: if a call isn't answered, the caller gets a text within seconds and can book right there. After hours it books into your next open slots, so you can open the salon to new appointments."
  },
  {
    q: "Will clients know they're texting an AI?",
    a: "It replies as your salon, by name, and gets them helped in seconds. Most clients never ask. They're just glad someone got back to them. You see every conversation, so nothing happens out of sight."
  },
  {
    q: "What if the AI can't handle a request?",
    a: "It doesn't guess, and it never strands a client. It captures the details and alerts you or your manager instantly so you can follow up within minutes. You set the rules for what gets escalated."
  },
  {
    q: "How many missed calls does Text-Back cover?",
    a: "Up to 150 missed calls a month (500 texts), which is more than most salons use. If you ever go over, extra texts are $20 per 500."
  },
  {
    q: "How long does setup take?",
    a: "We handle everything remotely: your number, the Salon Ultimate connection, carrier registration, your services and FAQs. Most salons are live within about a week."
  },
  {
    q: "Can it speak Spanish?",
    a: "Yes. English and Spanish, by text and by voice."
  }
];

// Live voice demo line (GHL Voice AI). Text and chat demos run through the chat widget.
const DEMO_PHONE = "(949) 821-0811";
const DEMO_PHONE_TEL = "tel:+19498210811";

const PLAN_OPTIONS = [
  { id: 'textback', name: 'Text-Back', desc: 'Missed calls' },
  { id: 'starter', name: 'Voice', desc: 'Answer calls' },
  { id: 'notsure', name: 'Not Sure', desc: 'Need a demo' }
];

// Analytics (see public/analytics.js). Clicks on elements with data-umami-event are tracked by Umami itself.
const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const HairSalonBot = () => {
  // Tab title for in-site navigation; link previews come from dist/hair-salon-bot/index.html
  // (scripts/page-meta.mjs), since crawlers don't run JavaScript.
  useEffect(() => { document.title = 'Hair Salon Bot: Missed-Call Text-Back for Salons | Curivanta'; }, []);
  const [selectedPlan, setSelectedPlan] = useState('notsure');
  const [builder, setBuilder] = useState<{ open: boolean; plan: PlanId; addon: AddonId | null }>({ open: false, plan: 'textback', addon: null });
  const openBuilder = (plan: PlanId, addon: AddonId | null = null) => setBuilder({ open: true, plan, addon });
  const talkToUs = () => {
    setSelectedPlan('notsure');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [invalidTracked, setInvalidTracked] = useState(false);

  // Opens the GHL chat widget (bottom-right bubble). If it hasn't loaded or is blocked,
  // the link falls through to the contact form with "Not sure / need a demo" picked.
  // Tracked here rather than with data-umami-event: Umami follows tracked links itself,
  // which would jump the page to #contact even when the chat opens.
  const openChatDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track('salon_cta', { where: e.currentTarget.dataset.where || 'demo' });
    const chat = (window as Window & { leadConnector?: { chatWidget?: { openWidget?: () => void } } }).leadConnector?.chatWidget;
    if (chat?.openWidget) {
      e.preventDefault();
      chat.openWidget();
      track('salon_chat_opened');
    } else {
      setSelectedPlan('notsure');
    }
  };

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
            <Link className="navlink" to="/reviewautomation">Review Automation</Link>
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
                  <SheetClose asChild><Link className="text-xl font-medium" to="/reviewautomation">Review Automation</Link></SheetClose>
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
            <h1 className="reveal is-visible" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Every missed call is a lost booking. <em>We text them back</em> and book them.</h1>
            <p className="sub reveal is-visible" style={{ maxWidth: '600px' }}>When you can't pick up, Curivanta texts the caller within seconds, answers their questions, and books the appointment straight into Salon Ultimate. No voicemail, no lost clients, no extra work for your front desk.</p>
            <div className="cta-row reveal is-visible">
              <a className="btn solid" href="#contact" onClick={openChatDemo} data-where="hero_demo">Try the Demo: Chat or Talk</a>
              <a className="btn ghost" href="#pricing" data-umami-event="salon_cta" data-umami-event-where="hero_get_started">See Pricing</a>
            </div>
            <p className="hero-demo-line reveal is-visible">Want the AI to answer calls too? Hear it live: <a href={DEMO_PHONE_TEL} data-umami-event="salon_demo_call" data-umami-event-where="hero">{DEMO_PHONE}</a></p>
            <ul className="hero-highlights reveal is-visible">
              <li>No contracts, month to month</li>
              <li>Done-for-you setup, 100% remote. Live in days</li>
              <li>Built for Salon Ultimate</li>
            </ul>
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
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '240px' }}>of missed callers won't call back. They book elsewhere</p>
          </div>
          <div className="reveal d3">
            <h3 style={{ fontSize: '3.5rem', color: 'var(--bone)', marginBottom: '8px' }}>24/7</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '240px' }}>Missed callers get a text back and can book, even after close.</p>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section className="approach" id="how-it-works">
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">How It Works</p>
            <h2>Set up once. Every missed call gets a second chance.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>No new software to learn, no changes to how you run your salon. It sits on top of what you already use.</p>
          </div>
          <div className="steps">
            <div className="step reveal">
              <span className="step-num">Step 01</span>
              <div>
                <h3>A call goes unanswered</h3>
                <p>Busy at the chair, on another line, or after hours. Your voicemail greeting lets the caller know a text is on its way.</p>
              </div>
            </div>
            <div className="step reveal d1">
              <span className="step-num">Step 02</span>
              <div>
                <h3>We text them back in seconds</h3>
                <p>The AI texts the caller and answers questions about services, prices and hours, in English or Spanish.</p>
              </div>
            </div>
            <div className="step reveal d2">
              <span className="step-num">Step 03</span>
              <div>
                <h3>It books the appointment</h3>
                <p>The AI checks live availability in Salon Ultimate, offers open slots, books the appointment, and sends a confirmation. Every conversation lands in one inbox, and you can step in any time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="integrations" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '1000px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
            <p className="eyebrow">Built for Salon Ultimate</p>
            <h2>Books straight into your Salon Ultimate appointment book.</h2>
          </div>
          <p className="reveal d1" style={{ color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '760px', margin: '0 auto 48px', textAlign: 'center' }}>No new system. No double entry. No retraining your staff, and no behavior change for your clients. Curivanta reads your real availability in Salon Ultimate and writes confirmed bookings into it, whether the booking starts as a text or a phone call. We handle the connection, the phone number, and the carrier registration. You change nothing about how you run your salon.</p>
          <div className="service-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '640px', margin: '0 auto' }}>
            <div className="service-card reveal d1">
              <h3>Salon Ultimate</h3>
              <p>Live availability checked on every conversation, confirmed appointments written back automatically. This is the exact setup running in my own salons today.</p>
            </div>
          </div>
          <p className="reveal d2" style={{ textAlign: 'center', marginTop: '24px', color: 'var(--bone-dimmer)', fontSize: '0.95rem' }}>Using different booking software? <a href="#contact" onClick={(e) => { e.preventDefault(); talkToUs(); }} style={{ color: 'var(--brass-light)' }}>Talk to us first</a>.</p>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      {/* Live demo line (voice). A call recording can be added here later. */}
      <section id="hear-it" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <div className="reveal">
            <p className="eyebrow" style={{ marginBottom: '16px' }}>Want us to answer the phone too?</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '24px' }}>Add Voice AI.</h2>
            <p style={{ color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.8 }}>With a Voice plan, the AI picks up every call live, answers questions and books the appointment on the spot, 24/7, in English or Spanish. Missed-call text-back is included. This isn't a script reading: call our demo salon and hear it yourself.</p>
          </div>
          <div className="demo-call reveal d1">
            <p className="demo-call-label">Call the demo salon</p>
            <a className="demo-call-number" href={DEMO_PHONE_TEL} data-umami-event="salon_demo_call" data-umami-event-where="hear_it">{DEMO_PHONE}</a>
            <p className="demo-call-sub">Available 24/7. On a computer? Talk to it in your browser below.</p>
            <div className="demo-call-tries">
              <p>Things to try:</p>
              <ul>
                <li>"Book a first haircut for Saturday"</li>
                <li>"How much is a girls cut?"</li>
                <li>Speak in Spanish</li>
                <li>Ask for something unusual and see how it hands off to the manager</li>
              </ul>
            </div>
          </div>
          <p className="reveal d2" style={{ marginTop: '28px', color: 'var(--bone-dim)' }}>No phone handy? Chat or talk to the same AI right here.</p>
          <div className="cta-row" style={{ justifyContent: 'center', marginTop: '14px', display: 'flex' }}>
            <a className="btn ghost" href="#contact" onClick={openChatDemo} data-where="hear_it_demo">Talk or Chat in Your Browser</a>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="handoff" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div className="reveal">
            <p className="eyebrow" style={{ marginBottom: '16px' }}>When the AI needs a human</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>It never guesses. It never dead-ends a client.</h2>
            <p style={{ color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.8 }}>Curivanta handles the everyday conversations - bookings, hours, prices, directions, reschedules. When a client needs something outside that playbook, it takes the details and alerts you or your manager instantly, so you can call or text back within minutes. Your client always reaches a resolution; you always know what happened.</p>
          </div>
          <div className="reveal d1" style={{ marginTop: '40px', padding: '32px 36px', background: 'var(--ink-soft)', border: '1px solid var(--line)', borderLeft: '3px solid var(--brass)', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.15rem', color: 'var(--bone)', lineHeight: 1.7 }}>This is the part most AI receptionists skip. It's the part we watch closest - because a clean handoff isn't a failure. It's the feature.</p>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="pricing" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">Pricing</p>
            <h2>Simple plans. No contracts.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>Month to month, cancel anytime. Texting is included in every plan. Built and priced by an operator, not a software vendor.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column', borderColor: 'var(--brass)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--brass)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Text-Back: Most Popular</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>$99</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--bone-dimmer)' }}>$99 setup</span>
                <span style={{ color: 'var(--brass)' }}>$49 for new customers</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Every missed call gets a text back within seconds
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> AI answers questions and books straight into Salon Ultimate
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Two-way texting
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Bilingual English &amp; Spanish
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Up to 150 missed calls handled a month
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Every conversation in one inbox. Step in any time
                </li>
              </ul>
              <button type="button" className="btn solid" onClick={() => openBuilder('textback')} style={{ width: '100%', justifyContent: 'center' }}>Start with Text-Back</button>
            </div>

            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Voice: AI Answers Your Calls</h3>
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
                  <span style={{ color: 'var(--brass)' }}>✓</span> AI picks up every call live, 24/7
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Answers questions and books on the call
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Works during peak hours and closed hours
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> 300 AI voice minutes a month included
                </li>
              </ul>
              <button type="button" className="btn ghost" onClick={() => openBuilder('starter')} style={{ width: '100%', justifyContent: 'center' }}>Start with Voice</button>
            </div>

            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Voice Pro: For Busy Salons</h3>
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
                  <span style={{ color: 'var(--brass)' }}>✓</span> Everything in Voice
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> 1,000 AI voice minutes a month included
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Scales during Saturday rush without missing a booking
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Owner and front desk freed from phone management
                </li>
                <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' }}>
                  <span style={{ color: 'var(--brass)' }}>✓</span> Voice overage billed at cost, no markup
                </li>
              </ul>
              <button type="button" className="btn ghost" onClick={() => openBuilder('autopilot')} style={{ width: '100%', justifyContent: 'center' }}>Start with Voice Pro</button>
            </div>
          </div>

          <div className="service-card reveal d2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', marginTop: '24px' }}>
            <span style={{ background: 'var(--brass)', color: 'var(--ink)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, flex: 'none' }}>W</span>
            <div style={{ flex: '1 1 280px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>WhatsApp Add-On: +$49/mo, free setup</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--bone-dim)' }}>Add to any plan. The same AI books over WhatsApp, an untapped channel that meets families where they already message.</p>
            </div>
            <button type="button" className="btn ghost" onClick={() => openBuilder('textback', 'whatsapp')} style={{ flex: 'none' }}>Add WhatsApp</button>
          </div>

          <div className="reveal d3" style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px', textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: 'var(--bone-dim)' }}>💡 If text-back saves just <strong>1 booking a week</strong>, at a $30 haircut that's <strong style={{ color: 'var(--brass)' }}>$120/month</strong> back against a $99 cost. Most salons miss far more than one call a week.</p>
          </div>
          <p className="reveal d3" style={{ textAlign: 'center', marginTop: '20px', color: 'var(--bone-dimmer)', fontSize: '0.9rem' }}>Sign up online in minutes: no contract, cancel anytime, live in about a week. Not sure which plan? <a href="#contact" onClick={(e) => { e.preventDefault(); talkToUs(); }} style={{ color: 'var(--brass-light)' }}>Talk to us first</a>.</p>
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
          <h2 className="reveal">Not sure yet? Talk to us first.</h2>
          <p className="sub reveal d1" style={{ color: 'var(--bone-dim)', marginBottom: '40px' }}>Leave your details and we'll reach out to answer your questions and help you pick the right plan.</p>
          
          {status === 'sent' ? (
            <div className="reveal d2 is-visible form-success" role="status" style={{ background: 'var(--ink)', padding: '40px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3>Thanks, we've got it.</h3>
              <p>We'll reach out within one business day to answer your questions and get you set up.</p>
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

      <SalonPlanBuilder
        open={builder.open}
        onOpenChange={(open) => setBuilder((b) => ({ ...b, open }))}
        initialPlan={builder.plan}
        initialAddon={builder.addon}
        onTalkToUs={talkToUs}
      />

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
