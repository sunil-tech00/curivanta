import IntegrationPage, { type Integration } from './IntegrationPage';

// curivanta.com/square. Facts from curivanta-app: app/providers/square.py (buyer-level booking, works on Square's free
// Appointments plan, follows the salon's online booking settings), app/visits.py (checkouts), app/reviews.py.
const SQUARE: Integration = {
  key: 'square',
  title: 'AI front desk for Square salons: books into Square Appointments | Curivanta',
  kicker: 'Curivanta for Square',
  h1: <>The AI front desk that books straight into <em>Square</em>.</>,
  sub: "Curivanta texts back every missed call, answers your clients' texts around the clock, and books them into your Square Appointments calendar, with the real openings your clients would see online. On Pro, it answers the phone when you can't. Every Square checkout adds the client to your list and can send a Google review request.",
  does: ['Books into Square Appointments', "Works on Square's free plan", 'Texts back missed calls', 'Review requests after checkout', 'Answers calls on Pro'],
  points: [
    { h: 'Books into your Square calendar', p: "The AI checks your real Square openings, offers only times that are free, confirms with the client, and books the appointment. It shows up in Square Appointments like any online booking, and the client is found or added in your Square customers." },
    { h: "Knows your services and stylists", p: "Your services, prices, lengths and team come straight from Square. Clients' own words (\"boys cut\", \"trim\") are matched to your menu, and returning clients are offered their usual service with their usual stylist." },
    { h: 'Every checkout counts', p: "Each completed Square checkout is saved to the client's history: who came in, the service and the stylist. That builds your client list and visit counts, and can trigger a Google review request about an hour later." },
    { h: 'Missed calls become bookings', p: "Square doesn't answer your phone. Forward the calls you miss to Curivanta: the caller gets a text within about a minute, and on Pro the AI picks up, answers questions and books by voice." },
  ],
  stepsTitle: 'Connect Square in about a minute',
  stepsLede: "No passwords to share and no new booking system. Curivanta books the same way your Square online booking page does, so it follows the rules you've already set there.",
  steps: [
    { h: 'Sign in to Square and tap Allow', p: "On the booking step of setup, choose Square, sign in, and allow Curivanta. You can remove its access from your Square account any time.", t: 'About 1 minute' },
    { h: 'We bring in your menu and team', p: 'Services, prices, lengths and the stylists clients can book online come in from Square automatically. Nothing to type.', t: 'Automatic' },
    { h: 'Texting goes live', p: 'We register your number with the phone carriers. Once they approve, usually within a few days, text-back, AI booking and review requests switch on.', t: 'A few days' },
  ],
  faq: [
    { q: 'Does Curivanta work with Square Appointments?', a: "Yes. Curivanta connects to your Square account, reads your real openings, and books appointments into Square Appointments by text, and by phone on Pro. Bookings appear in your Square calendar like any online booking." },
    { q: "Does it work on Square's free Appointments plan?", a: "Yes. Curivanta books the same way your Square online booking page does, which works on the free plan. You don't need Appointments Plus or Premium. Your Square online booking needs to be turned on." },
    { q: 'Which services and stylists can the AI book?', a: "The ones you've set as bookable online in Square. It follows your online booking rules too, such as how far ahead clients can book, so it never offers something your booking page wouldn't." },
    { q: 'Will clients get double-booked?', a: "No. The AI checks your live Square availability before offering a time and again when it books. If the slot was taken in the meantime, it tells the client and offers another time." },
    { q: 'Can it text back missed calls for my Square salon?', a: "Yes. Forward the calls you miss to your Curivanta number and every caller gets a text within about a minute. Solo stylists can use Curivanta's business number instead, which rings their own cell." },
    { q: 'Does it send Google review requests after Square checkouts?', a: "Yes. After each completed checkout, Curivanta can text the client about an hour later with your Google review link. Everyone gets the link, you choose how many go out a day, and nobody is asked more than once in 90 days." },
    { q: 'Do I need anything besides Square?', a: "No new hardware or booking system. You keep running your salon in Square; Curivanta adds the texting, the missed-call follow-up, the review requests and, on Pro, the phone answering." },
    { q: 'How much does it cost?', a: "Starter is $49 a month for solo stylists, Light is $99 for salons with a team, and Pro is $149 with AI phone answering. Setup is $49, counted toward your first month, and the monthly plan starts only when your texting goes live." },
  ],
  other: { to: '/salonultimate', label: 'SalonUltimate' },
};

const SquarePage = () => <IntegrationPage page={SQUARE} />;
export default SquarePage;
