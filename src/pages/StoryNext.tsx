import { NxFoot, NxNav, Ph, START_URL, useSamplePage } from './next/Chrome';
import './next/next.css';

// Sample "Our story" page (/new/story, 2026-11-21). The founder isn't named or pictured on the site (2026-11-22); the quote and
// story are drafts for the owner to rewrite in his own words.

const PROMISES: [string, string][] = [
  ['Prices on the page', 'No demo to find out what it costs. Three plans, month to month.'],
  ['No review gating', 'Every review request includes your Google link, happy client or not, as Google\'s rules require.'],
  ['Texts that play by the rules', 'Registered with the phone carriers. STOP always works.'],
  ['Your data stays yours', 'Each salon\'s data is kept separate, and logins to your booking and Google accounts are encrypted.'],
  ['A person answers', 'Email hello@curivanta.com and the people who built it reply.'],
  ['Run in our own salons first', 'Every feature is used at our own front desks before it reaches yours.'],
];

const StoryNext = () => {
  useSamplePage('Our story | Curivanta');
  return (
    <div className="nx">
      <NxNav />
      <main>
        <section className="nx-hero nx-hero-sm">
          <div className="nx-wrap nx-story">
            <div>
              <h1>Built by a salon owner.</h1>
              <p className="nx-lede">Curivanta started at our own front desk, with a phone that kept ringing while everyone was busy with a client.</p>
            </div>
            <div className="nx-try light" id="demo-line">
              <p className="nx-try-k">Hear it for yourself</p>
              <p className="nx-try-h">Call our demo salon</p>
              <p className="nx-try-n"><Ph>(xxx) xxx-xxxx</Ph></p>
              <p className="nx-try-s">The AI answers in its natural voice. Ask about prices, or try to book. Hang up instead, and you'll get a text back.</p>
            </div>
          </div>
        </section>

        <section className="nx-sec">
          <div className="nx-wrap nx-prose">
            <p>I own salons, and I can't stand behind every front desk. On busy days the phone rang while every stylist was with a client, and those callers didn't leave a voicemail. They booked somewhere else.</p>
            <p>The tools I tried were built for every kind of business at once: menus inside menus, prices hidden behind a demo, and nothing that knew what a stylist or a root touch-up was.</p>
            <p>So I built the front desk I wanted. It texts back the calls we miss, books clients into our real calendar, and asks clients for reviews. It runs in my own salons every day, and our Google rating went from 4.4 to 4.5 in the first 8 days.</p>
            <p>Now it's ready for yours.</p>
            <p className="nx-who dark"><b>Salon owner</b> · Founder, Curivanta</p>
          </div>
        </section>

        <section className="nx-sec nx-soft">
          <div className="nx-wrap">
            <div className="nx-head"><h2>What we promise</h2></div>
            <div className="nx-promises">{PROMISES.map(([h, p]) => <div key={h}><h3>{h}</h3><p>{p}</p></div>)}</div>
          </div>
        </section>

        <section className="nx-final">
          <div className="nx-wrap nx-final-in">
            <h2>Try it at your salon.</h2>
            <p>Questions first? Email <a href="mailto:hello@curivanta.com">hello@curivanta.com</a>. A real person answers.</p>
            <div className="nx-ctas"><a className="nx-btn" href={START_URL}>Get started</a></div>
          </div>
        </section>
      </main>
      <NxFoot />
    </div>
  );
};

export default StoryNext;
