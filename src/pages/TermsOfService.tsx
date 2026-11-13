import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { SiteFooter } from '../components/SiteFooter';

// Terms for the Curivanta app (Starter, Light and Pro plans).
// Keep plan facts in step with curivanta-app (app/plans.py, app/config.py).
const UPDATED = 'November 13, 2026';

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>{children}</h3>
);
const mail = <a href="mailto:hello@curivanta.com" style={{ color: 'var(--brass)' }}>hello@curivanta.com</a>;

const TermsOfService = () => {
  useEffect(() => { document.title = 'Terms of Service | Curivanta'; }, []);
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
            <Link className="navlink" to="/privacy">Privacy</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section style={{ paddingTop: '160px', paddingBottom: '100px', minHeight: '80vh' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>Terms of Service</h1>
          <div style={{ color: 'var(--bone-dim)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>Last updated: {UPDATED}</p>
            <p>These terms are an agreement between you and AUM SL LLC, a California limited liability company doing business as Curivanta ("Curivanta", "we", "us"), for using curivanta.com and the Curivanta app (app.curivanta.com). By signing up for or using Curivanta, you agree to them. If you sign up for a business, you confirm you are allowed to agree on its behalf and are at least 18.</p>

            <H>The service</H>
            <p>Curivanta helps salons and solo stylists answer missed calls and clients' texts. It texts back missed callers, answers clients' questions and books appointments by text using AI (and, on Pro, by phone), asks clients for Google reviews, drafts replies to Google reviews for you to approve, and shows you everything in the app. Each plan covers one salon location.</p>
            <p><strong>Starter</strong> is for one person, such as a solo stylist or booth renter. It includes a Curivanta business number, and when a client wants to book, the AI books into SalonUltimate if you use it, or sends your own online booking link. <strong>Light</strong> is for salons with a team. You keep your salon's number and forward missed calls to Curivanta, your team can have their own sign-ins, and the AI books straight into your booking software (currently SalonUltimate). <strong>Pro</strong> includes everything in Light, and when nobody can pick up, an AI assistant answers the call: it tells the caller it is the salon's automated assistant and that the call is recorded and transcribed, answers questions, books appointments, takes messages, and lets the caller ask for a person or leave a voicemail. You choose when it answers.</p>

            <H>Plans, billing and usage</H>
            <p><strong>Setup fee.</strong> A one-time setup fee is charged when you sign up ($49 for Starter, $99 for Light, $149 for Pro). It covers setting up your account, your number and your carrier registration, and is not refundable.</p>
            <p><strong>Monthly fee.</strong> Your monthly fee ($49 for Starter, $99 for Light, $149 for Pro) starts on the day your texting goes live, after the phone carriers approve your salon, which usually takes 1 to 2 weeks after sign-up. It is then charged automatically each month, on that date, to the card you provided, through our payment processor, Stripe. Prices are shown on our website and at sign-up.</p>
            <p><strong>Included usage.</strong> Each billing month, Starter includes 400 texts and 300 call minutes, Light includes 1,000 texts and 300 call minutes, and Pro includes 1,500 texts, 300 call minutes and 200 minutes of the AI assistant on the phone. Extra usage is $10 for each 250 extra texts, or part of 250, and $10 for each 250 extra call minutes, or part of 250, counted separately; extra assistant minutes on Pro are $10 for each 50, or part of 50. We email you when you reach 80% of any allowance, and extra usage is added to your next monthly invoice. A long text can count as more than one text. Texting back missed callers never stops because of usage.</p>
            <p><strong>Changing plans.</strong> You can move from Starter to Light or Pro, or from Light to Pro, at any time from the billing page. If you are already live, you pay the difference for the rest of that month on your next bill.</p>
            <p><strong>Price changes.</strong> If we change our prices, we will tell you at least 30 days before the new price applies to you.</p>
            <p><strong>Failed payments.</strong> If a payment fails, Stripe tries again over the following days and your service keeps working meanwhile. If every attempt fails, your plan ends and texting stops.</p>

            <H>No contract; cancelling</H>
            <p>Plans are month to month. You can cancel at any time from the billing page in the app, or by emailing {mail}. If you cancel after going live, your service continues until the end of the month you have paid for, and we do not charge you again. If you cancel before going live, we stop setup and do not charge a monthly fee. Monthly fees already paid are not refunded for partial months.</p>

            <H>Your responsibilities</H>
            <p><strong>Accurate information.</strong> You give us accurate details about your business, including the legal name, tax ID and contact details the phone carriers require. We submit these to the carriers for you. Carriers decide whether and when to approve texting.</p>
            <p><strong>Permission to text your clients.</strong> Curivanta texts people who have called or texted your business, or who have visited you, about their calls, appointments and visits. You are responsible for having your clients' permission to be contacted this way and for following the laws that apply to business texting and calls. Curivanta is registered for customer care messages: do not use it to send promotions or marketing messages.</p>
            <p><strong>Reviews.</strong> Curivanta asks every client the same way and gives everyone your Google link. Do not use it to filter who is asked for a review, or to offer anything in exchange for a review. We cannot remove or guarantee reviews, and what clients write is up to them.</p>
            <p><strong>Your accounts.</strong> Keep your sign-in email secure, add only people you trust to your team, and keep the access you gave us to your booking software and Google working. If that access stops, some features stop until it is restored.</p>
            <p><strong>Fair use.</strong> Do not use Curivanta to send spam, to harass anyone, to break the law, or to try to get around usage limits or security.</p>

            <H>AI and the service</H>
            <p>The AI answers from the information about your salon that you and your website provide, only offers appointment times that are open in your booking system, and hands conversations it is unsure about to you. Like any person or software, it can make mistakes. You remain responsible for your appointments, prices, policies and client relationships, and should review conversations the app flags for you. Review replies are posted only after you approve them. On Pro, you can see every call the assistant answered, with a summary and what was said, and listen to its recording for 90 days; speech recognition can mishear, so check calls the app flags.</p>
            <p>We work to keep Curivanta running at all times, but it depends on phone carriers, our providers and your connected accounts, and may sometimes be unavailable or delayed. We may update and improve features over time.</p>
            <p><strong>No emergency calls.</strong> Curivanta is not a replacement for a regular phone line and cannot be used to call 911 or other emergency services.</p>

            <H>Your data</H>
            <p>Your salon's information and your clients' information, including call transcripts, belong to you. We use it only to provide the service, as described in our <Link to="/privacy" style={{ color: 'var(--brass)' }}>Privacy Policy</Link>. You can ask us to export or delete it at any time.</p>

            <H>Ending the service</H>
            <p>We may suspend or end your account if payment fails, if you break these terms, or if a phone carrier requires it. Where we can, we will tell you first and give you a chance to fix the problem.</p>

            <H>Disclaimers and limits</H>
            <p>Curivanta is provided "as is". To the extent the law allows, we do not promise that it will be error-free or uninterrupted, or that it will produce any particular number of bookings or reviews. Our total liability for any claim relating to Curivanta is limited to the fees you paid us in the 12 months before the claim, and we are not liable for indirect or lost-profit damages. You agree to cover claims made against us that arise from how you use Curivanta to contact your clients. These terms are governed by the laws of the State of California.</p>

            <H>Changes to these terms</H>
            <p>If we change these terms, we will update the date at the top. If a change is significant, we will tell you by email or in the app before it takes effect.</p>

            <H>Website content</H>
            <p>The content on curivanta.com and in the app, including text, design and software, belongs to AUM SL LLC or its licensors. Curivanta is a trade name of AUM SL LLC.</p>

            <H>Contact us</H>
            <p>Questions about these terms: {mail}.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default TermsOfService;
