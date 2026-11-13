import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import './home/home.css';

// Preview of the new homepage (Curivanta for salons), served at /home-preview and kept out of
// search (noindex header in vercel.json). Becomes Index.tsx once approved.
// Analytics (see public/analytics.js). Clicks on elements with data-umami-event are tracked by Umami itself.
const track = (name: string, data?: Record<string, string | number | boolean>) =>
  (window as Window & { cvTrack?: (name: string, data?: Record<string, string | number | boolean>) => void }).cvTrack?.(name, data);

const START_URL = 'https://app.curivanta.com/start';
const START_STARTER_URL = 'https://app.curivanta.com/start?plan=starter';
const START_PRO_URL = 'https://app.curivanta.com/start?plan=pro';
const SIGNIN_URL = 'https://app.curivanta.com/login';

type Job = { title: string; lede: string; ticks: string[]; mini: JSX.Element };

const JOBS: Record<string, { tab: string; hint: string } & Job> = {
  textback: {
    tab: 'Missed-call text-back', hint: 'A text within a minute',
    title: 'Missed-call text-back',
    lede: 'The moment a call goes unanswered, the caller gets a friendly text from your salon. Most people would rather text than leave a voicemail anyway.',
    ticks: ['A text within about a minute, every missed call, day or night', 'Callers hear your greeting first: edit the words or record it in your own voice', 'Voicemails arrive as text, and every call is logged'],
    mini: (<><div className="h">The text a caller gets</div>
      <div className="h-bub us">Hi, this is Glow Studio. Sorry we missed your call! How can we help? You can reply here to book.<small>Sent 38 seconds after the call</small></div>
      <div className="h-bub them">Do you do balayage?<small>Client</small></div></>),
  },
  book: {
    tab: 'AI texting & booking', hint: 'Answers and books',
    title: 'AI texting & booking',
    lede: "Clients text the questions they'd otherwise call with. The AI answers from your own menu, prices and policies, and books real open times, day or night.",
    ticks: ['Learns your services, prices, hours and policies from your website', 'Only offers times that are actually free, and confirms before booking', 'On SalonUltimate, it books straight in, solo or salon. Otherwise it sends your own booking link', 'Complaints and anything unclear go to you, with the whole thread'],
    mini: (<><div className="h">Straight into your calendar</div>
      <div className="h-bub them">Can I get a trim and blowout this weekend?<small>Client</small></div>
      <div className="h-bub us">Yes! Saturday at 10:00 or 11:30 with Maya. Which works?<small>Live openings</small></div>
      <div className="h-bub them">10 please</div>
      <div className="h-bub us">Booked: Sat 10:00 AM, Trim &amp; Blowout with Maya.<small>In SalonUltimate</small></div></>),
  },
  voice: {
    tab: 'AI phone answering', hint: "Pro: answers when you can't",
    title: 'AI phone answering',
    lede: "On Pro, when nobody can pick up, your assistant answers the call. It talks like a friendly front desk, answers questions from your own menu and policies, and books real open times.",
    ticks: [
      'Answers questions about services, prices, hours and parking',
      'Checks real openings, books into SalonUltimate, and texts a confirmation',
      'Knows returning clients by name and offers their usual',
      'Callers can ask for a person or leave a voicemail any time',
      'You see every call it took, with what was said',
    ],
    mini: (<><div className="h">On the phone</div>
      <div className="h-bub us">Hi Dana, thanks for calling Glow Studio. This is the salon's automated assistant. How can I help?<small>Assistant</small></div>
      <div className="h-bub them">Can Maya do a trim Saturday morning?<small>Caller</small></div>
      <div className="h-bub us">Maya has ten or eleven thirty on Saturday. Which works?<small>Live openings</small></div>
      <div className="h-bub them">Ten, please.</div>
      <div className="h-bub us">You're booked for ten on Saturday with Maya. I'll text you the details.<small>In SalonUltimate</small></div></>),
  },
  reviews: {
    tab: 'Reviews', hint: 'Requests and review responses',
    title: 'Review requests & review responses',
    lede: "After a visit, clients get a text asking how it went, with your Google link. They can reply with a number from 1 to 5, or tap stars. Ratings are saved by stylist.",
    ticks: ['Every client gets the Google link, as Google requires', 'Low ratings and notes also come to you privately, so you can make it right', 'A daily limit, picked at random across the day, so it never feels spammy', 'Connect Google in one click, and AI drafts review responses for you to approve'],
    mini: (<><div className="h">After the visit</div>
      <div className="h-bub us">Hi Priya, thanks for coming in today! How was your balayage with Maya? Reply 1 to 5, or leave us a Google review here.<small>Review request</small></div>
      <div className="h-bub them">5!! Love it<small>Client</small></div>
      <div className="h" style={{ marginTop: 12 }}>AI drafts a response for you to approve</div>
      <div className="h-draft"><span className="h-stars">★★★★★</span> "Thank you, Priya! Maya loved doing your balayage. See you at your next visit."
        <div className="h-acts"><span className="a-ok">Approve and post</span><span className="a-ed">Edit first</span></div></div></>),
  },
  phone: {
    tab: 'Phone', hint: 'Calls ring your app first',
    title: 'Phone',
    lede: 'Salons keep their number and forward the calls they miss. Solo stylists get a separate business number, so your personal cell stays private.',
    ticks: ['Make and take calls in the app; clients see your business number, not your cell', 'Solo: calls ring your own cell during your hours (press 1 to answer)', 'Salons: calls ring whoever has the app open, and your salon name shows on caller ID'],
    mini: (<><div className="h">Incoming call</div>
      <div className="h-bub them">Ringing your app · Dana L.<small>20 seconds, then the assistant (Pro) or greeting and text-back</small></div>
      <div className="h-bub us">Answered by Maya<small>3 min 12 s</small></div></>),
  },
  app: {
    tab: 'Owner app', hint: 'Inbox, team, alerts',
    title: 'Owner app',
    lede: 'One inbox for every conversation, call and review. Add your front desk so they can reply too, and get a phone alert when something needs you.',
    ticks: ['One inbox for texts, calls, voicemails and reviews', 'Phone alerts for bookings, voicemails and hand-offs, quiet from 9 PM to 8 AM', 'Team logins for salons: front desk sees clients and messages, not billing', 'Add it to your Home Screen. Sign in with an email link, no password'],
    mini: (<><div className="h">Alert on your phone</div>
      <div className="h-bub them"><b>Needs you:</b> Kim asked about moving a color appointment.<small>Curivanta · now</small></div>
      <div className="h-bub them"><b>Booked by text:</b> Sat 10:00, Women's cut with Maya.<small>Curivanta · 12 min ago</small></div></>),
  },
};

const DASH = {
  today: {
    k: [['5', 'calls answered by the assistant'], ['7', 'missed calls texted back'], ['6', 'booked for you'], ['4.9', 'avg new rating']],
    s: [['MR', 'Maya R.', '9 clients · 5 reviews', '5.0'], ['JT', 'Jordan T.', '7 clients · 3 reviews', '4.9'], ['AK', 'Aisha K.', '6 clients · 4 reviews', '4.8']],
    n: [['p-amber', 'Call back: asked the assistant for you', 'Kim B. · 12m'], ['p-amber', 'Refund question', 'Lena P. · 38m'], ['p-blue', 'Voicemail', '(949) 555-0142 · 1h']],
  },
  yesterday: {
    k: [['8', 'calls answered by the assistant'], ['9', 'missed calls texted back'], ['10', 'booked for you'], ['4.8', 'avg new rating']],
    s: [['MR', 'Maya R.', '11 clients · 7 reviews', '4.9'], ['JT', 'Jordan T.', '9 clients · 5 reviews', '4.9'], ['AK', 'Aisha K.', '8 clients · 4 reviews', '4.7']],
    n: [['p-amber', "Wants a stylist who's off", 'Lena P. · yesterday'], ['p-blue', 'Message taken by the assistant', 'Rosa M. · yesterday']],
  },
  week: {
    k: [['38', 'calls answered by the assistant'], ['41', 'missed calls texted back'], ['46', 'booked for you'], ['4.9', 'avg new rating']],
    s: [['MR', 'Maya R.', '58 clients · 33 reviews', '4.9'], ['JT', 'Jordan T.', '49 clients · 26 reviews', '4.9'], ['AK', 'Aisha K.', '44 clients · 21 reviews', '4.8']],
    n: [['p-green', 'All caught up', 'Nothing waiting on you']],
  },
} as const;
type Range = keyof typeof DASH;

const HomePreview = () => {
  useEffect(() => { document.title = 'Curivanta | The salon front desk that books, not just answers'; }, []);

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

  const [calls, setCalls] = useState(15);
  const [ticket, setTicket] = useState(65);
  const [rate, setRate] = useState(40);
  const bookings = Math.round(calls * (rate / 100) * 4.33);
  const lost = Math.round((bookings * ticket) / 10) * 10;

  // Front-desk cost: BLS May 2024 median receptionist pay is $17.90/hr (bls.gov/ooh). Weeks = 4.33/month.
  const [deskHours, setDeskHours] = useState(30);
  const [deskRate, setDeskRate] = useState(18);
  const deskCost = Math.round((deskHours * deskRate * 4.33) / 10) * 10;

  const [job, setJob] = useState<keyof typeof JOBS>('textback');
  const [range, setRange] = useState<Range>('today');
  const d = DASH[range];
  const j = JOBS[job];

  return (
    <div className="cvh">
      <header className="h-nav">
        <div className="h-wrap h-nav-in">
          <a className="h-brand" href="#top" aria-label="Curivanta">
            <img src="/brand/logo-light.png" alt="Curivanta" className="h-logo-onlight" />
            <img src="/brand/logo-dark.png" alt="" className="h-logo-ondark" />
          </a>
          <nav className="h-links" aria-label="Page">
            <a href="#desk" data-umami-event="nav_desk">Why Curivanta</a>
            <a href="#product" data-umami-event="nav_product">Product</a>
            <a href="#how" data-umami-event="nav_how">How it works</a>
            <a href="#pricing" data-umami-event="nav_pricing">Pricing</a>
            <a href="#faq" data-umami-event="nav_faq">FAQ</a>
          </nav>
          <div className="h-nav-cta">
            <ThemeToggle />
            <a className="h-signin" href={SIGNIN_URL} data-umami-event="nav_sign_in">Sign in</a>
            <a className="h-btn h-btn-primary h-btn-sm" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where="nav">Get started</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="h-hero">
          <div className="h-wrap h-hero-grid">
            <div>
              <p className="h-rating"><span className="h-stars" aria-hidden="true">★★★★★</span> <b>4.3 → 4.5 on Google</b> in one month at my own salon</p>
              <h1>The front desk that <em>books</em>, not just answers.</h1>
              <p className="h-sub">Curivanta answers your clients' texts around the clock, texts back every missed call, and on Pro, picks up the phone when you can't. It remembers every client and books them into your real calendar, with every call, text, visit and review on one page. All for less than a week of a receptionist's pay.</p>
              <ul className="h-does">
                <li>Texts back</li>
                <li>Books into your calendar</li>
                <li>Knows every client</li>
                <li>Gets reviews</li>
                <li>Answers calls <span className="h-pro">Pro</span></li>
              </ul>
              <div className="h-ctas">
                <a className="h-btn h-btn-primary" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where="hero">Get started</a>
                <a className="h-btn h-btn-ghost" href="#product" data-umami-event="cta_see_how" data-umami-event-where="hero">See how it works</a>
              </div>
              <div className="h-notes">
                <span>From $49/mo, starts when texting goes live</span>
                <span>For salons and solo stylists</span>
                <span>Built by a salon owner</span>
              </div>
            </div>

            <div className="h-shot" aria-label="Sample of the Curivanta owner app">
              <div className="h-app">
                <div className="h-app-top"><b>Today</b><span className="h-loc">Glow Studio · Main St</span><span className="h-live"><i></i>LIVE</span></div>
                <div className="h-tabsrow"><span className="on">Today</span><span>Messages</span><span>Reviews</span><span>Calls</span><span>Bookings</span></div>
                <div className="h-kpis">
                  <div className="h-kpi"><div className="n">5</div><div className="l">calls answered by the assistant</div></div>
                  <div className="h-kpi"><div className="n">7</div><div className="l">missed calls texted back</div></div>
                  <div className="h-kpi"><div className="n">6</div><div className="l">booked for you</div></div>
                  <div className="h-kpi"><div className="n">22</div><div className="l">review requests</div></div>
                </div>
                <div className="h-feed">
                  <div className="h-row"><span><span className="h-pill p-green">Booked by phone</span>Dana L. · Trim, Sat 10:00 with Maya</span><time>4m</time></div>
                  <div className="h-row"><span><span className="h-pill p-blue">New review</span><span className="h-stars">★★★★★</span> "Maya nailed my color" · response drafted for you to approve</span><time>21m</time></div>
                  <div className="h-row"><span><span className="h-pill p-amber">Needs you</span>Client asked about a refund · handed to you</span><time>38m</time></div>
                </div>
              </div>
              <div className="h-float f2">
                <div className="h">Google review</div>
                <span className="h-stars">★★★★★</span>
                <div style={{ marginTop: 4 }}>"Jordan is the only one I trust with my fade."</div>
              </div>
              <div className="h-float f1 h-call" aria-label="Sample call answered by the AI assistant">
                <div className="h-call-top"><span className="h-call-dot"></span><b>Assistant on a call</b><span className="h-pro">Pro</span><span className="h-call-time">0:48</span></div>
                <div className="h-bub them">Can Maya do a trim Saturday morning?<small>Dana · calling while you're with a client</small></div>
                <div className="h-bub us">She has ten or eleven thirty. Which works?<small>Assistant</small></div>
                <div className="h-call-done"><span className="h-pill p-green">Booked</span>Sat 10:00 with Maya · confirmation texted</div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-strip">
          <div className="h-wrap h-strip-in">
            <div className="h-works">
              <b>Works with</b>
              <span className="h-chip">SalonUltimate</span>
              <span className="h-chip">Your online booking link</span>
              <span className="h-chip">Google Business Profile</span>
              <span className="h-chip">Your current number</span>
              <span className="h-chip">Or a new business number</span>
            </div>
          </div>
        </div>

        <section className="h-block" id="desk" data-track-view="desk">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">Your front desk, for less</div>
              <h2>A full front desk for less than a week of a receptionist's pay.</h2>
              <p>A receptionist is great when they're at the desk. Curivanta covers every hour they aren't, and does it for the price of a few shifts.</p>
            </div>
            <div className="h-desk">
              <div className="h-calc h-desk-calc">
                <div className="h-calc-in">
                  <div className="h-field">
                    <label htmlFor="d-hours">Front-desk hours a week <output>{deskHours}</output></label>
                    <input id="d-hours" type="range" min={10} max={60} step={5} value={deskHours} onChange={e => setDeskHours(+e.target.value)} />
                  </div>
                  <div className="h-field">
                    <label htmlFor="d-rate">Hourly pay <output>${deskRate}</output></label>
                    <input id="d-rate" type="range" min={14} max={30} value={deskRate} onChange={e => setDeskRate(+e.target.value)} />
                    <small>The US median for receptionists is about $18 an hour (US Bureau of Labor Statistics), before payroll taxes.</small>
                  </div>
                </div>
                <div className="h-calc-out" aria-live="polite">
                  <span className="lbl">A front-desk hire costs about</span>
                  <span className="amt">${deskCost.toLocaleString('en-US')}<small>/mo</small></span>
                  <p>For {deskHours} hours a week, before taxes, breaks and sick days.</p>
                  <p className="vs">Curivanta Pro: $149 a month, every hour of every day.</p>
                </div>
              </div>
              <div className="h-tablewrap h-desk-table">
                <table>
                  <thead><tr><th></th><th>Front-desk hire</th><th className="us">Curivanta</th></tr></thead>
                  <tbody>
                    <tr><td>Hours</td><td>Their shift</td><td className="us">24/7, including Sundays</td></tr>
                    <tr><td>Two calls at once</td><td className="nn">One waits</td><td className="us"><span className="y">✓</span> Every call</td></tr>
                    <tr><td>Remembers every client</td><td>The regulars</td><td className="us"><span className="y">✓</span> Every visit, every stylist</td></tr>
                    <tr><td>Asks every client for a review</td><td>When they remember</td><td className="us"><span className="y">✓</span> After every visit</td></tr>
                    <tr><td>Greets walk-ins, checks clients out</td><td><span className="y">✓</span></td><td className="us nn">No, that's still you</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="h-points">
              <div className="h-pt"><h3>Solo stylist?</h3><p>The receptionist you never had to hire, and a business number so your cell stays private. <a href="#solo">See how</a></p></div>
              <div className="h-pt"><h3>Small salon?</h3><p>Cover the desk without adding a hire. Your stylists stop running to the phone between clients.</p></div>
              <div className="h-pt"><h3>Already have a front desk?</h3><p>Keep them. Curivanta picks up the calls they can't get to: during their lunch break, while they're on another call, on busy Saturdays and after hours.</p></div>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="solo" data-track-view="solo">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">For solo stylists</div>
              <h2>Take your personal number off your business cards.</h2>
              <p>Most solo stylists run their whole business from their own cell. Clients text at 10 PM, call on your day off, and keep your number forever. Starter gives you a separate business number, and an AI that looks after it for you.</p>
            </div>
            <div className="h-fit">
              <div className="h-fit-col no">
                <h3>Your cell today</h3>
                <ul>
                  <li>Clients text your personal number at all hours</li>
                  <li>Client texts mixed in with family and friends</li>
                  <li>Every client you've ever had keeps your cell</li>
                  <li>A call you miss while you're foiling is a booking gone</li>
                </ul>
              </div>
              <div className="h-fit-col yes">
                <h3>With a Curivanta number</h3>
                <ul>
                  <li>One business number for your cards, Instagram and booking page</li>
                  <li>Calls ring your cell only during your hours (press 1 to answer)</li>
                  <li>After hours, callers get your greeting and voicemail, and your phone stays quiet</li>
                  <li>Text and call clients from the app: they see the business number, never your cell</li>
                  <li>Work lives in one app. Your cell goes back to being yours</li>
                </ul>
              </div>
            </div>

            <div className="h-head h-solo-sub">
              <h3>AI without the hype: what it actually does in your day</h3>
              <p>You've heard a lot about AI. Here's the plain version: it handles the phone and texts so you can stay with the client in your chair.</p>
            </div>
            <ol className="h-day">
              <li><time>10:20 AM</time><div><b>You're mid-color and a client calls.</b><p>You can't answer. Within a minute she gets a text from your business number. She asks how much a gloss is, and the AI answers from your menu and books her in, or sends your booking link.</p></div></li>
              <li><time>2:05 PM</time><div><b>A new client texts: "Do you do curly cuts?"</b><p>The AI answers from your services and prices, and helps them book. You're never interrupted.</p></div></li>
              <li><time>9:40 PM</time><div><b>Someone calls after hours.</b><p>Your phone doesn't ring. They hear your greeting and leave a voicemail, which arrives in the app as text, ready for the morning.</p></div></li>
              <li><time>Next morning</time><div><b>Coffee, then two taps.</b><p>Review requests have gone out to your clients, and a new Google review has a reply drafted for you. Read it and tap approve.</p></div></li>
            </ol>
            <div className="h-solo-foot">
              <p><b>Your part:</b> nothing during appointments, and a couple of minutes over coffee.</p>
              <a className="h-btn h-btn-primary" href={START_STARTER_URL} data-umami-event="cta_get_started" data-umami-event-where="solo">Start with Starter, $49/mo</a>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="ai" data-track-view="ai">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">The AI front desk</div>
              <h2>You know your clients. Now your AI does too.</h2>
              <p>A generic AI receptionist asks every caller for their name, what they want and who they usually see. Curivanta already knows, so a returning client books in a few messages, by text or, on Pro, by phone.</p>
            </div>
            <div className="h-spot">
              <div className="h-spot-chat">
                <div className="h">Text conversation · 8:47 PM</div>
                <div className="h-bub them">Hi, do you have any availability for Saturday?<small>Sarah</small></div>
                <div className="h-bub us">Hi Sarah! Is it for another root touch-up with Jess, like last time? She has 10:00 or 1:30 on Saturday. Which works?<small>Curivanta</small></div>
                <div className="h-bub them">10 please<small>Sarah</small></div>
                <div className="h-bub us">You're booked: Saturday at 10:00 AM, root touch-up with Jess. See you then!<small>Curivanta</small></div>
              </div>
              <div className="h-spot-work">
                <div className="h">What Curivanta knew before it replied</div>
                <ul>
                  <li>Who she is: Sarah, from her phone number</li>
                  <li>Her usual stylist: Jess</li>
                  <li>Her usual service: root touch-up</li>
                  <li>Her last visit: Saturday, October 4</li>
                  <li>Nothing booked yet, so she needs a time</li>
                </ul>
                <div className="h" style={{ marginTop: 16 }}>Then it did the work</div>
                <ul>
                  <li>Turned "Saturday" into the right date</li>
                  <li>Checked Jess's real openings, and offered only free times</li>
                  <li>Booked it and sent you an alert</li>
                </ul>
                <p className="h-spot-total"><b>0 minutes</b> of your time, after the salon had closed.</p>
              </div>
            </div>
            <div className="h-points h-points4">
              <div className="h-pt"><h3>Knows your salon</h3><p>Learns your services, prices, hours, parking and policies from your website. Add anything else in plain words.</p></div>
              <div className="h-pt"><h3>Knows when to stop</h3><p>Complaints, unusual requests and anything it isn't sure of go to you, with a phone alert.</p></div>
              <div className="h-pt"><h3>Learns from day one</h3><p>Visit history builds from the day you connect: every checkout and booking adds to it. The more clients come back, the more it knows.</p></div>
              <div className="h-pt"><h3>Plays by the rules</h3><p>If two people share a phone, it asks who the appointment is for. STOP always works.</p></div>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="clients" data-track-view="clients">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">Every client, one place</div>
              <h2>Every call, text, visit and review, on one page per client.</h2>
              <p>Most salons keep these in separate places: texts on one phone, reviews in Google, bookings in the calendar. Curivanta puts each client's whole story on one timeline, so you and the AI both know who you're talking to.</p>
            </div>
            <div className="h-c360">
              <div className="h-cphone" aria-label="Sample client page in the Curivanta app">
                <div className="h-chero">
                  <span className="h-cback">‹ Clients</span>
                  <div className="h-cwho"><span className="h-cav">SW</span><div><b>Sarah Whitman</b><span>(949) 555-0187 · client since 2023</span></div></div>
                  <div className="h-cstats">
                    <div><b>14</b><span>visits</span></div>
                    <div><b>Jess</b><span>usual stylist</span></div>
                    <div><b>Sat 10:00</b><span>next visit</span></div>
                  </div>
                  <div className="h-cacts"><span>Call</span><span>Mark done</span><span className="soft">Notes</span></div>
                </div>
                <div className="h-cbody">
                  <div className="h-cnote">Sensitive scalp. Likes her toner a little cooler.</div>
                  <div className="h-cfilters"><span className="on">Everything</span><span>Texts</span><span>Calls</span><span>Visits</span><span>Reviews</span></div>
                  <div className="h-cday">Sat Oct 4</div>
                  <div className="h-cev"><span className="h-cic g">✂</span><div><b>Visit: Root touch-up with Jess</b><span>10:00 AM</span></div></div>
                  <div className="h-cev"><span className="h-cic a">★</span><div><b>Review request: rated 5 ★</b><span>4:12 PM · Jess · opened the Google review link</span></div></div>
                  <div className="h-cev"><span className="h-cic v">G</span><div><b>Google review: ★★★★★</b><span>"Jess is the only one I trust with my color."</span><span>Your reply: Thank you, Sarah! See you next time.</span></div></div>
                  <div className="h-cday">Today</div>
                  <div className="h-cev"><span className="h-cic r">↙</span><div><b>Missed call, texted back</b><span>8:44 PM</span></div></div>
                  <div className="h-cbub in">Hi, do you have any availability for Saturday?</div>
                  <div className="h-cbub out">Hi Sarah! Is it for another root touch-up with Jess, like last time? She has 10:00 or 1:30.</div>
                  <div className="h-cbub in">10 please</div>
                  <div className="h-cev"><span className="h-cic g">▦</span><div><b>Booked: Root touch-up with Jess</b><span>For Sat 10:00 AM · booked by the assistant</span></div></div>
                </div>
              </div>
              <div className="h-c360-copy">
                <ul className="h-ticks">
                  <li><span><b>One timeline.</b> Calls, voicemails, texts, visits, review requests and Google reviews, in the order they happened.</span></li>
                  <li><span><b>The basics at a glance.</b> How many visits, their usual stylist, and when they're booked next.</span></li>
                  <li><span><b>Google reviews matched to the client.</b> See who wrote it, which visit it was about, and your reply.</span></li>
                  <li><span><b>Notes for your team.</b> Allergies and preferences everyone at the desk can see.</span></li>
                  <li><span><b>Reply or call from the same page.</b> Your salon number shows, not your cell.</span></li>
                </ul>
                <p className="h-c360-why">This is also why the AI can say "another root touch-up with Jess, like last time?" It reads the same history you do.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="h-block" id="cost" data-track-view="calculator">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">The problem</div>
              <h2>Every missed call is a client deciding where else to go.</h2>
              <p>Calls get missed during services, after hours, and on the day you're closed. Most callers don't leave a voicemail. Move the sliders to see what that adds up to.</p>
            </div>
            <div className="h-calc">
              <div className="h-calc-in">
                <div className="h-field">
                  <label htmlFor="c-calls">Missed calls a week <output>{calls}</output></label>
                  <input id="c-calls" type="range" min={2} max={60} value={calls} onChange={e => setCalls(+e.target.value)} />
                </div>
                <div className="h-field">
                  <label htmlFor="c-ticket">Average ticket <output>${ticket}</output></label>
                  <input id="c-ticket" type="range" min={20} max={250} step={5} value={ticket} onChange={e => setTicket(+e.target.value)} />
                </div>
                <div className="h-field">
                  <label htmlFor="c-rate">Callers who wanted to book <output>{rate}%</output></label>
                  <input id="c-rate" type="range" min={10} max={80} step={5} value={rate} onChange={e => setRate(+e.target.value)} />
                  <small>A conservative guess. Many missed callers are new clients.</small>
                </div>
              </div>
              <div className="h-calc-out" aria-live="polite">
                <span className="lbl">Bookings walking out the door each month</span>
                <span className="amt">${lost.toLocaleString('en-US')}</span>
                <p>About {bookings} bookings a month, at your average ticket.</p>
                <p className="vs">Curivanta starts at $49 a month.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="product" data-track-view="product">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">What it does</div>
              <h2>Six front-desk jobs, handled in one place.</h2>
              <p>Each one works on its own and they share one inbox, so nothing falls between apps.</p>
            </div>
            <div className="h-jobs">
              <div className="h-jtabs" role="tablist" aria-label="Product">
                {Object.entries(JOBS).map(([key, v]) => (
                  <button key={key} className="h-jtab" role="tab" aria-selected={job === key} aria-controls="h-jpanel"
                    onClick={() => { setJob(key as keyof typeof JOBS); track('home_product_tab', { tab: key }); }}>
                    <b>{v.tab}</b><span>{v.hint}</span>
                  </button>
                ))}
              </div>
              <div className="h-jpanel" id="h-jpanel" role="tabpanel">
                <h3>{j.title}</h3>
                <p className="h-lede">{j.lede}</p>
                <div className="h-jcols">
                  <ul className="h-ticks">{j.ticks.map(t => <li key={t}>{t}</li>)}</ul>
                  <div className="h-mini">{j.mini}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="h-block h-dashsec" id="dashboard" data-track-view="dashboard">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">Owner app</div>
              <h2>Know how your salon did today, not at the end of the month.</h2>
              <p>Open it any time. See the calls your assistant answered and what it booked, which stylist clients are praising, and exactly what you've used this month.</p>
            </div>
            <div className="h-app">
              <div className="h-app-top"><b>Glow Studio</b><span className="h-loc">Main St · sample data</span><span className="h-live"><i></i>LIVE</span></div>
              <div className="h-range" role="group" aria-label="Date range">
                {([['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'Last 7 days']] as [Range, string][]).map(([r, label]) => (
                  <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>{label}</button>
                ))}
              </div>
              <div className="h-kpis">
                {d.k.map(([n, l]) => <div className="h-kpi" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>)}
              </div>
              <div className="h-dgrid">
                <div className="h-dcol"><h4>By stylist</h4>
                  {d.s.map(([av, name, meta, avg]) => (
                    <div className="h-sty" key={name}><span className="h-av">{av}</span><span className="who"><b>{name}</b><span>{meta}</span></span><span className="h-stars">★</span><span className="avg">{avg}</span></div>
                  ))}
                </div>
                <div className="h-dcol"><h4>Needs you</h4>
                  {d.n.map(([cls, label, when]) => (
                    <div className="h-row" key={label}><span><span className={'h-pill ' + cls}>{label}</span></span><time>{when}</time></div>
                  ))}
                </div>
              </div>
              <div className="h-usage">
                <div><b>Texts this month:</b> 412 of 1,000<div className="h-meter"><i style={{ width: '41%' }}></i></div></div>
                <div><b>Call minutes:</b> 96 of 300<div className="h-meter"><i style={{ width: '32%' }}></i></div></div>
                <div><b>Assistant minutes:</b> 64 of 200<div className="h-meter"><i style={{ width: '32%' }}></i></div></div>
              </div>
            </div>
            <div className="h-points">
              <div className="h-pt"><h3>Plain words, big numbers</h3><p>No charts that need a tutorial. If you can read a weather app, you can read this.</p></div>
              <div className="h-pt"><h3>Per stylist</h3><p>Reviews name the stylist, so you see who's getting praised and for what.</p></div>
              <div className="h-pt"><h3>Usage you can check</h3><p>Every text and minute is listed against the conversation it came from.</p></div>
            </div>
          </div>
        </section>

        <section className="h-block" id="how" data-track-view="how">
          <div className="h-wrap">
            <div className="h-head">
              <div className="h-kicker">How it works</div>
              <h2>About 15 minutes of your time. We do the rest.</h2>
              <p>No new hardware, no new booking system, no training calls. We register you with the phone carriers so your texts get delivered.</p>
            </div>
            <div className="h-steps">
              <div className="h-step"><div className="n">1</div><h3>Pick a plan and paste one link</h3><p>Paste your website, booking page or Google listing. We read it and fill in your services, prices, hours and stylists.</p><span className="t">About 5 minutes</span></div>
              <div className="h-step"><div className="n">2</div><h3>Connect your booking</h3><p>On SalonUltimate, add help@curivanta.com as a Receptionist. On anything else, just share your online booking link.</p><span className="t">About 5 minutes</span></div>
              <div className="h-step"><div className="n">3</div><h3>Pick your number and you're done</h3><p>Choose your number and enter your legal name and EIN. No EIN? Solo stylists can register as a sole proprietor with one text reply.</p><span className="t">About 5 minutes</span></div>
            </div>
            <div className="h-timeline">
              <span><b>Day 1:</b> setup done, your number is ready</span>
              <span><b>Weeks 3 to 4:</b> carriers approve texting and you go live</span>
              <span><b>Go-live:</b> your monthly plan starts</span>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="switch" data-track-view="switch">
          <div className="h-wrap">
            <div className="h-switch">
              <div className="h-switch-copy">
                <div className="h-kicker">Switching over</div>
                <h2>Already using another texting or review tool? Switching is easy.</h2>
                <p>You don't have to cancel anything on day one. We set Curivanta up alongside what you use today, and you switch over once your texting is approved.</p>
                <a className="h-btn h-btn-primary" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where="switch">Get started</a>
              </div>
              <ul className="h-switch-list">
                <li><span><b>Salons keep their number.</b> Nothing to port. You just forward the calls you miss, and you can undo that any time.</span></li>
                <li><span><b>We do the setup.</b> Carrier registration, your greeting, your services and stylists. You answer a few questions.</span></li>
                <li><span><b>Run both side by side.</b> Your current tool keeps working while carriers approve your texting, so nothing goes quiet.</span></li>
                <li><span><b>Switch when you're ready.</b> Once you're live, turn the old tool off. Your monthly charge only starts then.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="h-block flush">
          <div className="h-wrap">
            <div className="h-owner">
              <div className="h-owner-copy">
                <div className="h-owner-head">
                  <div className="h-kicker">Why I built it</div>
                  <h2>I own salons. I can't stand behind every front desk.</h2>
                </div>
                <div className="h-owner-text">
                  <p>I kept losing bookings to missed calls and watching great work go unreviewed. The tools I tried were built for every business at once: menus inside menus, prices hidden behind a demo.</p>
                  <p>So I built the front desk I wanted. It runs my own salon first, it speaks plain salon language, and the price is on this page.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="fit" data-track-view="fit">
          <div className="h-wrap">
            <div className="h-head center">
              <div className="h-kicker">Is it right for you?</div>
              <h2>Built for salons and solo stylists. Not for everyone.</h2>
            </div>
            <div className="h-fit">
              <div className="h-fit-col yes">
                <h3>A good fit if</h3>
                <ul>
                  <li>You miss calls while you're with a client</li>
                  <li>You book on SalonUltimate (salon or solo), or you have an online booking link</li>
                  <li>You want more Google reviews without asking every client yourself</li>
                  <li>Your clients would rather text than play phone tag</li>
                  <li>You'd like every call answered, even when you're with a client (Pro)</li>
                </ul>
              </div>
              <div className="h-fit-col no">
                <h3>Not the right fit yet if</h3>
                <ul>
                  <li>You want to send promotions or marketing blasts</li>
                  <li>You need bookings to land in software other than SalonUltimate. You can still use your booking link.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="pricing" data-track-view="pricing">
          <div className="h-wrap">
            <div className="h-head center">
              <div className="h-kicker">Pricing</div>
              <h2>Three plans. All priced right here.</h2>
              <p>Per location. No contract, no demo needed to find out what it costs.</p>
            </div>
            <div className="h-prices">
              <div className="h-card">
                <div className="h-pname">Starter <span className="h-badge soft">Just you</span></div>
                <p className="h-for">For solo stylists and booth renters</p>
                <div className="h-price">$49<small> /month</small></div>
                <p className="h-psub">+ $49 one-time setup.</p>
                <div className="h-allow"><b>Includes 200 texts and 200 call minutes a month.</b> Need more? $10 per extra 100 texts, or per 100 minutes. We let you know at 80%.</div>
                <ul>
                  <li>A separate business number, so your cell stays private</li>
                  <li>Calls ring your cell and the app during your hours</li>
                  <li>Missed-call text-back, with voicemails as text</li>
                  <li>AI texting that answers questions and books into SalonUltimate, or sends your booking link</li>
                  <li>Review requests (3 a day to start)</li>
                  <li>AI drafts Google review responses for you to approve</li>
                  <li>Owner app with phone alerts</li>
                  <li>Move up to Light or Pro any time</li>
                </ul>
                <a className="h-btn h-btn-ghost" href={START_STARTER_URL} data-umami-event="cta_get_started" data-umami-event-where="pricing_starter">Start with Starter</a>
              </div>
              <div className="h-card main">
                <div className="h-pname">Light <span className="h-badge">For salons</span></div>
                <p className="h-for">For salons with a team</p>
                <div className="h-price">$99<small> /month</small></div>
                <p className="h-psub">+ $99 one-time setup.</p>
                <div className="h-allow"><b>Includes 1,000 texts and 300 call minutes a month.</b> Need more? $10 per extra 100 texts, or per 100 minutes. We let you know at 80%.</div>
                <ul>
                  <li>Keep your salon number; missed calls forward to Curivanta</li>
                  <li>AI texting that books straight into SalonUltimate</li>
                  <li>Review requests (10 a day to start)</li>
                  <li>AI drafts Google review responses for you to approve</li>
                  <li>Team logins for owner, manager and front desk</li>
                  <li>Call from the app; your salon name shows on caller ID</li>
                  <li>Ratings and reviews by stylist</li>
                  <li>One login for several salons</li>
                  <li>Move up to Pro any time</li>
                </ul>
                <a className="h-btn h-btn-primary" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where="pricing_light">Start with Light</a>
              </div>
              <div className="h-card">
                <div className="h-pname">Pro <span className="h-badge">New</span></div>
                <p className="h-for">For salons that want every call answered</p>
                <div className="h-price">$149<small> /month</small></div>
                <p className="h-psub">+ $149 one-time setup.</p>
                <div className="h-allow"><b>Everything in Light, plus 200 assistant minutes a month.</b> Extra assistant minutes are $10 per 50. We let you know at 80%.</div>
                <ul>
                  <li>Everything in Light</li>
                  <li>When nobody picks up, the AI assistant answers the call</li>
                  <li>Answers questions, books appointments and texts a confirmation</li>
                  <li>Knows returning clients and what they usually book</li>
                  <li>Takes messages, or asks you to call back</li>
                  <li>Every call it takes, with what was said, in your app</li>
                  <li>You choose when it answers: always, or only when you're closed</li>
                </ul>
                <a className="h-btn h-btn-ghost" href={START_PRO_URL} data-umami-event="cta_get_started" data-umami-event-where="pricing_pro">Start with Pro</a>
              </div>
            </div>
            <p className="h-pfoot">Setup is paid at sign-up. Your monthly charge starts only when texting goes live, usually 3 to 4 weeks later. Month to month after that: cancel any time and it ends at the end of the month you've paid for.</p>
          </div>
        </section>

        <section className="h-block flush" id="trust" data-track-view="trust">
          <div className="h-wrap">
            <div className="h-head center">
              <div className="h-kicker">Peace of mind</div>
              <h2>Texts that get delivered, and play by the rules.</h2>
            </div>
            <div className="h-trust">
              <div><h3>Registered with the carriers</h3><p>We register your business for texting, so messages arrive and aren't blocked as spam.</p></div>
              <div><h3>STOP always works</h3><p>Every first message says how to opt out, and opt-outs are honored automatically.</p></div>
              <div><h3>No review gating</h3><p>Every client gets your Google link, as Google's rules require.</p></div>
              <div><h3>Your data stays yours</h3><p>Each salon's data is kept separate, and logins to your booking and Google accounts are encrypted.</p></div>
              <div><h3>No contract</h3><p>Month to month. Cancel any time from the app.</p></div>
            </div>
          </div>
        </section>

        <section className="h-block flush" data-track-view="compare">
          <div className="h-wrap">
            <div className="h-head center">
              <div className="h-kicker">Compare</div>
              <h2>Not another AI receptionist. A salon front desk.</h2>
            </div>
            <div className="h-tablewrap">
              <table>
                <thead><tr><th></th><th>Front desk alone</th><th>Generic AI receptionists</th><th>All-in-one platforms</th><th className="us">Curivanta</th></tr></thead>
                <tbody>
                  <tr><td>Price shown up front</td><td className="nn">n/a</td><td><span className="y">✓</span> Often</td><td className="nn">Usually "book a demo"</td><td className="us"><span className="y">✓</span> From $49/mo</td></tr>
                  <tr><td>Missed calls after hours</td><td className="nn">Voicemail</td><td><span className="y">✓</span> By voice</td><td><span className="y">✓</span></td><td className="us"><span className="y">✓</span> Text in a minute</td></tr>
                  <tr><td>Calls answered when you can't pick up</td><td className="nn">Voicemail</td><td><span className="y">✓</span></td><td className="nn">Sometimes, as an add-on</td><td className="us"><span className="y">✓</span> On Pro</td></tr>
                  <tr><td>Books into SalonUltimate</td><td>By hand</td><td className="nn">Takes a message</td><td className="nn">Rarely</td><td className="us"><span className="y">✓</span> Straight in</td></tr>
                  <tr><td>Remembers returning clients</td><td>If they remember</td><td className="nn">Rarely</td><td className="nn">Rarely</td><td className="us"><span className="y">✓</span> By name, with their usual</td></tr>
                  <tr><td>Reviews name the stylist</td><td className="nn">No</td><td className="nn">No</td><td className="nn">Rarely</td><td className="us"><span className="y">✓</span></td></tr>
                  <tr><td>Setup</td><td className="nn">n/a</td><td>Varies</td><td>Weeks of training</td><td className="us">15 minutes, we do the rest</td></tr>
                  <tr><td>One page per client: calls, texts, visits, reviews</td><td className="nn">No</td><td className="nn">Calls only</td><td className="nn">Sometimes</td><td className="us"><span className="y">✓</span></td></tr>
                  <tr><td>Contract</td><td className="nn">n/a</td><td>Varies</td><td>Often annual</td><td className="us">Month to month</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="h-block flush" id="faq" data-track-view="faq">
          <div className="h-wrap">
            <div className="h-head center"><div className="h-kicker">Questions</div><h2>Asked by owners like you</h2></div>
            <div className="h-faq">
              <details><summary>Do I need a new booking system?</summary><p>No. If you're on SalonUltimate, salon or solo, bookings go straight into your calendar: Curivanta reads your real openings and books the time. On any other system, the AI sends your online booking link when a client wants to book.</p></details>
              <details><summary>Can I keep my phone number?</summary><p>Salons keep their number: you forward the calls you miss to Curivanta, and we text those callers back. Solo stylists get a new business number that rings their own cell, so their personal number stays private.</p></details>
              <details><summary>I'm a solo stylist or booth renter. Is this for me?</summary><p>Yes, that's what Starter is for: $49 a month and $49 setup. You get a business number that rings your cell, missed-call text-back, AI texting that books into SalonUltimate or sends your booking link, and review requests. You can move up to Light any time.</p></details>
              <details><summary>Does an AI answer my phone?</summary><p>On Pro, yes. When nobody can pick up, your assistant answers the call, tells the caller it's the salon's automated assistant, answers questions and books appointments, and texts a confirmation. Callers can ask for a person or leave a voicemail any time. On Starter and Light, callers hear your greeting, can leave a voicemail, and get a text right away.</p></details>
              <details><summary>How many calls does Pro cover?</summary><p>200 minutes of the assistant on the phone each month, which is around 100 typical booking calls. Extra minutes are $10 per 50, and we let you know at 80%. You can also set it to answer only when you're closed.</p></details>
              <details><summary>Who gets asked for a review?</summary><p>Clients get a text after their visit asking how it went, with your Google link. They can reply 1 to 5 or leave a review. Low ratings and notes also come to you privately so you can make it right. Everyone gets the Google link, which keeps you within Google's rules.</p></details>
              <details><summary>What if a client asks something the AI can't handle?</summary><p>Refunds, complaints and anything unclear get handed to you with the full conversation. The AI never guesses and never makes up a booking.</p></details>
              <details><summary>Why does texting take 3 to 4 weeks to go live?</summary><p>US phone carriers have to approve every business that texts customers (it's called A2P 10DLC registration). We prepare and submit the paperwork for you. Your monthly charge doesn't start until approval comes through.</p></details>
              <details><summary>Can my front desk use it too?</summary><p>Yes, on Light and Pro. Add team members by email. Front-desk logins see messages, calls and reviews, but not billing or settings, and replies show who sent them.</p></details>
            </div>
          </div>
        </section>

        <section className="h-block flush" data-track-view="final_cta">
          <div className="h-wrap">
            <div className="h-final">
              <h2>Your next missed call could be your next booking.</h2>
              <p>Set up in about 15 minutes. Plans from $49 a month, starting only when texting goes live.</p>
              <div className="row2">
                <a className="h-btn h-btn-light" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where="final">Get started</a>
                <a className="h-btn h-btn-outline-light" href="#product">See how it works</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-foot">
        <div className="h-wrap h-foot-in">
          <span>© 2026 Curivanta</span>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <Link to="/privacy" data-umami-event="footer_privacy">Privacy</Link>
          <Link to="/terms" data-umami-event="footer_terms">Terms</Link>
          <a href={SIGNIN_URL} data-umami-event="footer_sign_in">Sign in</a>
          <span className="r">Built by a salon owner. Priced on the page.</span>
        </div>
      </footer>

      <div className="h-sticky"><span>From $49/mo · starts at go-live</span><a className="h-btn h-btn-primary h-btn-sm" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where="sticky">Get started</a></div>
    </div>
  );
};

export default HomePreview;
