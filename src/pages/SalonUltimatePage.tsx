import IntegrationPage, { type Integration } from './IntegrationPage';

// curivanta.com/salonultimate. Facts from curivanta-app: app/su_invites.py (receptionist invite accepted
// automatically), app/online_booking.py (BookedBy openings, franchise store matching), app/booking.py, app/visits.py.
const SALONULTIMATE: Integration = {
  key: 'salonultimate',
  title: 'AI front desk for SalonUltimate salons: books into your appointment book | Curivanta',
  kicker: 'Curivanta for SalonUltimate',
  h1: <>The AI front desk built for <em>SalonUltimate</em>.</>,
  sub: "Curivanta texts back every missed call, answers your clients' texts around the clock, and books them straight into your SalonUltimate appointment book, using the same live openings as your online booking. On Pro, it answers the phone when you can't. It runs every day in our founder's own SalonUltimate salons.",
  does: ['Books into SalonUltimate', 'Live openings from your online booking', 'Texts back missed calls', 'Review requests after checkout', 'Answers calls on Pro'],
  points: [
    { h: 'Books into your appointment book', p: 'The AI checks your live openings, offers only times that are free, confirms with the client, and writes the booking into SalonUltimate. Your front desk sees it in the same calendar they already use.' },
    { h: 'Knows your menu, stylists and clients', p: "Services, prices and stylists come in from SalonUltimate, with a refresh any time you change them. Returning clients are recognized and offered their usual service with their usual stylist." },
    { h: 'Every checkout counts', p: "Each SalonUltimate checkout is saved to the client's history: the service and the stylist. That builds your client list and visit counts, and can trigger a Google review request about an hour later." },
    { h: 'Made for franchises too', p: 'On a franchise site with many locations, Curivanta finds your store by its number and address, so bookings and checkouts are always your location\'s.' },
  ],
  stepsTitle: 'Connect SalonUltimate without sharing a password',
  stepsLede: "Curivanta gets its own receptionist login, the same way you'd add a new front-desk hire. Your staff keeps working exactly as today.",
  steps: [
    { h: 'Add Curivanta as a Receptionist', p: "In SalonUltimate, add the Curivanta email address shown in setup as a new employee with the Receptionist role. We accept the invite for you.", t: 'About 5 minutes' },
    { h: 'We connect everything else', p: 'Curivanta brings in your services and stylists and sets up live openings from your SalonUltimate online booking by itself. You only confirm anything it can\'t match.', t: 'Automatic' },
    { h: 'Texting goes live', p: 'We register your number with the phone carriers. Once they approve, usually within a few days, text-back, AI booking and review requests switch on.', t: 'A few days' },
  ],
  faq: [
    { q: 'Does Curivanta book directly into SalonUltimate?', a: 'Yes. The AI books appointments straight into your SalonUltimate appointment book by text, and by phone on Pro. Your staff sees them like any other booking; there is no second calendar.' },
    { q: 'How does Curivanta connect to SalonUltimate?', a: "You add Curivanta's email address as a Receptionist in SalonUltimate, like adding a new front-desk employee. No owner password is shared, and you can remove that employee any time to disconnect." },
    { q: 'Where do the openings come from?', a: "From your SalonUltimate online booking (BookedBy), the same live openings your clients see when they book online. Curivanta finds and sets that up for you." },
    { q: 'We run several locations on one franchise site. Does that work?', a: 'Yes. Curivanta picks your location by store number, ZIP code and phone number, so each location has its own setup, openings, bookings and checkouts.' },
    { q: 'Does it send Google review requests after checkout?', a: 'Yes. Curivanta reads your checkouts through the day and can text each client about an hour later with your Google review link. Everyone gets the link, you choose how many go out a day, and nobody is asked more than once in 90 days.' },
    { q: 'Can it text back missed calls?', a: 'Yes. Forward the calls you miss to your Curivanta number and every caller gets a text within about a minute. On Pro, the AI answers those calls, answers questions and books by voice.' },
    { q: 'Is anyone actually using it on SalonUltimate?', a: "Yes. Curivanta runs every day in our founder's own SalonUltimate salons: texting clients, booking into SalonUltimate, sending review requests and, on Pro, answering calls." },
    { q: 'How much does it cost?', a: 'Starter is $49 a month for solo stylists, Light is $99 for salons with a team, and Pro is $149 with AI phone answering. Setup is $49, counted toward your first month, and the monthly plan starts only when your texting goes live.' },
  ],
  other: { to: '/square', label: 'Square' },
};

const SalonUltimatePage = () => <IntegrationPage page={SALONULTIMATE} />;
export default SalonUltimatePage;
