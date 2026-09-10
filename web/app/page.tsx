import Link from "next/link";
import Search from "../components/search";
import Helix from "../components/helix";
export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/">
          ✳ dev<span>dna</span>
        </Link>
        <a className="button" href="https://github.com/phlppgdfry/devdna">
          View on GitHub ↗
        </a>
      </nav>
      <section className="hero">
        <div>
          <span className="eyebrow">The developer identity lab</span>
          <h1>
            Your code
            <br />
            tells a <span className="gradient">story.</span>
          </h1>
          <p className="muted">
            Are you a midnight maker, a mobile architect, or a language
            explorer? Turn your public GitHub activity into a little
            self-discovery.
          </p>
          <Search />
          <div className="examples">
            Take a peek: <Link href="/octocat">octocat</Link>
            <Link href="/phlppgdfry">phlppgdfry</Link>
            <Link href="/antfu">antfu</Link>
          </div>
          <p className="caption" style={{ marginTop: 18 }}>
            No sign-up. Public data only. A playful portrait, never a developer
            ranking.
          </p>
        </div>
        <div className="panel specimen">
          <div className="specimen-top">
            <span className="eyebrow">DNA specimen / preview</span>
            <span className="pill">Illustrative</span>
          </div>
          <Helix />
          <h2>
            One profile.
            <br />
            <span className="gradient">Many superpowers.</span>
          </h2>
          <div className="tags">
            <span className="pill">☾ Night Owl</span>
            <span className="pill">⌘ UI Craftsman</span>
            <span className="pill">✦ True Polyglot</span>
          </div>
          <p className="caption" style={{ marginTop: 22 }}>
            Your own report uses observed repository and activity patterns.
            These example traits are just a preview.
          </p>
        </div>
      </section>
      <section className="feature-grid">
        {[
          [
            "01 / DISCOVER",
            "Meet your coding alter ego",
            "Explore playful traits with a transparent explanation of the signals behind them.",
          ],
          [
            "02 / EXPLORE",
            "Find your rhythm",
            "See your language mix, busy hours, and weekly activity in one clear report.",
          ],
          [
            "03 / KEEP",
            "Take your DNA with you",
            "Download your DNA card, copy a README link, export JSON, or save your report as PDF.",
          ],
        ].map(([n, title, body]) => (
          <article className="panel" key={n}>
            <span className="eyebrow">{n}</span>
            <h3>{title}</h3>
            <p className="muted">{body}</p>
          </article>
        ))}
      </section>
      <footer className="footer">
        <span>✳ Built for curious developers.</span>
        <span>Open source · Made by Philippe Godfroy</span>
      </footer>
    </main>
  );
}
