import { I } from './Chrome';

// The salon's front desk computer: the booking software on the left, Curivanta in a narrow window on the right,
// with an incoming call. Used on the Owner app page (moved off the homepage 2026-11-21).

const BOOK: [number, number, number, string, string][] = [   // stylist column, start hour, length (hours), client, color
  [0, 9, 1.5, 'Sarah L. · Root touch-up', 'b'], [0, 11, 1, 'Dana K. · Cut and color', 'g'], [0, 13, 2, 'Priya S. · Balayage', 'p'],
  [1, 9.5, .75, 'Mark D. · Men\'s cut', 'g'], [1, 10.5, .75, 'Ethan B. · Men\'s cut', 'b'], [1, 12, 1, 'Liam C. · Fade', 'a'], [1, 14, .75, 'Noah G. · Men\'s cut', 'g'],
  [2, 10, 1, 'Olivia C. · Blowout', 'a'], [2, 11.5, 2, 'Sofia M. · Color', 'p'], [2, 14, 1, 'Ava P. · Women\'s cut', 'b'],
  [3, 9, 1, 'Zoe L. · Women\'s cut', 'p'], [3, 10.5, 1.5, 'Chloe H. · Highlights', 'g'], [3, 13, .75, 'Grace W. · Blowout', 'b'],
];

// The salon's front desk computer: the booking software on the left, Curivanta in a narrow window on the right.
const FrontDesk = () => (
  <div className="nx-monitor">
    <div className="nx-mscreen">
      <div className="nx-book">
        <div className="nx-book-bar"><b>Appointment book</b><span>Saturday</span></div>
        <div className="nx-book-grid">
          <div className="nx-book-times">{[9, 10, 11, 12, 1, 2].map(h => <span key={h}>{h}:00</span>)}</div>
          {['Maya', 'Jordan', 'Aisha', 'Jess'].map((n, c) => (
            <div className="nx-book-col" key={n}><b>{n}</b>
              {BOOK.filter(x => x[0] === c).map(([, st, len, who, col]) => (
                <i key={who} className={'c-' + col} style={{ top: `calc(28px + ${(st - 9) * 16.66}%)`, height: `${len * 16.66 - 1}%` }}>{who}</i>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="nx-mwin">
        <div className="nx-mwin-bar"><i /><i /><i /></div>
        <img src="/shots/app-client.webp" alt="Curivanta in a narrow window beside the booking software" loading="lazy" />
        <div className="nx-ring"><span className="nx-ring-dot">{I.phone}</span><div><b>Incoming call</b><small>Dana Kim</small></div><em aria-label="Answer">{I.phone}</em></div>
      </div>
    </div>
    <div className="nx-mstand" />
  </div>
);

export const DeskRow = () => (
  <div className="nx-deskrow">
              <FrontDesk />
              <div className="nx-deskcopy">
                <h3>Right next to your booking software.</h3>
                <div><b>Make it smaller</b><p>Keep Curivanta in a narrow window beside your appointment book on the front desk computer. It fits any size.</p></div>
                <div><b>Make it bigger</b><p>Drag it full screen to see the day's calls, bookings and reviews side by side.</p></div>
                <div><b>Answer at the desk</b><p>Calls ring the computer while the Phone screen is open. Pick up with a headset, put callers on hold or transfer them.</p></div>
              </div>
            </div>
);

// "Use Curivanta anywhere": the real app on a computer and a phone, three device claims, then the front desk.
export const Anywhere = () => (
  <section className="nx-wrap nx-anywhere">
    <div className="nx-anywhere-in">
      <div className="nx-head">
        <h2>Use Curivanta anywhere.</h2>
        <p>On the front desk computer, on your phone between clients, or on the couch at night. Shown here with a sample salon.</p>
      </div>
      <div className="nx-shotstage">
        <div className="nx-browser">
          <div className="nx-browser-bar"><i /><i /><i /><span>app.curivanta.com</span></div>
          <img src="/shots/app-home.webp" alt="Curivanta Home on a computer: this week's calls, missed calls texted back, bookings, review requests and what needs you" width={1800} height={1250} loading="lazy" />
        </div>
        <div className="nx-handset"><img src="/shots/app-client.webp" alt="Curivanta on a phone: a client's page with the text conversation where she booked" width={720} height={1555} loading="lazy" /></div>
      </div>
      <div className="nx-devices">
        <div><span className="nx-dev-ic">{I.monitor}</span><h3>On your computer</h3><p>Open app.curivanta.com in any web browser. Big screens get more room: everything side by side, the menu on the left. Call clients right from the computer.</p></div>
        <div><span className="nx-dev-ic">{I.mobile}</span><h3>On your phone</h3><p>The Android app rings for calls even when it's closed, and sends one notification when someone needs you. On iPhone, add it to your Home Screen. The iPhone app is on its way.</p></div>
        <div><span className="nx-dev-ic">{I.desk}</span><h3>At the front desk</h3><p>Everyone gets their own login. Calls ring whoever has the Phone screen open, and replies show who sent them.</p></div>
      </div>
      <DeskRow />
    </div>
  </section>
);
