import { useParams, Link } from 'react-router-dom';
import { CallCard, Bubbles, I, ListCard, NxFoot, NxNav, START_URL, useSamplePage, type Line, type Said } from './next/Chrome';
import NotFound from './NotFound';
import { Anywhere } from './next/FrontDesk';
import './next/next.css';

// Sample product and "who it's for" pages (2026-11-21), one template: hero with a product card, feature
// rows that alternate sides, a strip of smaller facts, questions, and the closing ask. Served at
// /new/<slug>, noindex. Facts follow curivanta-app (CLAUDE.md) and the current homepage FAQ.

type Art = { call: Said[]; head: string; sub: string; done?: string; ended?: string } | { img: string; frame: 'browser' | 'phone'; alt: string } | { chat: Line[]; head?: string } | { list: [string, string, string][]; head: string } | { tiles: [string, string][]; head: string };
type Row = { h: string; p: string; points?: string[]; art: Art };
export type PageDef = {
  title: string; h1: string; lede: string; plan?: string; art: Art;
  rows: Row[]; facts: [JSX.Element, string, string][]; faq: [string, string][];
  next: [string, string][];
  extra?: JSX.Element;
};

const ArtCard = ({ art }: { art: Art }) => {
  if ('call' in art) return <CallCard head={art.head} sub={art.sub} said={art.call} done={art.done} ended={art.ended} />;
  if ('img' in art) return art.frame === 'browser'
    ? <div className="nx-browser"><div className="nx-browser-bar"><i /><i /><i /><span>app.curivanta.com</span></div><img src={art.img} alt={art.alt} /></div>
    : <div className="nx-handset solo"><img src={art.img} alt={art.alt} /></div>;
  if ('chat' in art) return <div className="nx-card nx-chatcard">{art.head && <div className="nx-card-h">{art.head}</div>}<Bubbles lines={art.chat} /></div>;
  if ('list' in art) return <ListCard head={art.head} rows={art.list} />;
  return (
    <div className="nx-card nx-tilecard"><div className="nx-feed-h"><b>{art.head}</b></div>
      <div className="nx-dash-tiles">{art.tiles.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div></div>
  );
};

export const PAGES: Record<string, PageDef> = {
  'missed-calls': {
    title: 'Missed-call text-back and booking by text for salons | Curivanta',
    h1: 'Missed calls get a text back. Then it books them.',
    lede: 'When nobody can pick up, the caller gets a text from your salon within a minute. Curivanta answers their questions and books them into your calendar, day or night.',
    art: { head: 'Missed call · 2:14 PM', chat: [
      { who: 'note', t: 'Missed call from (949) 555-0142' },
      { who: 'us', t: "Hi, it's Glow Studio. Sorry we missed your call! How can we help? You can book right here." },
      { who: 'them', t: 'Any openings Saturday for a cut and color?' },
      { who: 'us', t: 'Maya has 10:00 or 1:30 on Saturday. Which works?' },
      { who: 'them', t: '10 please!' },
      { who: 'ok', t: 'Booked Sat 10:00 with Maya' },
    ] },
    rows: [
      { h: 'A text within a minute of a missed call', p: 'Most people would rather text than leave a voicemail. Callers hear your greeting first, and get a text from your salon number right after.',
        points: ['Your greeting in your own words, or your own recording', 'Voicemails arrive as text you can read, and audio you can play', 'Every call is logged on the client\'s page'],
        art: { head: 'Calls today', list: [['red', 'Missed: (949) 555-0142 · texted back', '2:14 PM'], ['blue', 'Voicemail from Rosa, as text', '1:02 PM'], ['green', 'Answered in the app by Jess', '12:40 PM'], ['red', 'Missed: Dana · texted back', '11:15 AM']] } },
      { h: 'Answers questions from your own menu', p: 'Curivanta learns your services, prices and policies from your website, and your hours, holidays included, from your Google profile. Teach it once: save one of your replies with a tap and it answers that question next time.',
        points: ['Prices, parking, walk-ins, what to bring', 'Answers in Spanish when clients text in Spanish', 'Complaints and anything unclear come to you, with the whole conversation'],
        art: { head: 'Client · text', chat: [{ who: 'them', t: 'How much is a balayage? And do you have parking?' }, { who: 'us', t: 'Balayage starts at $180 with Maya or Jess. There\'s free parking behind the building. Want me to find you a time?' }] } },
      { h: 'Books real open times, into your calendar', p: 'Only times that are really free. On SalonUltimate or Square, bookings go straight into your appointment book. On anything else, it sends your own online booking link.',
        points: ['Knows returning clients and what they usually book', 'Clients can move or cancel by text, if you switch it on (never within 24 hours)', 'You get a notification for every booking'],
        art: { head: 'Sarah · text', chat: [{ who: 'them', t: 'Anything Saturday?' }, { who: 'us', t: 'Hi Sarah! Another root touch-up with Jess, like last time? She has 10:00 or 1:30.' }, { who: 'them', t: '10' }, { who: 'ok', t: 'Booked in SalonUltimate' }] } },
    ],
    facts: [[I.missed, 'Within a minute', 'Missed calls, day or night'], [I.cal, 'Straight in', 'SalonUltimate and Square bookings'], [I.chat, 'English and Spanish', 'Answers in the client\'s language'], [I.user, 'Hands off to you', 'Anything it can\'t handle']],
    faq: [
      ['Do I need a new booking system?', 'No. On SalonUltimate or Square, bookings go straight into your calendar. On any other system, Curivanta sends your online booking link when a client wants to book.'],
      ['Can I keep my phone number?', 'Yes. Salons forward the calls they miss to Curivanta, and you can undo that any time. Solo stylists get a new business number that rings their cell.'],
      ['What if I reply to a client myself?', 'Once you reply, Curivanta stays out of that conversation for the rest of the day.'],
      ['Why does texting take a few days to go live?', 'US phone carriers approve every business that texts customers. We prepare and submit the paperwork for you, and your monthly plan starts only when they approve.'],
    ],
    next: [['/new/reviews', 'Reviews'], ['/new/phone', 'Phone']],
  },

  reviews: {
    title: 'Google review requests and replies for salons | Curivanta',
    h1: 'More 5-star Google reviews, without asking at the counter.',
    lede: 'After a visit, clients get one short text asking for a review. Every review request includes your Google link. Anything less than great also comes to you privately, so you can make it right.',
    art: { head: 'Dana · after her visit', chat: [
      { who: 'us', t: 'Hi Dana, hope your visit with Maya at Glow Studio was a hit! A quick Google review would mean the world to us: g.page/r/glow Or reply 1-5 to rate Maya.' },
      { who: 'them', t: '5! She was amazing' },
      { who: 'ok', t: 'New 5-star Google review' },
    ] },
    rows: [
      { h: 'One short text after checkout', p: 'Curivanta reads your SalonUltimate or Square checkouts and texts clients about an hour later. You choose how many go out a day, and clients are picked at random across the day.',
        points: ['Texts go out only between 9 AM and 8 PM', 'Nobody is asked more than once in 90 days', 'Your wording, or ours'],
        art: { head: 'Review requests today', list: [['green', 'Priya · replied 5', '3:40 PM'], ['amber', 'Mark · sent', '2:15 PM'], ['green', 'Dana · left a Google review', '1:05 PM'], ['red', 'Lena · rated 3, with a note', '11:30 AM']] } },
      { h: 'Every request includes your Google link', p: 'No review gating: happy client or not, the request has your Google link, as Google\'s rules require. Clients can also reply 1 to 5. A low rating or a note comes straight to you, so you can make it right.',
        points: ['Ratings by stylist, so you see who clients love', 'A notification when someone needs a call back'],
        art: { head: 'By stylist · this month', tiles: [['4.9 ★', 'Maya, 21 ratings'], ['4.9 ★', 'Jordan, 15 ratings'], ['4.7 ★', 'Aisha, 12 ratings'], ['23', 'new Google reviews']] } },
      { h: 'A reply ready for every new Google review', p: 'Connect your Google Business Profile and new reviews show up in your app with a reply drafted in your salon\'s voice. Approve it with one tap and it posts on Google.',
        art: { head: 'New Google review', chat: [{ who: 'them', t: '★★★★★ "Booked by text in two minutes. Maya is the best!"' }, { who: 'us', t: 'Thank you, Dana! Maya loved having you. See you next time!' }, { who: 'ok', t: 'Reply ready to approve' }] } },
    ],
    facts: [[I.star, 'No gating', 'Every request has your Google link'], [I.chart, 'By stylist', 'Ratings and reviews per stylist'], [I.reply, 'One tap', 'Approve a drafted Google reply'], [I.cal, 'You set the pace', 'How many requests a day']],
    faq: [
      ['Which booking systems does it read checkouts from?', 'SalonUltimate and Square. Each checkout is saved to the client\'s page and can start a review request.'],
      ['Will clients get asked more than once?', 'No more than once in 90 days, whatever they book.'],
      ['Can I change the text?', 'Yes. Edit the wording any time, or ask for a new draft. The first text a client gets from you ends with "Reply STOP to opt out"; later ones leave it off.'],
    ],
    next: [['/new/missed-calls', 'Missed calls and texts'], ['/new/owner-app', 'Owner app']],
  },

  phone: {
    title: 'A phone system for salons: calls in the app, answered when you can\'t | Curivanta',
    h1: 'Answer from anywhere. Never send a caller to voicemail again.',
    lede: 'Call clients from the app with your salon\'s number, put calls on hold or transfer them, and on Pro, have calls nobody picks up answered and booked for you.',
    plan: 'Calls answered for you: Pro, or 30 minutes a month on Light',
    art: { head: 'Glow Studio', sub: 'On a call · 7:42 PM, after hours', done: 'Booked Sat 10:00 · confirmation texted', call: [
      { who: 'ai', t: "Hi, thanks for calling Glow Studio. I'm the salon's automated assistant, and this call is recorded and transcribed. How can I help?" },
      { who: 'caller', t: 'Can Maya do a trim Saturday morning?' },
      { who: 'ai', t: 'She has ten or eleven thirty. Which works?' },
      { who: 'caller', t: 'Ten, please.' },
    ] },
    rows: [
      { h: 'Your salon line, in the app', p: 'Call clients from your phone or computer and they see your salon\'s number. Incoming calls ring whoever has the Phone screen open. On Android, calls can ring the app even when it\'s closed.',
        points: ['Hold, and pick up from another phone', 'Transfer to a team member or a cell', 'Your salon name on caller ID'],
        art: { head: 'Phone', list: [['green', 'Dana · outgoing, 3 min', '4:10 PM'], ['amber', 'On hold for Jess', '3:58 PM'], ['blue', 'Transferred to the back desk', '3:20 PM'], ['red', 'Missed · texted back', '2:14 PM']] } },
      { h: 'Calls nobody picks up, answered', p: 'On Pro, the assistant answers when nobody can. It says up front that it\'s automated and the call is recorded, answers questions from your menu, and books real open times.',
        points: ['Knows returning clients and their usual', 'Takes a message, or asks you to call back', 'Switches to Spanish when the caller does', 'On a bad line, offers to finish by text'],
        art: { head: 'Call with Dana', sub: 'Answered by the AI receptionist · 2 min', ended: '2:04', done: 'Booked a trim with Maya, Sat 10:00', call: [
          { who: 'caller', t: 'Is there parking near you?' },
          { who: 'ai', t: 'Yes, there is free parking right behind the salon.' },
        ] } },
      { h: 'You choose when it answers', p: 'Always, or only when you\'re closed. Every call it took is in your app: play the recording or read what was said. Callers can ask for a person or leave a voicemail any time.',
        art: { head: 'Calls and texts settings', tiles: [['Always', 'or only when closed'], ['200 min', 'a month on Pro'], ['30 min', 'a month on Light'], ['$10', 'per 50 more on Pro']] } },
    ],
    facts: [[I.phone, 'Your number', 'Calls show your salon number'], [I.headset, 'Answered', 'On Pro, 200 minutes a month'], [I.chat, 'Recorded', 'With a transcript in the app'], [I.user, 'Hold and transfer', 'On every plan']],
    faq: [
      ['Does an AI answer my phone?', 'On Pro, yes, when nobody picks up. It says it\'s the salon\'s automated assistant and that the call is recorded and transcribed. On Starter and Light, callers hear your greeting, can leave a voicemail, and get a text right away. Light includes 30 minutes a month to try the assistant.'],
      ['How many calls does Pro cover?', '200 minutes a month, around 100 typical booking calls. Extra minutes are $10 per 50, and we let you know at 80%.'],
      ['Can I move my existing number to Curivanta?', 'Not yet. For now, salons keep their number and forward the calls they miss to Curivanta.'],
    ],
    next: [['/new/missed-calls', 'Missed calls and texts'], ['/new/owner-app', 'Owner app']],
  },

  'owner-app': {
    title: 'The salon owner app: calls, bookings and reviews on one screen | Curivanta',
    h1: 'Know how your salon did, any time.',
    lede: 'Calls, bookings and reviews on one screen, on your phone or computer. What needs you is at the top, and a short email lands every morning.',
    art: { head: 'Today at Glow Studio', tiles: [['21', 'calls'], ['7', 'missed, 6 texted back'], ['6', 'booked · $540'], ['2', 'new Google reviews']] },
    rows: [
      { h: 'Home: today, this week or this month', p: 'Every number compared with the same stretch before, a chart that follows the dates you pick, and each stylist\'s ratings and reviews.',
        points: ['"Needs you" first: conversations waiting and low ratings', '"Since you started": what Curivanta has done for you so far'],
        art: { head: 'Needs you', list: [['amber', 'Kim B. asked for a call back', '12m'], ['amber', 'Refund question from Lena', '38m'], ['red', 'Rated 3 with a note', '1h']] } },
      { h: 'One page per client', p: 'Every call, text, visit and review for each client, in order. Play a voicemail or a call recording, read the transcript, and reply from the same page.',
        art: { head: 'Sarah L. · 9 visits', list: [['blue', 'Texted: "Anything Saturday?"', '8:47 PM'], ['green', 'Booked Sat 10:00, root touch-up', '8:49 PM'], ['amber', 'Rated Jess 5 ★', 'Oct 4'], ['gray', 'Missed call, texted back', 'Sep 12']] } },
      { h: 'One notification, not five', p: 'Only what needs you, on your phone: hand-offs, voicemails, new reviews and bookings. Quiet from 9 PM to 8 AM. Plus a morning email with yesterday\'s numbers.',
        points: ['Team logins: managers run the day, front desk handles clients', 'Billing and plan settings stay with you', 'One login for several salons'],
        art: { head: 'Morning email · 8:00 AM', tiles: [['14', 'calls, ▲ 3'], ['5', 'booked, ▲ 2'], ['4', 'reviews'], ['4.9 ★', 'average rating']] } },
    ],
    facts: [[I.chart, 'Home', 'Numbers vs before, by stylist'], [I.user, 'Clients', 'Every call, text, visit, review'], [I.phone, 'Phone and computer', 'Same app everywhere'], [I.bolt, 'Morning email', 'Yesterday at a glance']],
    faq: [
      ['Is there a phone app?', 'Yes, on Android. On iPhone, add Curivanta to your Home Screen from Safari to get notifications; the iPhone app is on its way.'],
      ['Can my front desk use it?', 'Yes, on Light and Pro. Front-desk logins see clients, messages, calls and reviews, but not usage, billing or settings. Replies show who sent them.'],
    ],
    next: [['/new/reviews', 'Reviews'], ['/new/phone', 'Phone']],
    extra: <Anywhere />,
  },

  salons: {
    title: 'Curivanta for salons with a team | Curivanta',
    h1: 'For salons where everyone is busy with a client.',
    lede: 'Keep your salon number. Curivanta catches the calls your team can\'t get to, books them into SalonUltimate or Square, and asks clients for reviews.',
    plan: 'Light $99/month · Pro $149/month',
    art: { head: 'Today at Glow Studio', list: [['red', 'Missed: (949) 555-0142 · texted back', '2m'], ['green', 'Booked Dana, Sat 10:00 with Maya', '4m'], ['amber', 'Review request sent to Priya', '12m'], ['green', 'New 5-star Google review', '25m']] },
    rows: [
      { h: 'Keep your number', p: 'You forward the calls you miss to Curivanta, and can undo it any time. Your clients keep calling the number they know.',
        art: { head: 'Missed call', chat: [{ who: 'note', t: 'Forwarded from your salon line' }, { who: 'us', t: "Hi, it's Glow Studio. Sorry we missed your call! How can we help?" }] } },
      { h: 'The whole team, one app', p: 'Managers run the salon day to day, the front desk handles clients, and billing stays with you. Replies show who sent them.',
        points: ['Ratings and reviews by stylist', 'Call from the app with your salon number, hold and transfer'],
        art: { head: 'By stylist · this month', tiles: [['4.9 ★', 'Maya'], ['4.9 ★', 'Jordan'], ['4.7 ★', 'Aisha'], ['46', 'booked by Curivanta']] } },
    ],
    facts: [[I.phone, 'Caller ID', 'Your salon name shows when you call'], [I.user, 'Team logins', 'Roles for managers and front desk'], [I.cal, 'Books in', 'SalonUltimate and Square'], [I.headset, 'Pro', 'Calls answered for you, 200 minutes a month']],
    faq: [['Light or Pro?', 'Light covers texting, booking and reviews, with 30 minutes a month of calls answered for you. Pro includes 200 minutes a month of calls answered for you, about 100 calls, then $10 per 50 more minutes.']],
    next: [['/new/pricing', 'Pricing'], ['/new/locations', 'Several locations']],
  },

  solo: {
    title: 'Curivanta for solo stylists and booth renters | Curivanta',
    h1: 'Take your personal number off your business cards.',
    lede: 'Starter gives you a separate business number that rings your cell during your hours, texts back the calls you miss, and books clients while you work.',
    plan: 'Starter $49/month',
    art: { head: 'Business number · after hours', chat: [{ who: 'note', t: 'Missed call · 9:40 PM' }, { who: 'us', t: "Hi, it's Ana Hair. Sorry I missed you! Want to book? Here's my calendar, or tell me what you need." }, { who: 'them', t: 'Do you do curly cuts?' }] },
    rows: [
      { h: 'Your cell stays yours', p: 'Calls to your business number ring your cell during your hours (press 1 to answer) and the app. After hours, callers get your greeting and voicemail, and your phone stays quiet.',
        points: ['Text and call clients from the app with your business number', 'Work lives in one app, not mixed in with family texts'],
        art: { head: 'Your hours', tiles: [['9-6', 'calls ring your cell'], ['After', 'greeting and voicemail'], ['1 min', 'text back'], ['$49', 'a month']] } },
      { h: 'Books while you\'re mid-cut', p: 'Clients text questions and book real open times. On SalonUltimate or Square it books straight in; otherwise it sends your booking link.',
        art: { head: 'Client · text', chat: [{ who: 'them', t: 'Do you do curly cuts?' }, { who: 'us', t: 'Yes! Curly cuts are $85. I have Thursday at 2:00 or Friday at 11:00.' }] } },
    ],
    facts: [[I.phone, 'Business number', 'Rings your cell in your hours'], [I.missed, 'Text-back', 'For missed calls'], [I.cal, 'Booking', 'By text, into your calendar'], [I.tag, 'No EIN needed', 'Register as a sole proprietor']],
    faq: [['Do I need an EIN?', 'No. Solo stylists can register as a sole proprietor: you reply YES to one text from the carriers.'], ['Can I move up later?', 'Yes. Move to Light or Pro any time from Billing.']],
    next: [['/new/pricing', 'Pricing'], ['/new/missed-calls', 'Missed calls and texts']],
  },

  locations: {
    title: 'Curivanta for salons with several locations | Curivanta',
    h1: 'Several salons, one login.',
    lede: 'Each location gets its own number, setup and plan. You switch between them in one app, and notifications tell you which salon they\'re for.',
    plan: 'Priced per location',
    art: { head: 'Your salons', list: [['green', 'Downtown · 6 booked today', 'Live'], ['green', 'Northside · 4 booked today', 'Live'], ['amber', 'Westlake · texting goes live soon', 'Setup']] },
    rows: [
      { h: 'Every location on its own, under one login', p: 'Each salon keeps its own number, services, stylists, openings and reviews. Switch salons from the app, and get every location\'s notifications on one phone, titled with the salon\'s name.',
        art: { head: 'Notifications', list: [['blue', 'Downtown: Kim asked for a call back', '2m'], ['green', 'Northside: New 5-star Google review', '9m'], ['blue', 'Downtown: Booked Dana, Sat 10:00', '14m']] } },
      { h: 'Franchise sites work too', p: 'On a SalonUltimate franchise site with many stores, Curivanta finds each location by store number and address, so bookings and checkouts are always that location\'s.',
        art: { head: 'SalonUltimate', tiles: [['Store 3', 'matched by number'], ['ZIP', 'and phone'], ['Own', 'openings'], ['Own', 'checkouts']] } },
    ],
    facts: [[I.user, 'One login', 'Switch salons in the app'], [I.phone, 'Own number', 'Per location'], [I.chart, 'Own numbers', 'Home per salon'], [I.cal, 'Franchise ready', 'Store matching']],
    faq: [['How is it billed?', 'Per location: each salon has its own plan, so a busy location can be on Pro and a quiet one on Light.']],
    next: [['/new/pricing', 'Pricing'], ['/new/salons', 'Salons with a team']],
  },
};

export const ProductPage = ({ page }: { page: PageDef }) => {
  useSamplePage(page.title);
  return (
    <div className="nx">
      <NxNav />
      <main>
        <section className="nx-hero nx-hero-sm">
          <div className="nx-wrap nx-phero">
            <div>
              {page.plan && <p className="nx-plan">{page.plan}</p>}
              <h1>{page.h1}</h1>
              <p className="nx-lede">{page.lede}</p>
              <div className="nx-ctas left">
                <a className="nx-btn" href={START_URL}>Get started</a>
                <Link className="nx-btn nx-btn-ghost" to="/new/pricing">See pricing</Link>
              </div>
            </div>
            <div className="nx-phero-art"><ArtCard art={page.art} /></div>
          </div>
        </section>

        {page.extra}

        <section className="nx-sec">
          <div className="nx-wrap">
            {page.rows.map((r, i) => (
              <div className={'nx-frow' + (i % 2 ? ' flip' : '')} key={r.h}>
                <div>
                  <h2>{r.h}</h2>
                  <p>{r.p}</p>
                  {r.points && <ul className="nx-checks">{r.points.map(p => <li key={p}>{I.check}{p}</li>)}</ul>}
                </div>
                <div className="nx-frow-art"><ArtCard art={r.art} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="nx-wrap">
          <div className="nx-facts">
            {page.facts.map(([icon, h, p]) => <div key={h}><span className="nx-ic">{icon}</span><b>{h}</b><span>{p}</span></div>)}
          </div>
        </section>

        <section className="nx-sec">
          <div className="nx-wrap nx-faq">
            <div><h2>Questions</h2><p>Anything else: <a href="mailto:hello@curivanta.com">hello@curivanta.com</a></p>
              <p className="nx-seealso">See also: {page.next.map(([to, label], i) => <span key={to}>{i > 0 && ' · '}<Link to={to}>{label}</Link></span>)}</p></div>
            <div>{page.faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
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

const NextPage = () => {
  const { slug = '' } = useParams();
  const page = PAGES[slug];
  return page ? <ProductPage page={page} /> : <NotFound />;
};

export default NextPage;
