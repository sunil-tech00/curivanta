import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { SiteFooter } from '../components/SiteFooter';

// Covers the Curivanta app (app.curivanta.com) for salons and solo stylists, the texts and calls
// we handle for them, this website, and the AI Solar Quote Review. Keep in step with the app
// (curivanta-app/docs/curivanta-features.md) and with the SMS wording carriers require.
const UPDATED = 'November 13, 2026';

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>{children}</h3>
);
const mail = <a href="mailto:hello@curivanta.com" style={{ color: 'var(--brass)' }}>hello@curivanta.com</a>;

const PrivacyPolicy = () => {
  useEffect(() => { document.title = 'Privacy Policy | Curivanta'; }, []);
  return (
    <div className="curivanta-theme">
      <header className="nav">
        <div className="nav-inner">
          <div className="brand">
            <Link to="/">
              <img src="/brand/logo-dark.png" alt="Curivanta" className="dark-logo" style={{ height: '32px', width: 'auto' }} />
              <img src="/brand/logo-light.png" alt="Curivanta" className="light-logo" style={{ height: '32px', width: 'auto' }} />
            </Link>
          </div>
          <nav className="links">
            <Link className="navlink" to="/terms">Terms</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section style={{ paddingTop: '160px', paddingBottom: '100px', minHeight: '80vh' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>Privacy Policy</h1>
          <div style={{ color: 'var(--bone-dim)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>Last updated: {UPDATED}</p>
            <p>Curivanta, a trade name of AUM SL LLC, a California limited liability company ("Curivanta", "we", "us"), makes software that helps salons and solo stylists answer missed calls, reply to and book clients by text and, on the Pro plan, by phone, and ask clients for Google reviews. This policy explains what information we collect, how we use it, and the choices you have. It covers our website (curivanta.com), the Curivanta app (app.curivanta.com), and the texts and calls we handle for the salons that use Curivanta.</p>
            <p>If you are a client of a salon that uses Curivanta, the salon decides how your information is used, and we handle it on the salon's behalf. You can contact the salon directly, or us at {mail}.</p>

            <H>Information we collect</H>
            <p><strong>From salon owners and their team.</strong> Your name, email address and phone number; your salon's details, such as its name, legal name, tax ID (EIN), address, website, hours, services, prices and stylists; the business information phone carriers require to approve texting; and how you use the app. When you connect your booking software (such as SalonUltimate) or your Google Business Profile, we store the sign-in details or access you give us so Curivanta can work with those accounts. Payments are handled by Stripe; we never see or store your full card number.</p>
            <p><strong>From salon clients.</strong> When a client calls or texts a salon that uses Curivanta, or is sent a review request, we handle: their phone number and name; the text messages exchanged; call details such as time, length and outcome; voicemails they leave, including the recording and a written transcript; on the Pro plan, a recording, a written transcript and a short summary of calls the AI assistant answers; appointment details such as service, stylist and time; the rating and any private note they give about a visit; and whether they have opted in or out of texts. Calls answered by a person in the app are not recorded. When the AI assistant answers a call, it tells the caller at the start that it is the salon's automated assistant and that the call is recorded and transcribed. The recording is kept for 90 days, so the salon can check what was said, and is then deleted; the transcript and summary are kept with the salon's other call history.</p>
            <p><strong>From website visitors.</strong> We use Umami, a privacy-focused analytics service, to count page visits and actions such as clicking a button or starting a checkout. Umami does not use cookies, does not track you across other websites, and reports visits only in aggregate. If you fill in a form on our website, we receive what you enter.</p>

            <H>How we use information</H>
            <p>We use it to provide the service: texting back missed callers, answering clients' questions and booking appointments, sending review requests, drafting replies to Google reviews for the owner to approve, sending owners notifications, and showing owners their calls, messages, bookings and reviews. We also use it to register salons with the phone carriers for texting, to bill for the service, to provide support, to keep the service secure, and to fix problems and improve how the service works. We do not sell personal information, and we do not use salon clients' information for our own marketing.</p>

            <H>AI</H>
            <p>Curivanta uses AI from Anthropic (Claude) to read and write text: to reply to clients' messages, to talk with callers on the Pro plan, to read a salon's website during setup, and to draft review requests and review replies. To do this, the relevant messages and salon details are sent to Anthropic, which processes them for us and does not use them to train its models. The AI only offers appointment times that are actually open, and hands conversations it is unsure about to the salon.</p>

            <H>Text messaging (SMS)</H>
            <p>Texts are sent on behalf of the salon a client contacted or visited. Message frequency varies. Message and data rates may apply. Reply STOP to any message to stop receiving texts from that salon, and HELP for help. Opt-outs are honored automatically.</p>
            <p>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text messaging originator opt-in data and consent will not be shared with any third parties, except the service providers who deliver the messages for us.</p>

            <H>Who we share information with</H>
            <p>We share information only with companies that help us run Curivanta, and only as needed for that:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Twilio, for phone numbers, calls, texts, voicemail and carrier registration (which passes the salon's business details to the phone carriers and their registry), and, on the Pro plan, for turning callers' speech into text and the assistant's replies into speech, which Twilio does through its partners Deepgram and ElevenLabs</li>
              <li>Anthropic, for AI (see above)</li>
              <li>Stripe, for payments</li>
              <li>Brevo, for sending email</li>
              <li>Supabase, Render and Vercel, for storing data and hosting the app and website</li>
              <li>Google, SalonUltimate and BookedBy, only when a salon connects those accounts, to post review replies and to check openings and book appointments</li>
            </ul>
            <p>We may also share information if the law requires it, to protect people's safety or our rights, or as part of a sale or merger of our business, in which case this policy continues to apply.</p>

            <H>How we protect information</H>
            <p>Each salon's information is kept separate from every other salon's. Sign-in details for connected accounts, tax IDs and similar sensitive details are stored encrypted. Access is limited to the people who need it to run the service. Owners sign in with a one-time email link, and front-desk logins cannot see billing or settings. No system is perfectly secure, but we work to protect what you share with us.</p>

            <H>How long we keep information</H>
            <p>We keep a salon's information while its Curivanta account is open, so the service can work and owners can look back at past calls, messages and reviews. After an account is closed, we delete the salon's information when asked, and we may keep billing records and opt-out records as long as the law requires.</p>

            <H>Your choices</H>
            <p>Salon owners can view and update their information in the app, and can ask us to export or delete it by emailing {mail}. Salon clients can reply STOP to stop texts, and can ask the salon or us to see, correct or delete their information. If you live in California or another place that gives you privacy rights, you can use those rights by emailing us; we will not treat you differently for doing so.</p>

            <H>Children</H>
            <p>Curivanta is a service for businesses and is not directed at children under 13.</p>

            <H>AI Solar Quote Review</H>
            <p>When you use the AI Solar Quote Review at curivanta.com/solar/review, the documents you upload (solar quotes and utility bills) are sent to our AI provider, Anthropic, to read the numbers, and are then deleted. We do not keep your uploaded files: larger files are held briefly in private storage only while they are read, and any leftovers are removed within a day. We ask the AI not to extract names, street addresses, account numbers, or phone numbers.</p>
            <p>Your finished report, with the numbers you confirmed and the written review, is stored privately and is viewable by anyone who has its unique link. Reports are automatically deleted 12 months after they are created. Payments are processed by Stripe; we never see or store your card details. When you buy a review, we share your email address, report link and verdict with our customer-management system (GoHighLevel) so we can email you your report. To have a report deleted sooner, email us.</p>

            <H>Changes to this policy</H>
            <p>If we change this policy, we will update the date at the top. If a change is significant, we will tell salon owners by email or in the app before it takes effect.</p>

            <H>Contact us</H>
            <p>Questions, requests or complaints about privacy: {mail}.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default PrivacyPolicy;
