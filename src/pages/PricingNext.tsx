import { Link } from 'react-router-dom';
import { I, NxFoot, NxNav, START_URL, useSamplePage } from './next/Chrome';
import './next/next.css';

// Sample pricing page (/new/pricing, 2026-11-21). Plan details as on the live homepage (Nov 21 plans:
// shared allowance 700 / 1,300 / 1,800; Light 30 AI minutes then $10 per 40 up to a limit; Pro 200 then $10 per 50).

const PLANS = [
  { key: 'starter', name: 'Starter', for: 'For solo stylists and booth renters', price: 49, cta: 'Start with Starter', url: START_URL + '?plan=starter',
    allow: '700 texts and call minutes a month, any mix.',
    items: ['A separate business number, so your cell stays private', 'Calls ring your cell and the app during your hours', 'Call clients from the app, hold and transfer', 'Missed-call text-back, with voicemails as text', 'Your greeting in a natural voice, or your own recording', 'Texting that answers questions and books into SalonUltimate or Square, or sends your booking link', 'English and Spanish', 'Review requests: 3 a day', 'Google review replies drafted for you to approve', 'Owner app with phone alerts and a morning email'] },
  { key: 'light', name: 'Light', for: 'For salons with a team', price: 99, cta: 'Start with Light', url: START_URL, main: true,
    allow: '1,300 texts and call minutes a month, any mix, plus 30 minutes of calls answered for you.',
    items: ['Everything in Starter, and you keep your salon number: missed calls forward to Curivanta', 'Books straight into SalonUltimate or Square, and can let clients move or cancel', 'Review requests: 10 a day', 'Team logins for managers and front desk; billing stays with you', 'Your salon name on caller ID', 'Ratings and reviews by stylist', 'One login for several salons', '30 minutes a month of calls answered for you, then more only up to a limit you choose'] },
  { key: 'pro', name: 'Pro', for: 'For salons that want calls answered', price: 149, cta: 'Start with Pro', url: START_URL + '?plan=pro',
    allow: '1,800 texts and call minutes a month, any mix, plus 200 minutes of calls answered for you.',
    items: ['Everything in Light, plus:', 'Calls nobody picks up answered: 200 minutes a month, about 100 calls', 'Answers questions, books, moves and cancels, and texts a confirmation', 'Knows returning clients and what they usually book', 'Takes messages, or asks you to call back', 'English or Spanish, and offers to finish by text on a bad line', 'Calls it answers are recorded, with a transcript in your app', 'You choose when it answers: always, or only when closed', 'Review requests: 20 a day'] },
];

const ROWS: [string, string, string, string][] = [
  ['Monthly price', '$49', '$99', '$149'],
  ['Texts and call minutes a month (shared)', '700', '1,300', '1,800'],
  ['Calls answered for you', '–', '30 min', '200 min'],
  ['Extra texts or call minutes', '$10 per 250', '$10 per 250', '$10 per 250'],
  ['Extra minutes of calls answered', '–', '$10 per 40, up to a limit you pick ($10 to $50 a month)', '$10 per 50'],
  ['Phone number', 'New business number', 'Keep yours', 'Keep yours'],
  ['Missed-call text-back', '✓', '✓', '✓'],
  ['Texting and booking', '✓', '✓', '✓'],
  ['Review requests a day (you can change it)', '3', '10', '20'],
  ['Google review replies', '✓', '✓', '✓'],
  ['Call from the app, hold and transfer', '✓', '✓', '✓'],
  ['Team logins', '–', '✓', '✓'],
  ['Ratings by stylist', '–', '✓', '✓'],
  ['Several salons, one login', '–', '✓', '✓'],
];

const FAQ: [string, string][] = [
  ['When does my monthly plan start?', 'When texting goes live, usually a few days after you sign up, once the phone carriers approve your number. The $49 setup paid at sign-up is credited to your first month.'],
  ['What counts as a text or a call minute?', 'Texts are the messages Curivanta sends for you: replies, text-backs, confirmations and review requests. Call minutes are the time calls spend on your Curivanta number. Calls you pick up on your own salon phone don\'t count. Texts and minutes share one allowance, and unused ones don\'t carry over.'],
  ['What if I go over?', 'Extra texts or call minutes are $10 per 250, added to your next bill. We email you at 80%, so it\'s never a surprise.'],
  ['Can I change plans?', 'Move up any time from Billing in the app; the difference is prorated. To move down, email us.'],
  ['How do I cancel?', 'From Billing in the app. It ends at the end of the month you\'ve paid for. No contract.'],
];

const PricingNext = () => {
  useSamplePage('Pricing | Curivanta');
  return (
    <div className="nx">
      <NxNav />
      <main>
        <section className="nx-hero nx-hero-sm">
          <div className="nx-wrap nx-hero-in">
            <h1>Simple plans. Prices right here.</h1>
            <p className="nx-lede nx-lede-wide">Per location, month to month. $49 to get started, credited to your first month.<br />Your monthly plan starts only when texting goes live.</p>
          </div>
        </section>

        <section className="nx-wrap">
          <div className="nx-prices full">
            {PLANS.map(p => (
              <div className={'nx-price' + (p.main ? ' main' : '')} key={p.key}>
                {p.main && <span className="nx-tag">Most salons</span>}
                <h3>{p.name}</h3><p className="nx-for">{p.for}</p>
                <div className="nx-amt">${p.price}<small>/month</small></div>
                <p className="nx-allow">{p.allow}</p>
                <a className={'nx-btn' + (p.main ? '' : ' nx-btn-ghost')} href={p.url}>{p.cta}</a>
                <ul className="nx-checks sm">{p.items.map(x => <li key={x}>{I.check}{x}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="nx-center"><Link to="/new/roi">Not sure? See what missed calls cost your salon →</Link></p>
        </section>

        <section className="nx-sec">
          <div className="nx-wrap">
            <div className="nx-head"><h2>Compare plans</h2></div>
            <div className="nx-tablewrap">
              <table className="nx-compare">
                <thead><tr><th></th><th>Starter</th><th className="main">Light</th><th>Pro</th></tr></thead>
                <tbody>{ROWS.map(([l, a, b, c]) => <tr key={l}><td>{l}</td><td>{a}</td><td className="main">{b}</td><td>{c}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="nx-sec nx-soft">
          <div className="nx-wrap nx-faq">
            <div><h2>Billing questions</h2><p>Anything else: <a href="mailto:hello@curivanta.com">hello@curivanta.com</a></p></div>
            <div>{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
          </div>
        </section>

        <section className="nx-final">
          <div className="nx-wrap nx-final-in">
            <h2>Start with the plan that fits. Change any time.</h2>
            <p>Set up in about 15 minutes. Your monthly plan starts only when texting goes live.</p>
            <div className="nx-ctas"><a className="nx-btn" href={START_URL}>Get started</a><a className="nx-btn nx-btn-ghost" href="mailto:hello@curivanta.com">Email us</a></div>
          </div>
        </section>
      </main>
      <NxFoot />
    </div>
  );
};

export default PricingNext;
