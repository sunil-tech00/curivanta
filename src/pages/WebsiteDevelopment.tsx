import { useEffect, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { SiteFooter } from '../components/SiteFooter';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, HeartHandshake, Scissors, Wrench, Compass, MapPin, CalendarCheck, Bot, Star, ClipboardList } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Every price, term and timeline on this page comes from here. Change a value once and it updates
// the copy, the FAQ, and the structured data. (The static link-preview text for this route lives
// in scripts/page-meta.mjs.)
const SITE = {
  BUILD_PRICE: '$1,500',
  CARE_PRICE: '$199',
  PAGES: 'up to 8',
  CONCEPT_DAYS: '5 business days',
  LAUNCH_WEEKS: '2–3 weeks',
  CONCEPTS_PER_MONTH: '3',
  CONTACT_EMAIL: 'hello@curivanta.com'
};

const TITLE = 'Website Design for Local Practices & Service Businesses | Curivanta';
const PAGE_URL = 'https://curivanta.com/website-development';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ERROR_MSG = `Something went wrong. Please email ${SITE.CONTACT_EMAIL} instead.`;

const faqs = [
  { q: "Do I own my website?", a: "Yes. Your domain is registered in your name and you can get a copy of your site files anytime, free." },
  { q: "What if I'm on Wix, Squarespace, or a template platform today?", a: "That's most of our clients. We rebuild your site, move your domain, and redirect your old pages so you keep any search ranking you've already earned." },
  { q: "Can you work with my booking system?", a: "Usually, yes. We connect common scheduling and practice-management tools. If yours can't be connected directly, we'll link to it cleanly from every page." },
  { q: "Do you guarantee Google rankings?", a: "No, and be wary of anyone who does. We set up everything that helps you get found: Google Business Profile, listings, page structure, and speed. Results depend on your market and competition." },
  { q: "What does the care plan cover?", a: "Hosting, security, domain renewal, Google Business Profile upkeep, small monthly updates, quarterly review refreshes, and a monthly report." },
  { q: "How long does it take?", a: `You'll see a free homepage concept within ${SITE.CONCEPT_DAYS}. Most sites launch ${SITE.LAUNCH_WEEKS} after you approve the design.` },
  { q: "What do I need to provide?", a: "Your logo, a few photos (or we'll help you get them), your services, and about an hour of your time across the project." },
  { q: "Is the AI front desk required?", a: "No. Automation add-ons are optional and priced separately." },
  { q: "Is the free concept really free?", a: `Yes, with no obligation. We take on ${SITE.CONCEPTS_PER_MONTH} new concepts per month so each one gets real attention.` }
];

const AUDIENCES = [
  { icon: HeartHandshake, title: 'Therapy & wellness practices', text: 'Group and solo practices that need clients to find the right therapist and book a consultation.' },
  { icon: Scissors, title: 'Salons & personal services', text: 'Businesses that live on bookings, reviews, and repeat visits.' },
  { icon: Wrench, title: 'Home & local services', text: 'Contractors and service pros whose customers search "near me" and call right away.' }
];

const PILLARS = [
  { icon: Compass, title: 'Strategy first', text: "Before designing anything, we figure out how your clients search and what makes you the obvious choice. Sometimes that's a niche your competitors ignore." },
  { icon: MapPin, title: 'Built to be found', text: 'Google Business Profile set up for every location, consistent listings, search-friendly page structure, and fast mobile pages.' },
  { icon: CalendarCheck, title: 'Built to book', text: "Online booking connected, click-to-call on every page, and optional automation that follows up so leads don't go cold." }
];

const INCLUDED = [
  'Domain registered in your name',
  `${cap(SITE.PAGES)} pages: Home, Services, About/Team, Locations, FAQ, Contact, and more`,
  'Original copy written for your business, not a template',
  'Google Business Profile setup or cleanup for each location',
  'Your best Google reviews displayed on the site',
  'Online booking connected to the system you already use',
  'Click-to-call buttons and a contact form',
  'Search basics: page titles, descriptions, and structured data',
  'Mobile-first, fast-loading design',
  'Analytics so you can see calls and form requests',
  'One full round of revisions',
  'A copy of your site files, free, anytime'
];

// Cost comparison: one row per question, one value per option (last option is Curivanta).
const CMP_OPTIONS = ['Do it yourself', 'Template platforms', 'Agency', 'Curivanta'];
const CMP_ROWS: { label: string; values: string[] }[] = [
  { label: 'Upfront', values: ['$0', '~$199 setup', '$6,000–$11,000+', `From ${SITE.BUILD_PRICE}`] },
  { label: 'Monthly', values: ['~$17–$46', '~$69–$336', 'Often $500+', SITE.CARE_PRICE] },
  { label: 'Who writes the copy', values: ['You', 'Mostly template text', 'Agency', 'Written for you'] },
  { label: 'Google Business Profile setup', values: ['You', 'Often extra', 'Sometimes', 'Included'] },
  { label: 'Do you own it?', values: ['Yes', 'Usually not', 'Varies', 'Yes'] },
  { label: 'If you stop paying', values: ['Site goes down', 'Site goes down', 'Varies', 'Site stays up, files are yours'] }
];

const CARE_PLAN = [
  'Hosting, security certificate, and domain renewal',
  'Google Business Profile upkeep for each location',
  'Small monthly updates (text, photos, hours, team changes)',
  'Quarterly refresh of your featured reviews',
  "A short monthly report: calls, form requests, and how you're showing up on Google"
];

const STEPS = [
  { title: 'Free homepage concept', text: `Tell us about your business. Within ${SITE.CONCEPT_DAYS}, you'll see a redesigned homepage built with your real content.` },
  { title: 'Strategy call (30 minutes)', text: 'We walk through the concept, confirm your services, locations, and booking system, and agree on scope.' },
  { title: 'Build & revise', text: 'We build the full site and you get one complete round of revisions.' },
  { title: 'Launch', text: `Your site goes live, Google Business Profile connected, analytics on. Typically ${SITE.LAUNCH_WEEKS} after you approve the design.` },
  { title: 'Care plan begins', text: 'Ongoing updates, listing upkeep, and a monthly report.' }
];

const BUSINESS_TYPES = ['Therapy or wellness practice', 'Salon or personal service', 'Home or local service', 'Other'];

const SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Website Development',
    url: PAGE_URL,
    serviceType: 'Website design and development',
    provider: { '@type': 'Organization', name: 'Curivanta', url: 'https://curivanta.com' },
    areaServed: 'United States',
    offers: {
      '@type': 'Offer',
      price: SITE.BUILD_PRICE.replace(/[^\d.]/g, ''),
      priceCurrency: 'USD',
      description: 'Starting price for a website build'
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  }
];

const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const PriceLine = ({ care = `${SITE.CARE_PRICE}/month care plan` }: { care?: string }) => (
  <p className="ws-price-line">From {SITE.BUILD_PRICE} to build · {care} · You own everything.</p>
);

const ConceptCta = ({ where, className = 'btn solid' }: { where: string; className?: string }) => (
  <a className={className} href="#concept" data-umami-event="websites_cta" data-umami-event-where={where}>Get a free homepage concept</a>
);

// Hero visual: an abstract homepage wireframe (no real business) showing one path to booking.
function SiteSketch() {
  return (
    <div className="ws-browser" aria-hidden="true">
      <div className="browser-bar">
        <div className="tl"><span></span><span></span><span></span></div>
        <div className="browser-url">yourbusiness.com</div>
      </div>
      <div className="ws-browser-body">
        <div className="ws-bar head" style={{ width: '82%' }}></div>
        <div className="ws-bar head" style={{ width: '58%' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="ws-stars">★★★★★</span>
          <div className="ws-bar" style={{ width: '40%' }}></div>
        </div>
        <div className="ws-pills">
          <span className="ws-pill solid">Book now</span>
          <span className="ws-pill">Call</span>
        </div>
        <div className="ws-mini-cards">
          {[0, 1, 2].map((i) => (
            <div className="ws-mini-card" key={i}>
              <div className="ws-bar" style={{ width: '70%', background: 'var(--brass)', opacity: 0.5 }}></div>
              <div className="ws-bar"></div>
              <div className="ws-bar" style={{ width: '80%' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Draggable before/after comparison. Pointer drag works for mouse and touch (vertical swipes still
// scroll the page); the range input underneath handles keyboard and screen readers.
function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const moveTo = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
  };
  return (
    <div
      className="ba"
      style={{ '--pos': `${pos}%` } as React.CSSProperties}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); moveTo(e); }}
      onPointerMove={(e) => { if (dragging) moveTo(e); }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <img src="/websites/before-sample.webp" width={1200} height={750} loading="lazy"
        alt="Before: a dated small business homepage with a crowded menu, long blocks of text, and no clear way to book" />
      <img className="ba-after" src="/websites/after-sample.webp" width={1200} height={750} loading="lazy"
        alt="After: a redesigned homepage with a clear headline, the business's Google reviews, and one Book now button" />
      <span className="ba-label before">Before</span>
      <span className="ba-label after">After</span>
      <input
        type="range" min={0} max={100} step={1} value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        className="sr-only"
        aria-label="Compare before and after. Move left to show more of the redesign, right to show more of the original."
        aria-valuetext={`${Math.round(100 - pos)}% after, ${Math.round(pos)}% before`}
      />
      <span className="ba-handle"></span>
    </div>
  );
}

const WebsiteDevelopment = () => {
  useEffect(() => { document.title = TITLE; }, []);

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);

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
          form: 'websites',
          firstName: data.get('firstName'),
          lastName: data.get('lastName'),
          business: data.get('business'),
          siteUrl: data.get('siteUrl'),
          city: data.get('city'),
          email: data.get('email'),
          phone: data.get('phone'),
          businessType: data.get('businessType'),
          message: data.get('message'),
          website: data.get('website')
        })
      });
      const json = await res.json().catch(() => ({}));
      // Validation and rate-limit messages (4xx) are written for the visitor; anything else gets the fallback.
      if (!res.ok) throw new Error(res.status < 500 && json.error ? json.error : ERROR_MSG);
      setStatus('sent');
      track('websites_form_submitted', { type: String(data.get('businessType') || 'none') });
    } catch (err) {
      track('websites_form_error');
      setError(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : ERROR_MSG);
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
    <div className="curivanta-theme ws-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

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
                  <SheetClose asChild><a className="text-xl font-medium" href="#pricing">Pricing</a></SheetClose>
                  <SheetClose asChild><a className="text-xl font-medium" href="#concept">Free homepage concept</a></SheetClose>
                  <SheetClose asChild><Link className="text-xl font-medium" to="/hair-salon-bot">Hair Salon Bot</Link></SheetClose>
                  <SheetClose asChild><Link className="text-xl font-medium" to="/reviewautomation">Review Automation</Link></SheetClose>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>

      <main>
      <section className="hero" id="top" style={{ paddingTop: '140px', overflow: 'hidden' }}>
        <div className="hero-inner hero-grid">
          <div className="hero-content">
            <p className="eyebrow badge reveal is-visible">
              <svg className="spark" viewBox="0 0 16 16" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1l1.2 4.3L13.5 6.5l-4.3 1.2L8 12l-1.2-4.3L2.5 6.5l4.3-1.2L8 1z" fill="currentColor"/>
              </svg>
              Websites for local businesses
            </p>
            <h1 className="reveal is-visible" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Websites that get you <em>found and booked</em>, not just seen.</h1>
            <p className="sub reveal is-visible" style={{ maxWidth: '600px' }}>For local practices and service businesses. Built around how your clients actually search, with booking and follow-up handled for you.</p>
            <div className="reveal is-visible"><PriceLine /></div>
            <div className="cta-row reveal is-visible">
              <ConceptCta where="hero" />
              <a className="btn ghost" href="#before-after" data-umami-event="websites_cta" data-umami-event-where="hero_before_after">See before &amp; after</a>
            </div>
            <p className="ws-trust reveal is-visible">Free concept first. No long-term contract. Your domain, your files.</p>
          </div>
          <div className="hero-visual reveal is-visible d2" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '110%', height: '110%', background: 'var(--brass)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }}></div>
            <SiteSketch />
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="before-after" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: '760px' }}>
            <p className="eyebrow">Before &amp; after</p>
            <h2>See the difference before you spend a dollar.</h2>
            <p className="ws-lead" style={{ marginTop: '16px' }}>Most small business websites were built years ago and haven't kept up. Here's what a redesign looks like.</p>
          </div>
          <div className="reveal d1"><BeforeAfter /></div>
          <p className="ws-small" style={{ textAlign: 'center', marginTop: '12px' }}>Sample business shown for illustration.</p>
          <div className="ws-callouts">
            <div className="reveal d1">
              <h3>Clear in 3 seconds</h3>
              <p>Visitors know what you do, where you are, and who you help.</p>
            </div>
            <div className="reveal d2">
              <h3>One path to booking</h3>
              <p>One clear button instead of a cluttered menu.</p>
            </div>
            <div className="reveal d3">
              <h3>Built for phones</h3>
              <p>Most local searches happen on a phone, so we design for it first.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="who" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">Who it's for</p>
            <h2>Built for businesses people find on Google Maps.</h2>
          </div>
          <div className="service-grid three">
            {AUDIENCES.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className={`service-card reveal d${i + 1}`}>
                <span className="ws-icon"><Icon strokeWidth={1.8} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="different" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">What makes it different</p>
            <h2>Not just a nicer website. A site that works.</h2>
          </div>
          <div className="service-grid three">
            {PILLARS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className={`reveal d${i + 1}`}>
                <span className="ws-icon"><Icon size={26} strokeWidth={1.8} /></span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>{title}</h3>
                <p style={{ color: 'var(--bone-dim)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="included" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '960px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">What's included</p>
            <h2>Everything you need, in one price.</h2>
            <p className="ws-lead" style={{ marginTop: '16px' }}>From {SITE.BUILD_PRICE}. A complete site, built and set up for you.</p>
          </div>
          <ul className="ws-checklist reveal d1">
            {INCLUDED.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="ws-small reveal d2" style={{ textAlign: 'center', marginTop: '36px' }}>Custom features, extra pages, and online stores are quoted separately.</p>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="cost" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">Cost comparison</p>
            <h2>What a business website usually costs.</h2>
          </div>
          <div className="reveal d1">
            <table className="cmp-table">
              <caption className="sr-only">Cost and ownership compared across do it yourself, template platforms, agencies, and Curivanta</caption>
              <thead>
                <tr>
                  <td></td>
                  {CMP_OPTIONS.map((o, i) => <th key={o} scope="col" className={i === CMP_OPTIONS.length - 1 ? 'cv' : undefined}>{o}</th>)}
                </tr>
              </thead>
              <tbody>
                {CMP_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((v, i) => <td key={i} className={i === row.values.length - 1 ? 'cv' : undefined}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cmp-cards">
              {CMP_OPTIONS.map((o, i) => (
                <div key={o} className={`cmp-card${i === CMP_OPTIONS.length - 1 ? ' cv' : ''}`}>
                  <h3>{o}</h3>
                  <dl>
                    {CMP_ROWS.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.values[i]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
          <p className="ws-small reveal d2" style={{ textAlign: 'center', marginTop: '24px', maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto' }}>Prices are typical ranges as of October 2026. Do-it-yourself reflects common website builder plans. Template platforms reflect industry-specific site providers. Your situation may differ.</p>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="pricing" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '1000px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
            <p className="eyebrow">Pricing</p>
            <h2>Simple pricing. No surprises.</h2>
          </div>
          <div className="service-grid">
            <div className="service-card reveal d1">
              <h3>Website build</h3>
              <div className="ws-price"><strong>from {SITE.BUILD_PRICE}</strong><span>one time</span></div>
              <p>Strategy, design, copy, setup, and launch.</p>
            </div>
            <div className="service-card reveal d2" style={{ borderColor: 'var(--brass)' }}>
              <h3>Care plan</h3>
              <div className="ws-price"><strong>{SITE.CARE_PRICE}</strong><span>/month</span></div>
              <p style={{ marginBottom: '14px' }}>Includes:</p>
              <ul className="ws-checklist" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                {CARE_PLAN.map((item) => <li key={item} style={{ fontSize: '0.95rem' }}>{item}</li>)}
              </ul>
            </div>
          </div>
          <ul className="ws-terms ws-small reveal d3">
            <li>Larger changes are quoted before any work starts.</li>
            <li>Unused monthly updates don't roll over.</li>
          </ul>
          <div className="reveal d3" style={{ textAlign: 'center', marginTop: '32px' }}>
            <ConceptCta where="pricing" />
          </div>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="add-ons" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 48px', maxWidth: '760px' }}>
            <p className="eyebrow">Add-ons: AI &amp; automation</p>
            <h2>Want it to work while you're busy? Add automation.</h2>
            <p className="ws-lead" style={{ marginTop: '16px' }}>Optional tools that answer, book, and follow up so fewer leads slip through.</p>
          </div>
          <div className="service-grid three">
            <div className="service-card reveal d1" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="ws-icon"><Bot strokeWidth={1.8} /></span>
              <h3>AI front desk</h3>
              <p>Answers calls and texts, answers common questions, and books appointments 24/7.</p>
              <Link className="svc-link" to="/hair-salon-bot" data-umami-event="websites_addon" data-umami-event-addon="front_desk">See how it works for salons →</Link>
            </div>
            <div className="service-card reveal d2">
              <span className="ws-icon"><Star strokeWidth={1.8} /></span>
              <h3>Automatic review requests</h3>
              <p>A friendly text after each visit asking happy clients to leave a Google review.</p>
            </div>
            <div className="service-card reveal d3">
              <span className="ws-icon"><ClipboardList strokeWidth={1.8} /></span>
              <h3>Intake &amp; reminders</h3>
              <p>Online intake forms and appointment reminders that cut no-shows.</p>
            </div>
          </div>
          <p className="ws-small reveal" style={{ textAlign: 'center', marginTop: '28px' }}>For healthcare and therapy practices, automation is set up only with HIPAA-compliant tools.</p>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="ownership" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div className="reveal">
            <p className="eyebrow" style={{ marginBottom: '16px' }}>Ownership guarantee</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.15, marginBottom: '28px' }}>Leave anytime. Your site keeps running.</h2>
          </div>
          <div className="reveal d1" style={{ padding: '32px 36px', background: 'var(--ink-soft)', border: '1px solid var(--line)', borderLeft: '3px solid var(--brass)', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--bone)', lineHeight: 1.75 }}>Your domain is registered in your name, and your site files are yours from day one. If you ever cancel the care plan, we hand everything over and your site stays online. No contract traps, no fees to get your files, no "hostage website."</p>
          </div>
          <p className="ws-small reveal d2" style={{ marginTop: '16px' }}>After cancelling, you'll pay your own domain and hosting renewals, and care plan services stop.</p>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="process" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 56px' }}>
            <p className="eyebrow">Process</p>
            <h2>How it works.</h2>
          </div>
          <ol className="ws-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`reveal d${(i % 3) + 1}`}>
                <span className="ws-step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="divider wrap" style={{ maxWidth: '1140px' }}></div>

      <section id="faq" style={{ padding: '100px 0' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
            <p className="eyebrow">FAQ</p>
            <h2>Common questions.</h2>
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

      <section className="final-cta" style={{ padding: '100px 0' }}>
        <div className="wrap">
          <h2 className="reveal">Ready to see your new homepage?</h2>
          <p className="sub reveal d1">Free concept, no obligation. You'll see exactly what you're getting before you pay anything.</p>
          <div className="reveal d1"><PriceLine care={`${SITE.CARE_PRICE}/month`} /></div>
          <div className="cta-row reveal d2" style={{ display: 'flex', flexWrap: 'wrap', gap: '18px' }}>
            <ConceptCta where="closing" />
            <a className="btn ghost" href="#pricing" data-umami-event="websites_cta" data-umami-event-where="closing_pricing">See pricing</a>
          </div>
        </div>
      </section>

      <section id="concept" style={{ padding: '100px 0', background: 'var(--ink-soft)' }}>
        <div className="wrap" style={{ maxWidth: '720px' }}>
          <div className="section-head reveal" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
            <p className="eyebrow">Free homepage concept</p>
            <h2>Request your free homepage concept.</h2>
            <p className="ws-lead" style={{ marginTop: '16px' }}>We take on {SITE.CONCEPTS_PER_MONTH} new concepts each month. You'll hear back within one business day.</p>
          </div>

          {status === 'sent' ? (
            <div className="form-success" role="status" style={{ background: 'var(--ink)', padding: '40px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <p style={{ color: 'var(--bone)', fontSize: '1.1rem' }}>Thanks! I'll review your business and be in touch within one business day.</p>
            </div>
          ) : (
          <form
            className="ws-form reveal d1"
            onSubmit={handleSubmit}
            onFocus={() => { if (!started) { setStarted(true); track('websites_form_started'); } }}
          >
            <label className="welcome-field">First name
              <input className="form-input" type="text" name="firstName" autoComplete="given-name" required />
            </label>
            <label className="welcome-field"><span>Last name <span className="opt">(optional)</span></span>
              <input className="form-input" type="text" name="lastName" autoComplete="family-name" />
            </label>
            <label className="welcome-field">Business name
              <input className="form-input" type="text" name="business" autoComplete="organization" required />
            </label>
            <label className="welcome-field">City
              <input className="form-input" type="text" name="city" autoComplete="address-level2" required />
            </label>
            <label className="welcome-field">Email
              <input className="form-input" type="email" name="email" autoComplete="email" required />
            </label>
            <label className="welcome-field">Phone
              <input className="form-input" type="tel" name="phone" autoComplete="tel" required />
            </label>
            <label className="welcome-field"><span>Current website URL <span className="opt">(optional)</span></span>
              <input
                className="form-input" type="url" name="siteUrl" autoComplete="url" placeholder="https://"
                // Visitors usually type "mysite.com"; add the scheme so the browser's URL check passes.
                onBlur={(e) => { const v = e.target.value.trim(); if (v && !/^https?:\/\//i.test(v)) e.target.value = `https://${v}`; }}
              />
            </label>
            <label className="welcome-field"><span>Business type <span className="opt">(optional)</span></span>
              <select className="form-input" name="businessType" defaultValue="">
                <option value="">Choose one</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="welcome-field full"><span>What's not working on your website today? <span className="opt">(optional)</span></span>
              <textarea className="form-input" name="message" rows={4} />
            </label>
            <input type="text" name="website" className="form-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <div className="full">
              {error && <p className="form-error" role="alert" style={{ marginBottom: '8px' }}>{error}</p>}
              <button type="submit" className="btn solid full-width" disabled={status === 'sending'} style={{ marginTop: 0 }}>
                {status === 'sending' ? 'Sending…' : 'Request my free concept'}
              </button>
              <p className="ws-small" style={{ marginTop: '14px', textAlign: 'center' }}>By submitting, you agree to be contacted about your request. See our <Link to="/privacy" style={{ color: 'var(--brass-light)', textDecoration: 'underline' }}>Privacy Policy</Link>.</p>
            </div>
          </form>
          )}
        </div>
      </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default WebsiteDevelopment;
