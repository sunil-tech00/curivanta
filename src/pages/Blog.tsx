import { useEffect, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { POSTS, bySlug, longDate } from '../blog/posts';
import { Markdown } from '../blog/Markdown';
import NotFound from './NotFound';
import './home/home.css';

// curivanta.com/blog and /blog/<slug>. Articles are Markdown files in src/blog/posts (see src/blog/posts.ts).

const START_URL = 'https://app.curivanta.com/start';
const SIGNIN_URL = 'https://app.curivanta.com/login';

function Shell({ children, where }: { children: ReactNode; where: string }) {
  return (
    <div className="cvh">
      <header className="h-nav">
        <div className="h-wrap h-nav-in">
          <Link className="h-brand" to="/" aria-label="Curivanta home">
            <img src="/brand/logo-light.png" alt="Curivanta" className="h-logo-onlight" />
            <img src="/brand/logo-dark.png" alt="" className="h-logo-ondark" />
          </Link>
          <nav className="h-links" aria-label="Page">
            <Link to="/#product">Product</Link>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/blog">Blog</Link>
          </nav>
          <div className="h-nav-cta">
            <ThemeToggle />
            <a className="h-signin" href={SIGNIN_URL}>Sign in</a>
            <a className="h-btn h-btn-primary h-btn-sm" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where={`${where}_nav`}>Get started</a>
          </div>
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="h-foot">
        <div className="h-wrap h-foot-in">
          <span>© 2026 Curivanta</span>
          <Link to="/">Home</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/square">Square</Link>
          <Link to="/salonultimate">SalonUltimate</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={SIGNIN_URL}>Sign in</a>
          <span className="r">Built by a salon owner. Priced on the page.</span>
        </div>
      </footer>
    </div>
  );
}

function Final({ where }: { where: string }) {
  return (
    <section className="h-block flush">
      <div className="h-wrap">
        <div className="h-final">
          <h2>Your next missed call could be your next booking.</h2>
          <p>Set up in about 15 minutes. Plans from $49 a month, starting only when texting goes live.</p>
          <div className="row2">
            <a className="h-btn h-btn-light" href={START_URL} data-umami-event="cta_get_started" data-umami-event-where={`${where}_final`}>Get started</a>
            <Link className="h-btn h-btn-outline-light" to="/">See everything Curivanta does</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogIndex() {
  useEffect(() => { document.title = 'Blog: running a salon front desk | Curivanta'; }, []);
  return (
    <Shell where="blog">
      <section className="h-hero h-blog-hero">
        <div className="h-wrap">
          <div style={{ maxWidth: '760px' }}>
            <div className="h-kicker">Blog</div>
            <h1>Notes from the front desk.</h1>
            <p className="h-sub">Plain advice for salon owners and solo stylists on missed calls, bookings, reviews and the AI tools that help, from someone who runs salons.</p>
          </div>
        </div>
      </section>
      <section className="h-blog-list">
        <div className="h-wrap">
          {POSTS.length ? (
            <div className="h-posts">
              {POSTS.map(p => (
                <Link className="h-post-card" to={`/blog/${p.slug}`} key={p.slug} data-umami-event="blog_open" data-umami-event-post={p.slug}>
                  <span className="h-post-meta">{longDate(p.date)} · {p.minutes} min read</span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                  <span className="h-post-more">Read the article →</span>
                </Link>
              ))}
            </div>
          ) : <p className="h-sub">The first article is on its way.</p>}
        </div>
      </section>
      <Final where="blog" />
    </Shell>
  );
}

export function BlogPost() {
  const { slug = '' } = useParams();
  const post = bySlug(slug);
  useEffect(() => { if (post) document.title = `${post.title} | Curivanta`; }, [post]);
  if (!post) return <NotFound />;
  const more = POSTS.filter(p => p.slug !== post.slug).slice(0, 3);
  return (
    <Shell where={`blog_${post.slug}`}>
      <article className="h-article">
        <div className="h-wrap">
          <p className="h-crumb"><Link to="/blog">‹ Blog</Link></p>
          <h1>{post.title}</h1>
          <p className="h-post-meta">{post.author} · {longDate(post.date)} · {post.minutes} min read</p>
          <div className="h-prose"><Markdown source={post.body} /></div>
        </div>
      </article>
      {more.length > 0 && (
        <section className="h-block flush">
          <div className="h-wrap">
            <div className="h-head"><div className="h-kicker">Keep reading</div></div>
            <div className="h-posts">
              {more.map(p => (
                <Link className="h-post-card" to={`/blog/${p.slug}`} key={p.slug}>
                  <span className="h-post-meta">{longDate(p.date)} · {p.minutes} min read</span>
                  <h2>{p.title}</h2>
                  <p>{p.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Final where={`blog_${post.slug}`} />
    </Shell>
  );
}
