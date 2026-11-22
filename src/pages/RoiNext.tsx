import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { I, NxFoot, NxNav, START_URL, useSamplePage } from './next/Chrome';
import './next/next.css';

// Sample ROI page (/new/roi, 2026-11-21): what missed calls cost a salon, what winning some back is worth
// against each plan, and a front desk hire compared with Curivanta. Every number is the owner's own input;
// the math is written out under the result. Inputs live in the link so a result can be shared.

const PLANS = [{ name: 'Starter', price: 49 }, { name: 'Light', price: 99 }, { name: 'Pro', price: 149 }];
const WEEKS = 4.33;
const DEFAULTS = { calls: 15, ticket: 65, book: 40, back: 30, visits: 1, hours: 30, pay: 18 };
type K = keyof typeof DEFAULTS;

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

const readParams = () => {
  const q = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const v = { ...DEFAULTS };
  (Object.keys(v) as K[]).forEach(k => { const n = Number(q.get(k)); if (q.has(k) && Number.isFinite(n) && n > 0) v[k] = n; });
  return v;
};

const Slider = ({ id, label, hint, value, min, max, step = 1, fmt, onChange }:
  { id: string; label: string; hint?: string; value: number; min: number; max: number; step?: number; fmt: (n: number) => string; onChange: (n: number) => void }) => (
  <div className="nx-field">
    <label htmlFor={id}><span>{label}</span><output htmlFor={id}>{fmt(value)}</output></label>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
    {hint && <small>{hint}</small>}
  </div>
);

const RoiNext = () => {
  useSamplePage('What missed calls cost your salon | Curivanta');
  const [v, setV] = useState(DEFAULTS);
  useEffect(() => { setV(readParams()); }, []);
  const set = (k: K) => (n: number) => setV(x => ({ ...x, [k]: n }));

  // Keep the link in step with the inputs, so it can be shared.
  useEffect(() => {
    const q = new URLSearchParams(Object.entries(v).map(([k, n]) => [k, String(n)]));
    window.history.replaceState(null, '', '?' + q.toString());
  }, [v]);
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } };

  const r = useMemo(() => {
    const lostBookings = v.calls * (v.book / 100) * WEEKS;           // a month
    const lost = lostBookings * v.ticket;
    const wonBookings = lostBookings * (v.back / 100);
    const won = wonBookings * v.ticket;
    const wonYear = won * 12 * v.visits;
    const desk = v.hours * v.pay * WEEKS;
    return { lostBookings, lost, wonBookings, won, wonYear, desk };
  }, [v]);

  return (
    <div className="nx">
      <NxNav />
      <main>
        <section className="nx-hero nx-hero-sm">
          <div className="nx-wrap nx-hero-in">
            <h1>What do missed calls cost your salon?</h1>
            <p className="nx-lede">Move the sliders to match your salon. Everything is your own numbers, and the math is shown under the result.</p>
          </div>
        </section>

        <section className="nx-wrap">
          <div className="nx-calc">
            <div className="nx-calc-in">
              <h2>Your salon</h2>
              <Slider id="calls" label="Missed calls a week" hint="Not sure? Your phone company's call log, or a busy Saturday times two." value={v.calls} min={2} max={80} fmt={n => String(n)} onChange={set('calls')} />
              <Slider id="ticket" label="Average ticket" value={v.ticket} min={20} max={300} step={5} fmt={money} onChange={set('ticket')} />
              <Slider id="book" label="Callers who wanted to book" hint="The rest were questions, sales calls and wrong numbers." value={v.book} min={10} max={90} step={5} fmt={n => n + '%'} onChange={set('book')} />
              <Slider id="back" label="Bookings you'd win back by text" hint="Your guess. Some callers will already have booked elsewhere." value={v.back} min={10} max={80} step={5} fmt={n => n + '%'} onChange={set('back')} />
              <Slider id="visits" label="Visits a year from a new client" hint="Leave at 1 to count only the first visit." value={v.visits} min={1} max={12} fmt={n => String(n)} onChange={set('visits')} />
            </div>
            <div className="nx-calc-out">
              <p className="nx-out-l">Missed calls are costing you about</p>
              <p className="nx-out-big">{money(r.lost)}<small>/month</small></p>
              <p className="nx-out-s">{Math.round(r.lostBookings)} bookings a month that go somewhere else.</p>
              <div className="nx-out-won">
                <p className="nx-out-l">Winning back {v.back}% by text is worth</p>
                <p className="nx-out-mid">{money(r.won)}<small>/month</small></p>
                {v.visits > 1 && <p className="nx-out-s">{money(r.wonYear)} a year, with {v.visits} visits a year from each.</p>}
              </div>
              <ul className="nx-payback">
                {PLANS.map(p => {
                  const need = Math.max(1, Math.ceil(p.price / v.ticket));
                  return <li key={p.name}><span><b>{p.name}</b> {money(p.price)}/month</span><span>pays for itself after <b>{need} booking{need > 1 ? 's' : ''}</b> a month</span></li>;
                })}
              </ul>
              <div className="nx-out-cta">
                <a className="nx-btn nx-btn-light" href={START_URL}>Get started</a>
                <button className="nx-copy-link" onClick={copy}>{copied ? 'Link copied' : 'Copy link to this result'}</button>
              </div>
            </div>
          </div>
          <details className="nx-math">
            <summary>How we worked it out</summary>
            <p>{v.calls} missed calls a week × {v.book}% who wanted to book × 4.33 weeks = <b>{Math.round(r.lostBookings)} lost bookings a month</b>. Times your {money(v.ticket)} average ticket = <b>{money(r.lost)}</b>.</p>
            <p>Winning back {v.back}% of those by text = {r.wonBookings.toFixed(1)} bookings × {money(v.ticket)} = <b>{money(r.won)} a month</b>.{v.visits > 1 && <> Over a year, with {v.visits} visits from each client: {money(r.won)} × 12 × {v.visits} = <b>{money(r.wonYear)}</b>.</>}</p>
            <p>Visits a year: a new client who comes back is worth more than one visit. Leave it at 1 to count only the first booking; raise it to how often a regular comes in (every 6 weeks is about 8 a year).</p>
            <p>A plan pays for itself when the bookings it wins back cover its price: plan price ÷ average ticket, rounded up. We don't add your rebooking regulars, tips or retail, so the real number is usually higher.</p>
          </details>
        </section>

        <section className="nx-sec">
          <div className="nx-wrap">
            <div className="nx-head"><h2>Or compare it with hiring someone for the desk</h2><p>A receptionist is great when they're there. Curivanta covers every hour they aren't.</p></div>
            <div className="nx-desk">
              <div className="nx-calc-in">
                <Slider id="hours" label="Front desk hours a week" value={v.hours} min={10} max={60} step={5} fmt={n => String(n)} onChange={set('hours')} />
                <Slider id="pay" label="Hourly pay" hint="The US median for receptionists is about $18 an hour (Bureau of Labor Statistics), before payroll taxes." value={v.pay} min={12} max={30} fmt={money} onChange={set('pay')} />
              </div>
              <div className="nx-desk-out">
                <div><small>A front desk hire</small><b>{money(Math.round(r.desk / 10) * 10)}</b><span>a month, for {v.hours} hours a week</span></div>
                <div className="main"><small>Curivanta Pro</small><b>$149</b><span>a month, every hour of every day</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="nx-final">
          <div className="nx-wrap nx-final-in">
            <h2>Catch the next missed call.</h2>
            <p>Set up in about 15 minutes. Your monthly plan starts only when texting goes live.</p>
            <div className="nx-ctas"><a className="nx-btn" href={START_URL}>Get started</a><Link className="nx-btn nx-btn-ghost" to="/new#pricing">See plans {I.arrow}</Link></div>
          </div>
        </section>
      </main>
      <NxFoot />
    </div>
  );
};

export default RoiNext;
