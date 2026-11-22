import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bubbles, I, NxFoot, NxNav, Ph, START_URL, useSamplePage, type Line } from './next/Chrome';
import './next/next.css';

// Sample homepage (2026-11-21, branch homepage-human), take 3: Weave's simple structure plus LendAPI's best
// devices: a tabbed product demo in the hero with a live "today" feed, numbers right under it, a grid of
// product cards (each will open its own page), a step-by-step client journey, dated setup, an FAQ before
// the final ask. Served at /new, noindex. <Ph> marks placeholders.

const DEMO: { key: string; tab: string; icon: JSX.Element; head: string; lines: Line[] }[] = [
  { key: 'textback', tab: 'Text-back', icon: I.missed, head: 'Missed call · 2:14 PM', lines: [
    { who: 'note', t: 'Missed call from (949) 555-0142' },
    { who: 'us', t: "Hi, it's Glow Studio. Sorry we missed your call! How can we help? You can book right here." },
    { who: 'them', t: 'Do you have anything Saturday for a cut and color?' },
  ] },
  { key: 'booking', tab: 'Booking', icon: I.cal, head: 'Dana · text', lines: [
    { who: 'them', t: 'Do you have anything Saturday for a cut and color?' },
    { who: 'us', t: 'Maya has 10:00 or 1:30 on Saturday. Which works?' },
    { who: 'them', t: '10 please!' },
    { who: 'us', t: "You're booked: Sat 10:00 AM, cut and color with Maya. See you then!" },
    { who: 'ok', t: 'Booked in your calendar' },
  ] },
  { key: 'reviews', tab: 'Reviews', icon: I.star, head: 'Dana · after her visit', lines: [
    { who: 'us', t: 'Hi Dana, hope your visit with Maya at Glow Studio was a hit! A quick Google review would mean the world to us: g.page/r/glow Or reply 1-5 to rate Maya.' },
    { who: 'them', t: '5! She was amazing' },
    { who: 'ok', t: 'New 5-star Google review' },
  ] },
  { key: 'calls', tab: 'Calls (Pro)', icon: I.headset, head: 'Call · 7:42 PM, after hours', lines: [
    { who: 'us', t: "Hi, thanks for calling Glow Studio. I'm the salon's automated assistant, and this call is recorded and transcribed. How can I help?" },
    { who: 'them', t: 'Can Maya do a trim Saturday morning?' },
    { who: 'us', t: 'She has ten or eleven thirty. Which works?' },
    { who: 'ok', t: 'Booked Sat 10:00 · confirmation texted' },
  ] },
];

const FEED = [
  ['blue', 'Texted back (949) 555-0142', '2m'],
  ['green', 'Booked Dana, Sat 10:00 with Maya', '4m'],
  ['amber', 'Review request sent to Priya', '12m'],
  ['green', 'New 5-star Google review', '25m'],
  ['blue', 'Answered: "Do you take walk-ins?"', '31m'],
  ['gray', 'Voicemail from Rosa, as text', '48m'],
];

const PRODUCTS = [
  { icon: I.missed, t: 'Missed-call text-back', to: '/new/missed-calls', d: 'Every caller you miss gets a text within a minute.' },
  { icon: I.chat, t: 'Texting and booking', to: '/new/missed-calls', d: 'Answers questions and books open times by text.' },
  { icon: I.star, t: 'Review requests', to: '/new/reviews', d: 'One short text after each visit with your Google link.' },
  { icon: I.reply, t: 'Google review replies', to: '/new/reviews', d: 'A reply drafted for every new review, you approve.' },
  { icon: I.phone, t: 'Phone', to: '/new/phone', d: 'Call from the app with your number. Hold and transfer.' },
  { icon: I.headset, t: 'Calls answered', to: '/new/phone', d: 'On Pro, calls nobody picks up get answered and booked.', pro: true },
  { icon: I.user, t: 'Client pages', to: '/new/owner-app', d: 'Every call, text, visit and review, per client.' },
  { icon: I.chart, t: 'Home and morning email', to: '/new/owner-app', d: 'How the salon did, and what needs you.' },
];

const JOURNEY: { step: string; title: string; text: string; card: Line[] }[] = [
  { step: 'Missed call', title: "You're with a client and the phone rings", text: 'Callers hear your greeting, in your words or your own voice. On Pro, the call can be answered for you instead.', card: [{ who: 'note', t: 'Missed call from Dana · 2:14 PM' }] },
  { step: 'Text back', title: 'Dana gets a text within a minute', text: "Most people would rather text than leave a voicemail. If she did leave one, it's in your app as text.", card: [{ who: 'us', t: "Hi, it's Glow Studio. Sorry we missed your call! How can we help?" }] },
  { step: 'Booked', title: 'She books by text, into your real calendar', text: 'Only times that are really open. SalonUltimate and Square bookings go straight in; anything else gets your booking link.', card: [{ who: 'them', t: 'Saturday at 10?' }, { who: 'ok', t: 'Booked Sat 10:00 with Maya' }] },
  { step: 'Visit', title: 'She comes in and checks out as usual', text: 'Nothing changes at the desk. The checkout adds to her client page: visits, usual stylist, what she books.', card: [{ who: 'note', t: 'Checkout · cut and color with Maya · $140' }] },
  { step: 'Review request', title: 'One short text asks for a review', text: 'Every client gets your Google link, happy or not. You set how many go out each day.', card: [{ who: 'us', t: 'Hope your visit with Maya was a hit! A quick Google review would mean the world to us.' }] },
  { step: 'Rating', title: 'She rates Maya, or tells you what went wrong', text: 'Clients can reply 1 to 5. Anything below 4, or a note, comes straight to you so you can make it right.', card: [{ who: 'them', t: '5! She was amazing' }] },
  { step: 'Google reply', title: 'Her Google review gets a thank-you', text: 'A reply is drafted in your salon\'s voice. Approve it with one tap, and it posts on Google.', card: [{ who: 'ok', t: 'New 5-star review · reply ready to approve' }] },
];

const FAQ = [
  ['Do I have to change my phone number?', 'No. Salons keep their number and forward the calls they miss to Curivanta, which you can undo any time. Solo stylists on Starter get a separate business number, so their cell stays private.'],
  ['Which booking software does it work with?', 'It books straight into SalonUltimate and Square. With anything else, it sends clients your own online booking link.'],
  ['How long does setup take?', 'About 15 minutes of your time. Calls work the same day. Texting goes live once the phone carriers approve your number, usually within a few days.'],
  ['Is there a contract?', 'No. Plans are month to month. Your monthly plan starts only when texting goes live, and if you cancel it ends at the end of the month you paid for.'],
  ['What if a client asks something it can\'t handle?', 'Complaints, unusual requests and anything unclear come to you with the whole conversation, as a notification on your phone.'],
];

const HomeNext = () => {
  useSamplePage('Curivanta | Turn missed calls into booked appointments');
  const { hash } = useLocation();
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); }, [hash]);

  // The hero demo moves on by itself until someone picks a tab.
  const [demo, setDemo] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setDemo(d => (d + 1) % DEMO.length), 5000);
    return () => clearInterval(t);
  }, [auto]);
  const [step, setStep] = useState(0);
  const d = DEMO[demo], j = JOURNEY[step];

  return (
    <div className="nx">
      <NxNav />
      <main id="top">
        <section className="nx-hero">
          <div className="nx-wrap nx-hero-in">
            <h1>Turn missed calls into booked appointments.</h1>
            <p className="nx-lede">
              Curivanta texts back every caller, books them into your calendar and asks happy clients for a Google
              review. Built for salons, by a salon owner.
            </p>
            <div className="nx-ctas">
              <a className="nx-btn" href={START_URL}>Get started</a>
              <Link className="nx-btn nx-btn-ghost" to="/new/roi">See what missed calls cost you</Link>
            </div>
            <p className="nx-fine">From $49/month · Set up in about 15 minutes · No contract</p>
          </div>

          <div className="nx-wrap">
            <div className="nx-demo">
              <div className="nx-demo-tabs" role="tablist" aria-label="See it work">
                {DEMO.map((x, i) => (
                  <button key={x.key} role="tab" aria-selected={i === demo} className={i === demo ? 'on' : ''}
                    onClick={() => { setDemo(i); setAuto(false); }}>{x.icon}<span>{x.tab}</span></button>
                ))}
              </div>
              <div className="nx-demo-stage">
                <div className="nx-phone" aria-live="polite">
                  <div className="nx-phone-top"><span className="nx-av sm">G</span><div><b>Glow Studio</b><small>{d.head}</small></div></div>
                  <div className="nx-phone-body" key={d.key}><Bubbles lines={d.lines} /></div>
                </div>
                <div className="nx-feed" aria-label="Sample of what Curivanta did today">
                  <div className="nx-feed-h"><b>Today at Glow Studio</b><span className="nx-live"><i />Live</span></div>
                  <ul>{FEED.map(([c, t, w]) => <li key={t}><span className={'nx-tl ' + c} />{t}<time>{w}</time></li>)}</ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="nx-statband">
          <div className="nx-wrap">
            <p className="nx-statband-h">At our own salon, last month</p>
            <div className="nx-statcards">
              <div><b><Ph>46</Ph></b><span>missed calls texted back</span></div>
              <div><b><Ph>19</Ph></b><span>appointments booked by text</span></div>
              <div><b><Ph>23</Ph></b><span>new Google reviews</span></div>
              <div><b>4.3 → 4.5</b><span>Google rating in the first month</span></div>
            </div>
            <p className="nx-works">Works with <Link to="/salonultimate">SalonUltimate</Link> · <Link to="/square">Square</Link> · Google · any online booking link</p>
          </div>
        </section>

        <section className="nx-sec" id="product">
          <div className="nx-wrap">
            <div className="nx-head">
              <h2>Everything your front desk does, in one app</h2>
              <p>On your phone and your computer. Pick what you need and switch the rest off.</p>
            </div>
            <div className="nx-grid">
              {PRODUCTS.map(p => (
                <Link className="nx-tile" to={p.to} key={p.t}>
                  <span className="nx-ic">{p.icon}</span>
                  <h3>{p.t}{p.pro && <em className="nx-pro">Pro</em>}</h3>
                  <p>{p.d}</p>
                  <span className="nx-more">Learn more {I.arrow}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-sec nx-soft" id="journey">
          <div className="nx-wrap">
            <div className="nx-head">
              <h2>Follow a client through Curivanta</h2>
              <p>From the call you missed to the 5-star review. Pick a step.</p>
            </div>
            <div className="nx-steps" role="tablist">
              {JOURNEY.map((x, i) => (
                <button key={x.step} role="tab" aria-selected={i === step} className={(i === step ? 'on' : '') + (i < step ? ' done' : '')} onClick={() => setStep(i)}>
                  <small>{String(i + 1).padStart(2, '0')}</small>{x.step}
                </button>
              ))}
            </div>
            <div className="nx-jpanel" role="tabpanel">
              <div>
                <h3>{j.title}</h3>
                <p>{j.text}</p>
                <div className="nx-jnav">
                  <button disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
                  <button disabled={step === JOURNEY.length - 1} onClick={() => setStep(step + 1)}>Next step →</button>
                </div>
              </div>
              <div className="nx-card nx-jcard" key={step}><Bubbles lines={j.card} /></div>
            </div>
          </div>
        </section>

        <section className="nx-sec">
          <div className="nx-wrap">
            <div className="nx-head"><h2>Live in days, not weeks</h2><p>About 15 minutes of your time. We handle the carrier paperwork.</p></div>
            <ol className="nx-timeline">
              <li><small>Today · 15 minutes</small><h3>Sign up and paste one link</h3><p>Your website or booking page. We fill in your services, hours and stylists, and connect your booking software.</p></li>
              <li><small>Same day</small><h3>Your number works for calls</h3><p>Answer in the app, voicemails arrive as text. Salons forward the calls they miss.</p></li>
              <li><small>A few days later</small><h3>Texting goes live</h3><p>Once carriers approve your number: text-back, booking by text and review requests switch on.</p></li>
              <li><small>Go-live</small><h3>Your monthly plan starts</h3><p>Not before. The $49 setup is credited to your first month.</p></li>
            </ol>
          </div>
        </section>

        <section className="nx-wrap" id="story">
          <div className="nx-founder">
            <div className="nx-founder-copy">
              <p className="nx-quote">"I own salons and can't stand behind every front desk. I built Curivanta to catch the calls we were missing, and it runs in my own salons every day."</p>
              <p className="nx-who"><b>Salon owner</b> · Founder, Curivanta</p>
              <a className="nx-btn nx-btn-light" href={START_URL}>Get started</a>
            </div>
            <div className="nx-founder-photo"><Ph>Owner photo</Ph></div>
          </div>
        </section>

        <section className="nx-sec" id="pricing">
          <div className="nx-wrap">
            <div className="nx-head"><h2>Simple plans. Prices right here.</h2><p>Per location, month to month. $49 to get started, credited to your first month.</p></div>
            <div className="nx-prices">
              <div className="nx-price"><h3>Starter</h3><p className="nx-for">For solo stylists</p><div className="nx-amt">$49<small>/month</small></div><p>Your own business number, text-back, booking by text and review requests.</p><a className="nx-btn nx-btn-ghost" href={START_URL + '?plan=starter'}>Start with Starter</a></div>
              <div className="nx-price main"><span className="nx-tag">Most salons</span><h3>Light</h3><p className="nx-for">For salons with a team</p><div className="nx-amt">$99<small>/month</small></div><p>Keep your salon number. Team logins, ratings by stylist, and 30 minutes a month of calls answered for you.</p><a className="nx-btn" href={START_URL}>Start with Light</a></div>
              <div className="nx-price"><h3>Pro</h3><p className="nx-for">Every call answered</p><div className="nx-amt">$149<small>/month</small></div><p>Everything in Light, and calls nobody picks up are answered all month.</p><a className="nx-btn nx-btn-ghost" href={START_URL + '?plan=pro'}>Start with Pro</a></div>
            </div>
            <p className="nx-center"><Link to="/new/pricing">Compare plans in detail →</Link> &nbsp;·&nbsp; <Link to="/new/roi">Will it pay for itself? →</Link></p>
          </div>
        </section>

        <section className="nx-sec nx-soft" id="faq">
          <div className="nx-wrap nx-faq">
            <div><h2>Before you sign up</h2><p>The questions salon owners ask us first. Anything else: <a href="mailto:hello@curivanta.com">hello@curivanta.com</a></p></div>
            <div>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
          </div>
        </section>

        <section className="nx-final">
          <div className="nx-wrap nx-final-in">
            <h2>Stop losing bookings to missed calls.</h2>
            <p>Set up in about 15 minutes. Your monthly plan starts only when texting goes live.</p>
            <div className="nx-ctas"><a className="nx-btn" href={START_URL}>Get started</a><Link className="nx-btn nx-btn-ghost" to="/new/roi">Try the ROI calculator</Link></div>
          </div>
        </section>
      </main>
      <NxFoot />
    </div>
  );
};

export default HomeNext;
