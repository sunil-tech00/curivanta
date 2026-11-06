import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { SiteFooter } from '../components/SiteFooter';
import { Link } from 'react-router-dom';
import { MapPin, Handshake, Star, CalendarCheck, Sun, PhoneCall, Users, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReviewsCheckout, type ReviewsPlanId } from '../components/ReviewsCheckout';


const faqs = [
  {
    q: "Is this allowed by Google?",
    a: "Yes. We ask every client the same way and send them straight to Google. We never filter out unhappy clients or offer anything in exchange for a review. Both break Google's rules and can get reviews removed. Asking everyone, at the right moment, is what works."
  },
  {
    q: "Can you remove bad reviews?",
    a: "No one can do that honestly. What we can do is make sure your happy clients outnumber them, and reply to every review, good or bad, quickly and professionally."
  },
  {
    q: "Do I need new software?",
    a: "No. Whatever booking software you use, we connect to it directly where we can. If we can't, a simple daily export of that day's clients is all we need. Your front desk does nothing different."
  },
  {
    q: "How often is a client asked?",
    a: "One request after the visit, then up to two gentle reminders. Clients who already left a review aren't asked again, and regulars aren't messaged after every haircut."
  },
  {
    q: "How long until I see reviews?",
    a: "Most salons see the first new reviews within days of going live, from clients who visited that week. After that, reviews come in steadily with every new visit."
  },
  {
    q: "Who writes the replies to my reviews?",
    a: "The AI drafts a reply in your salon's voice for every review. You can let it post automatically or approve each one first. Negative reviews always come to you before anything is posted."
  },
  {
    q: "Can I see how each stylist is doing?",
    a: "Yes. Every morning you get an email with yesterday's feedback: ratings and replies for each stylist and each location, plus any client who had a poor visit and should get a call back. It's included in both plans, and it's built for owners who can't be in the salon every day."
  },
  {
    q: "How does the free month work?",
    a: "You get the full service free for your first month. Sign up online with a card. The only charge today is a one-time, non-refundable $35 that covers text message carrier registration, and your free month starts when you go live. If it isn't for you, cancel before the month ends and you won't be charged. Every review you earned stays on your Google profile."
  },
  {
    q: "Is there a contract?",
    a: "No. Month to month, cancel anytime. The reviews you earn are yours to keep."
  }
];

const PLAN_OPTIONS = [
  { id: 'starter', name: 'Starter', desc: 'One location' },
  { id: 'growth', name: 'Growth', desc: 'Busy salon' },
  { id: 'notsure', name: 'Not Sure', desc: 'Talk first' }
];

const VALUE = [
  { icon: MapPin, title: 'Show up first on Google Maps', text: "Fresh reviews tell Google your salon is active and trusted. That helps you rank higher in local search and on the map, right where new clients are looking." },
  { icon: Handshake, title: 'Build trust before they walk in', text: "New clients read reviews before they ever call. A steady stream of recent five-star reviews tells them you're the right place for their next cut." },
  { icon: Star, title: 'Win the side-by-side comparison', text: "When two salons look alike, the one with more reviews and a higher rating gets the call. Every review widens the gap between you and the shop down the street." },
  { icon: CalendarCheck, title: 'Fill more chairs', text: "Higher rankings and more trust add up to more calls, more bookings, and more new clients who keep coming back." }
];
const FLOW = ['Happy client', 'Google review', 'Higher ranking', 'More new clients'];

const CHECK = <span style={{ color: 'var(--brass)' }}>✓</span>;
const liStyle = { display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--bone-dim)' };
const listStyle = { listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '16px' };

const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

// Hero visual: the email and text a client gets after their visit, the review they lead to, and the AI reply.
function ReviewMock() {
  const card = { background: 'var(--ink-soft)', border: '1px solid var(--line)', borderRadius: '16px', padding: '16px 18px', textAlign: 'left' as const };
  const label = { fontSize: '0.72rem', color: 'var(--bone-dimmer)', marginBottom: '8px', fontFamily: 'var(--mono)', letterSpacing: '0.08em', textTransform: 'uppercase' as const };
  const arrow = <div style={{ textAlign: 'center', color: 'var(--brass-light)', fontSize: '1.1rem', lineHeight: 1 }}>↓</div>;
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        <div style={card}>
          <p style={label}>Email</p>
          <p style={{ color: 'var(--bone)', fontSize: '0.92rem', fontWeight: 600, marginBottom: '6px' }}>How was your cut with Marcus?</p>
          <p style={{ color: 'var(--bone-dim)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '12px' }}>Thanks for visiting today, Daniel. Your review helps others find us.</p>
          <span style={{ display: 'inline-block', background: 'var(--brass)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, padding: '7px 12px', borderRadius: '999px' }}>★ Leave a Google review</span>
        </div>
        <div style={card}>
          <p style={label}>Text message</p>
          <p style={{ color: 'var(--bone)', fontSize: '0.88rem', lineHeight: 1.5 }}>Hi Daniel! Thanks for coming in to see Marcus today. Got a minute for a quick Google review? <span style={{ color: 'var(--brass-light)' }}>g.page/r/curivanta-studio</span></p>
        </div>
      </div>
      {arrow}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <strong style={{ color: 'var(--bone)', fontSize: '0.95rem' }}>Daniel R.</strong>
          <span style={{ color: '#f5b301', letterSpacing: '2px' }}>★★★★★</span>
        </div>
        <p style={{ color: 'var(--bone-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>Marcus gave me the best cut I've had in years. Easy to book, on time, great vibe. I'll be back!</p>
      </div>
      {arrow}
      <div style={{ ...card, borderLeft: '3px solid var(--brass)' }}>
        <p style={label}>Reply from the owner · posted by AI</p>
        <p style={{ color: 'var(--bone-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>Thanks, Daniel! Marcus will be glad to hear it. See you at your next cut!</p>
      </div>
    </div>
  );
}

// Owner report showcase: an anonymized copy of the daily feedback email owners get.
// Data mirrors the illustrative sample report (not real customers).
const STARS = (n: number, on = '#D97706') => (
  <span style={{ letterSpacing: '1px' }}>
    <span style={{ color: on }}>{'★'.repeat(n)}</span>
    <span style={{ color: '#CBD5E1' }}>{'★'.repeat(5 - n)}</span>
  </span>
);
const OR_TILES = [
  { v: '29', l: 'Surveys sent', c: '#0F172A' },
  { v: '28%', l: 'Reply rate', c: '#0F172A' },
  { v: '4.2', l: 'Avg rating ★', c: '#D97706' },
  { v: '2', l: 'Low ratings', c: '#DC2626' }
];
const OR_ATTENTION = [
  { stars: 2, meta: 'Location 1 · Stylist G · replied 4:30 PM', quote: 'Waited 25 minutes past my appointment time.' },
  { stars: 3, meta: 'Location 2 · Stylist D · replied 4:30 PM', quote: 'Cut came out uneven on the left side.' }
];
const OR_STYLISTS = [
  { name: 'Stylist A', loc: 'Location 2', rating: 4.8, replies: '6/23', low: 0 },
  { name: 'Stylist B', loc: 'Location 2', rating: 4.8, replies: '10/28', low: 0 },
  { name: 'Stylist D', loc: 'Location 2', rating: 4.6, replies: '7/16', low: 1 },
  { name: 'Stylist E', loc: 'Location 1', rating: 4.5, replies: '19/43', low: 1 },
  { name: 'Stylist G', loc: 'Location 1', rating: 4.4, replies: '17/52', low: 2 }
];
const OR_WEEK = [
  { d: 'Fri', r: 9, s: 19 }, { d: 'Sat', r: 7, s: 22 }, { d: 'Sun', r: 8, s: 17 }, { d: 'Mon', r: 6, s: 21 },
  { d: 'Tue', r: 9, s: 24 }, { d: 'Wed', r: 6, s: 19 }, { d: 'Thu', r: 4, s: 16 }
];

function OwnerReportMock() {
  const maxSent = Math.max(...OR_WEEK.map((w) => w.s));
  return (
    <figure className="or-mail" aria-label="Sample daily feedback report email" style={{ margin: 0 }}>
      <div className="or-mail-inner">
        <div className="or-head">
          <div>
            <div className="or-kicker">DAILY CUSTOMER FEEDBACK</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>Your Salon</div>
            <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '2px' }}>Thursday, November 5</div>
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'right' }}>
            Powered by
            <img src="/brand/logo-dark.png" alt="Curivanta" width={92} height={28} style={{ display: 'block', marginTop: '4px', height: '28px', width: 'auto' }} />
          </div>
        </div>
        <div className="or-body">
          <div className="or-alert">
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#B91C1C' }}>2 customers need a follow-up</div>
            <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '2px' }}>A quick call today often turns a low rating around.</div>
          </div>
          <div style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#64748B', fontWeight: 600, margin: '0 2px 6px' }}>YESTERDAY · BOTH LOCATIONS</div>
          <div className="or-tiles">
            {OR_TILES.map((t) => (
              <div key={t.l} className="or-tile"><b style={{ color: t.c }}>{t.v}</b><span>{t.l}</span></div>
            ))}
          </div>

          <div className="or-h">Needs attention</div>
          {OR_ATTENTION.map((a) => (
            <div key={a.meta} className="or-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>{a.meta}</span>
                <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{STARS(a.stars, '#DC2626')}</span>
              </div>
              <div style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '6px' }}>“{a.quote}”</div>
            </div>
          ))}

          <div className="or-h">Ratings by stylist</div>
          <table className="or-table">
            <thead><tr><th>STYLIST</th><th>RATING</th><th>REPLIES</th><th>LOW</th></tr></thead>
            <tbody>
              {OR_STYLISTS.map((s) => (
                <tr key={s.name}>
                  <td><b style={{ color: '#0F172A' }}>{s.name}</b><br /><span style={{ fontSize: '11px', color: '#64748B' }}>{s.loc}</span></td>
                  <td><span style={{ fontSize: '12px' }}>{STARS(Math.round(s.rating))}</span><br /><span style={{ fontSize: '11px', color: '#64748B' }}>{s.rating.toFixed(1)}</span></td>
                  <td>{s.replies}</td>
                  <td style={{ color: s.low ? '#DC2626' : '#64748B', fontWeight: s.low ? 700 : 400 }}>{s.low}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="or-h" style={{ marginBottom: '2px' }}>Location 1 · last 7 days</div>
          <div style={{ fontSize: '11px', color: '#64748B', margin: '0 2px' }}>Replies out of texts sent</div>
          <div className="or-bars" aria-hidden="true">
            {OR_WEEK.map((w, i) => (
              <div key={w.d} className="or-bar">
                <i style={{ height: `${((w.s - w.r) / maxSent) * 62}px`, background: '#E2E8F0', borderRadius: '3px 3px 0 0' }} />
                <i style={{ height: `${(w.r / maxSent) * 62}px`, background: i === OR_WEEK.length - 1 ? '#4D6BF6' : '#64748B' }} />
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>{w.d}</span>
                <span style={{ fontSize: '10px', fontWeight: 600 }}>{Math.round((w.r / w.s) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

const OR_POINTS = [
  { icon: Sun, title: 'Yesterday, in one glance', text: 'How many clients were asked, how many replied and the average rating, compared with the day before.' },
  { icon: PhoneCall, title: 'Who needs a call back today', text: "Every low rating shows the stylist, the location and the client's own words, so you can make it right while the visit is still fresh." },
  { icon: Users, title: 'How each stylist is really doing', text: 'Ratings, replies and low scores for every stylist, so you know who to praise and who needs coaching, without standing behind the chair.' },
  { icon: Building2, title: 'Every location side by side', text: 'One email covers all your salons, with a 7-day trend for each. Spot a slipping location before it shows up on Google.' }
];

const ReviewAutomation = () => {
  useEffect(() => { document.title = 'Review Automation for Salons & Barbershops | Curivanta'; }, []);

  const [selectedPlan, setSelectedPlan] = useState('notsure');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);

  const [builder, setBuilder] = useState<{ open: boolean; plan: ReviewsPlanId }>({ open: false, plan: 'growth' });
  const openBuilder = (plan: ReviewsPlanId) => setBuilder({ open: true, plan });
  const talkToUs = () => {
    setSelectedPlan('notsure');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
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
          form: 'reviews',
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
      track('reviews_form_submitted', { plan: selectedPlan });
    } catch (err) {
      track('reviews_form_error');
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
    return () => io.disconnect();
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
            <Link className="navlink" to="/website-development">Websites</Link>
            <Link className="navlink" to="/hair-salon-bot">Hair Salon Bot</Link>
            <a className="navlink" href="#pricing">Pricing</a>
            <ThemeToggle />

            <div className="mobile-menu-trigger">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 -mr-2 flex items-center justify-center text-foreground" aria-label="Menu">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col gap-6 pt-16 bg-background border-border">
                  <SheetClose asChild><Link className="text-xl font-medium" to="/website-development">Websites</Link></SheetClose>
                  <SheetClose asChild><Link className="text-xl font-medium" to="/hair-salon-bot">Hair Salon Bot</Link></SheetClose>
                  <SheetClose asChild><a className="text-xl font-medium" href="#pricing">Pricing</a></SheetClose>
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
              Review Automation for Salons & Barbershops
            </p>
            <h1 className="reveal is-visible" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Happy clients.<br />Now on <em>Google</em>.</h1>
            <p className="sub reveal is-visible" style={{ maxWidth: '600px' }}>Every client gets a friendly text and email asking for a Google review after their visit, with gentle follow-ups. Every review gets a thoughtful reply from AI. Your salon climbs in local search and new clients pick you over the shop down the street.</p>
            <div className="cta-row reveal is-visible">
              <a className="btn solid" href="#pricing" data-umami-event="reviews_cta" data-umami-event-where="hero_start">Try It Free for a Month</a>
              <a className="btn ghost" href="#contact" data-umami-event="reviews_cta" data-umami-event-where="hero_talk">Talk to Us First</a>
            </div>
            <ul className="hero-highlights reveal is-visible">
              <li>First month free. No contracts, month to month</li>
              <li>Done-for-you setup, 100% remote. Live in days</li>
              <li>Works with the software you already use</li>
              <li>A morning report on every stylist, so you know how the day went from anywhere</li>
            </ul>
          </div>

          <div className="hero-visual reveal is-visible d2" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'var(--brass)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
            <ReviewMock />
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0', background: 'var(--ink-soft)' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', textAlign: 'center' }}>
          <div className="reveal d1">
            <h3 style={{ fontSize: '1.6rem', color: 'var(--bone)', marginBottom: '8px' }}>Plenty of happy clients</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '260px' }}>but only a handful of reviews, so new clients can't tell you're the good one.</p>
          </div>
          <div className="reveal d2">
            <h3 style={{ fontSize: '1.6rem', color: 'var(--bone)', marginBottom: '8px' }}>No time to ask</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '260px' }}>Your front desk is busy checking clients in, not chasing reviews.</p>
          </div>
          <div className="reveal d3">
            <h3 style={{ fontSize: '1.6rem', color: 'var(--bone)', marginBottom: '8px' }}>Losing on Google</h3>
            <p style={{ color: 'var(--bone-dim)', margin: '0 auto', maxWidth: '260px' }}>The salon with more recent reviews shows up first and gets the call.</p>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="why-reviews" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '900px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 24px' }}>
            <p className="eyebrow">Why it matters</p>
            <h2>More reviews. More clients in your chair.</h2>
          </div>
          <p className="reveal d1" style={{ color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '720px', margin: '0 auto 56px', textAlign: 'center' }}>When someone searches "haircut near me" or "barber near me", Google shows a handful of shops on the map. The ones with more recent, well-answered reviews get the tap, the call and the booking. Reviews are one of the biggest growth levers a salon or barbershop has, and most leave it to chance. We make sure every happy client gets asked, so you never have to think about it.</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {VALUE.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className={`reveal d${(i % 3) + 1}`} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: '20px', alignItems: 'start', padding: '28px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                <span style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(77,107,246,0.12)', color: 'var(--brass-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={26} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{title}</h3>
                  <p style={{ color: 'var(--bone-dim)', lineHeight: 1.7 }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal d2" style={{ marginTop: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {FLOW.map((step, i) => (
              <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '10px 16px', borderRadius: '999px', border: `1px solid ${i === FLOW.length - 1 ? 'var(--brass)' : 'var(--line)'}`, background: i === FLOW.length - 1 ? 'rgba(77,107,246,0.12)' : 'var(--ink-soft)', color: 'var(--bone)', fontSize: '0.95rem', fontWeight: i === FLOW.length - 1 ? 700 : 500 }}>{step}</span>
                {i < FLOW.length - 1 && <span style={{ color: 'var(--brass-light)' }}>→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>


      <section className="approach" id="how-it-works">
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">How It Works</p>
            <h2>Set up once. Reviews keep coming after that.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>No new software to learn, no extra work for your front desk. It runs on top of what you already use.</p>
          </div>
          <div className="steps">
            <div className="step reveal">
              <span className="step-num">Step 01</span>
              <div>
                <h3>We connect your client list</h3>
                <p>We link the booking software you already use, or set up a simple daily export, so we know who visited each day.</p>
              </div>
            </div>
            <div className="step reveal d1">
              <span className="step-num">Step 02</span>
              <div>
                <h3>We write your messages</h3>
                <p>Review requests in your salon's voice, with your Google review link. You approve the wording before anything goes out.</p>
              </div>
            </div>
            <div className="step reveal d2">
              <span className="step-num">Step 03</span>
              <div>
                <h3>Every new visit gets asked</h3>
                <p>After each appointment, the client gets a text and email with a one-tap link to Google, plus up to two gentle reminders.</p>
              </div>
            </div>
            <div className="step reveal d3">
              <span className="step-num">Step 04</span>
              <div>
                <h3>Every review gets a reply</h3>
                <p>The AI writes a warm, personal reply to each review. Anything negative comes to you first, so you decide how to respond.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="first-week" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '1000px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">Your first week</p>
            <h2>From sign-up to new reviews in days.</h2>
          </div>
          <div className="service-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <div className="service-card reveal d1">
              <p className="step-num" style={{ marginBottom: '12px' }}>Day 1</p>
              <h3>Sign up and connect</h3>
              <p>A short setup call. We connect your client list and write your messages with you.</p>
            </div>
            <div className="service-card reveal d2">
              <p className="step-num" style={{ marginBottom: '12px' }}>Day 3</p>
              <h3>First requests go out</h3>
              <p>Clients from that day's visits get asked. Reviews start landing and the AI replies to each one.</p>
            </div>
            <div className="service-card reveal d3">
              <p className="step-num" style={{ marginBottom: '12px' }}>Day 7</p>
              <h3>It runs on its own</h3>
              <p>Every new visit gets asked automatically. You just watch the stars add up.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="features" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '1000px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">What's included</p>
            <h2>Everything it takes to get reviewed, done for you.</h2>
          </div>
          <div className="service-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="service-card reveal d1">
              <h3>Personal review requests</h3>
              <p>Texts and emails that use the client's name, the stylist they saw, and your salon's voice. Not a generic survey.</p>
            </div>
            <div className="service-card reveal d2">
              <h3>Smart follow-ups</h3>
              <p>Up to two gentle reminders, and they stop the moment the client leaves a review.</p>
            </div>
            <div className="service-card reveal d3">
              <h3>One tap to Google</h3>
              <p>Requests open straight to your Google review form. No searching, no app to download.</p>
            </div>
            <div className="service-card reveal d1">
              <h3>AI review replies</h3>
              <p>Every review gets a thoughtful reply, which Google and new clients both notice. Negative reviews come to you first.</p>
            </div>
            <div className="service-card reveal d2">
              <h3>Instant alerts</h3>
              <p>Know right away when a new review comes in, so a problem never sits unanswered.</p>
            </div>
            <div className="service-card reveal d3">
              <h3>Reviews on your website</h3>
              <p>A live widget shows your latest Google reviews on your own site, always up to date.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="owner-report" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '1100px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 56px', maxWidth: '760px' }}>
            <p className="eyebrow">For owners who can't be there every day</p>
            <h2>Know how every stylist did yesterday, before your first coffee.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>Run your salon from another location, another job or another city? Every morning you get one email that shows how yesterday went: who was asked, how they rated their visit, which clients need a call back, and how each stylist is trending.</p>
          </div>

          <div className="or-grid">
            <div className="reveal d1">
              <OwnerReportMock />
              <p style={{ fontSize: '0.8rem', color: 'var(--bone-dimmer)', textAlign: 'center', marginTop: '14px' }}>Sample report. Names and numbers are illustrative.</p>
            </div>
            <ul className="or-points reveal d2">
              {OR_POINTS.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="or-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </li>
              ))}
            </ul>
          </div>

          <div className="or-result reveal">
            <div>
              <p className="eyebrow" style={{ marginBottom: '10px' }}>From one of my own salons</p>
              <div className="or-rating" aria-label="Google rating went from 4.3 to 4.5 stars">
                <span className="from">4.3<span className="star">★</span></span>
                <span style={{ color: 'var(--brass-light)', fontSize: '2rem' }}>→</span>
                <span className="to">4.5<span className="star">★</span></span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Google rating up in one month.</h3>
              <p style={{ color: 'var(--bone-dim)', lineHeight: 1.7, margin: 0 }}>Asking every client brought in a steady stream of new reviews, and the morning report showed me exactly which visits needed a follow-up call. Same system, same report you get.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>


      <section id="pricing" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">Pricing</p>
            <h2>Your first month is free.</h2>
            <p className="sub" style={{ color: 'var(--bone-dim)', marginTop: '16px' }}>Try it for a full month at no charge, then pick up month to month. Priced by how many clients you see. Follow-up reminders never count toward your limit.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Starter</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>$79</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--brass)', marginBottom: '24px' }}>Up to 100 review requests a month</p>
              <ul style={listStyle}>
                <li style={liStyle}>{CHECK} Automatic text and email requests after every visit</li>
                <li style={liStyle}>{CHECK} Up to two gentle reminders</li>
                <li style={liStyle}>{CHECK} AI replies to every Google review</li>
                <li style={liStyle}>{CHECK} New review alerts</li>
                <li style={liStyle}>{CHECK} Daily feedback report on every stylist</li>
              </ul>
              <button type="button" className="btn ghost" onClick={() => openBuilder('starter')} style={{ width: '100%', justifyContent: 'center' }}>Try Starter Free</button>
            </div>

            <div className="service-card reveal d2" style={{ display: 'flex', flexDirection: 'column', borderColor: 'var(--brass)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--brass)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--bone-dim)' }}>Growth: Most Popular</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 'bold' }}>$129</span>
                <span style={{ color: 'var(--bone-dim)' }}>/mo</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--brass)', marginBottom: '24px' }}>Up to 200 review requests a month</p>
              <ul style={listStyle}>
                <li style={liStyle}>{CHECK} Everything in Starter</li>
                <li style={liStyle}>{CHECK} Requests mention the stylist the client saw</li>
                <li style={liStyle}>{CHECK} Google reviews widget for your website</li>
                <li style={liStyle}>{CHECK} Monthly review report</li>
                <li style={liStyle}>{CHECK} Priority support</li>
              </ul>
              <button type="button" className="btn solid" onClick={() => openBuilder('growth')} style={{ width: '100%', justifyContent: 'center' }}>Try Growth Free</button>
            </div>
          </div>

          <div className="reveal d3" style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px', textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: 'var(--bone-dim)' }}>💡 If better reviews bring in just <strong>3 new clients a month</strong>, at a $30 haircut that's <strong style={{ color: 'var(--brass)' }}>$90</strong> in their first visit alone, more than Starter costs. And happy clients keep coming back.</p>
          </div>
          <p className="reveal d3" style={{ textAlign: 'center', marginTop: '20px', color: 'var(--bone-dimmer)', fontSize: '0.9rem' }}>Sign up online in minutes. Your free month starts when you go live; cancel before it ends and you pay nothing more. A one-time $35 covers text message carrier registration. Multiple locations? <a href="#contact" onClick={() => setSelectedPlan('notsure')} style={{ color: 'var(--brass-light)' }}>Talk to us</a> about bundle pricing.</p>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="story" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div className="reveal">
            <p className="eyebrow" style={{ marginBottom: '16px' }}>Built by an Owner</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>Made by a salon owner, not a software vendor.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--bone-dim)', fontSize: '1.1rem', lineHeight: 1.8 }}>
              <p>I own and operate two franchise hair salon locations. I know how many happy clients walk out the door every Saturday, and how few of them ever think to leave a review.</p>
              <p>Curivanta asks them for you, the same way every time, and makes sure every review gets a reply. It's the same system behind our Hair Salon Bot, built and tested in real salons first, and it works the same for any salon or barbershop.</p>
            </div>
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
          <h2 className="reveal">Ready for more five-star reviews?</h2>
          <p className="sub reveal d1" style={{ color: 'var(--bone-dim)', marginBottom: '40px' }}>Leave your details and we'll reach out within one business day to get you set up.</p>

          {status === 'sent' ? (
            <div className="reveal d2 is-visible form-success" role="status" style={{ background: 'var(--ink)', padding: '40px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h3>Thanks, we've got it.</h3>
              <p>We'll reach out within one business day to get your review automation set up.</p>
            </div>
          ) : (
          <form
            className="reveal d2"
            onSubmit={handleSubmit}
            onFocus={() => { if (!started) { setStarted(true); track('reviews_form_started'); } }}
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

      <ReviewsCheckout
        open={builder.open}
        onOpenChange={(open) => setBuilder((b) => ({ ...b, open }))}
        initialPlan={builder.plan}
      />

      <SiteFooter />
    </div>
  );
};

export default ReviewAutomation;
