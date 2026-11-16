import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { SiteFooter } from '../components/SiteFooter';

// How to ask for a Curivanta account (and its data) to be deleted. Google Play's Data safety form links here
// (the Android app, com.curivanta.app). Keep in step with the privacy policy's "How long we keep information".
const H = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ color: 'var(--bone)', marginTop: '16px' }}>{children}</h3>
);
const mail = <a href="mailto:hello@curivanta.com?subject=Delete%20my%20Curivanta%20account" style={{ color: 'var(--brass)' }}>hello@curivanta.com</a>;
const list = { paddingLeft: '20px', display: 'flex', flexDirection: 'column' as const, gap: '6px' };

const DeleteAccount = () => {
  useEffect(() => { document.title = 'Delete your account | Curivanta'; }, []);
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
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '32px' }}>Delete your Curivanta account</h1>
          <div style={{ color: 'var(--bone-dim)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p>This page explains how to delete your account for Curivanta, the app from AUM SL LLC that salons and solo stylists use for missed calls, client texts, bookings and reviews (on the web at app.curivanta.com and on Android and iPhone).</p>

            <H>How to ask</H>
            <ol style={list}>
              <li>Email {mail} from the email address you sign in to Curivanta with.</li>
              <li>Write "Delete my account" and the name of your salon.</li>
              <li>We reply to confirm it's you, and delete the account within 30 days. We email you when it's done.</li>
            </ol>
            <p>If you are the salon owner, deleting the account also cancels your plan, so nothing more is charged. Removing the app from your phone does not delete your account.</p>

            <H>What we delete</H>
            <ul style={list}>
              <li>Your sign-in and your team's sign-ins</li>
              <li>Your salon's details, services, stylists and settings</li>
              <li>Your clients, text conversations, call history, voicemails, call recordings and transcripts</li>
              <li>Bookings, visits, review requests, ratings and review reply drafts</li>
              <li>Our access to the accounts you connected, such as your booking software and Google profile</li>
              <li>Phones registered for notifications and calls</li>
            </ul>
            <p>Your Curivanta phone number is released. If you want to keep it, tell us before we delete the account and we will help you move it.</p>

            <H>What we keep, and for how long</H>
            <ul style={list}>
              <li>Billing records (invoices and payments), for as long as tax law requires, usually up to 7 years</li>
              <li>The list of numbers that replied STOP, so they are never texted again, for as long as texting rules require</li>
              <li>The business details already sent to phone carriers to approve texting, which the carriers and Twilio keep under their own rules</li>
            </ul>
            <p>Backups that contain deleted information are overwritten within 30 days.</p>

            <H>Team members</H>
            <p>If you are on a salon's team, the owner can remove you in the app under More, Team. You can also email {mail} and we will remove your sign-in.</p>

            <H>Salon clients</H>
            <p>If you are a client of a salon that uses Curivanta, reply STOP to any text to stop texts from that salon. To have your information deleted, ask the salon, or email {mail} with your phone number and the salon's name.</p>

            <p>More about how we handle information: <Link to="/privacy" style={{ color: 'var(--brass)' }}>Privacy Policy</Link>.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default DeleteAccount;
