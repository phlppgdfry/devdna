import Link from "next/link";
import { notFound } from "next/navigation";
import { getDNA, GitHubError } from "../../lib/github";
import ReportActions from "../../components/report-actions";
export const revalidate = 3600;
const colors = [
  "#83f5c5",
  "#bca6ff",
  "#7dcfff",
  "#ffcc85",
  "#ff99bc",
  "#9eb0ff",
];
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  let dna;
  try {
    dna = await getDNA((await params).username);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) notFound();
    throw error;
  }
  const {
    user,
    languages,
    hours,
    peakHour,
    totalStars,
    topRepos,
    traits,
    commitStyle,
    topTopics,
    coverage,
    activity,
    days,
  } = dna;
  const max = Math.max(...hours, 1);
  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/">
          ✳ dev<span>dna</span>
        </Link>
        <Link className="button" href="/">
          ← Decode another profile
        </Link>
      </nav>
      <section className="panel">
        <div className="profile-hero">
          <img
            className="avatar"
            src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            width={88}
            height={88}
          />
          <div>
            <span className="eyebrow">Your developer DNA / decoded</span>
            <h1>{user.name || user.login}</h1>
            <a
              className="muted"
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{user.login} ↗
            </a>
            {user.bio && <p className="muted">{user.bio}</p>}
            <div className="tags">
              {traits.length ? (
                traits.map((t, i) => (
                  <span className="pill" key={t}>
                    {["✦", "⌘", "◈", "✳"][i % 4]} {t}
                  </span>
                ))
              ) : (
                <span className="caption">
                  A fresh specimen — more public data will reveal more patterns.
                </span>
              )}
            </div>
          </div>
        </div>
        <ReportActions username={user.login} report={dna} />
      </section>
      <section className="stats">
        {[
          [
            "Original repo stars",
            totalStars.toLocaleString(),
            "Across sampled repositories",
          ],
          [
            "Public repositories",
            user.public_repos.toLocaleString(),
            `${coverage.repositories} sampled`,
          ],
          [
            "Peak push hour",
            peakHour === null ? "—" : `${String(peakHour).padStart(2, "0")}:00`,
            "UTC · recent public sample",
          ],
          [
            "Followers",
            user.followers.toLocaleString(),
            "Public GitHub followers",
          ],
        ].map(([label, value, note]) => (
          <div className="panel stat" key={label}>
            <span className="caption">{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </section>
      <div className="report-grid">
        <section className="panel">
          <h2 className="section-heading">◈ Your language palette</h2>
          <p className="caption">
            Share of original repositories by primary language.
          </p>
          {!languages.length && (
            <p className="muted" style={{ marginTop: 20 }}>
              No public repository languages found yet.
            </p>
          )}
          {languages.map(({ lang, pct, repos }, i) => (
            <div className="language" key={lang}>
              <div className="language-label">
                <span>
                  {lang} <span className="caption">· {repos} repos</span>
                </span>
                <strong>{pct}%</strong>
              </div>
              <div className="track">
                <span
                  style={{
                    width: `${pct}%`,
                    background: colors[i % colors.length],
                  }}
                />
              </div>
            </div>
          ))}
          <p className="caption" style={{ marginTop: 20 }}>
            Top six languages. Repository counts describe your mix, not lines of
            code or skill level.
          </p>
        </section>
        <section className="panel">
          <h2 className="section-heading">☾ When inspiration strikes</h2>
          <p className="caption">
            {coverage.pushes} public push events · all hours in UTC
          </p>
          {coverage.pushes ? (
            <>
              <div
                className="heatmap"
                role="img"
                aria-label={`Hourly public pushes in UTC: ${hours.map((n, h) => `${h}:00 ${n}`).join(", ")}`}
              >
                {hours.map((n, h) => (
                  <div
                    key={h}
                    title={`${h}:00 UTC: ${n} pushes`}
                    style={{
                      height: `${Math.max(5, (n / max) * 100)}%`,
                      background: h === peakHour ? "#ffcc85" : "#83f5c5",
                      opacity: n ? 0.35 + (n / max) * 0.65 : 0.12,
                    }}
                  />
                ))}
              </div>
              <div className="axis">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </>
          ) : (
            <p className="muted" style={{ margin: "26px 0" }}>
              No public pushes in this sample. Private work and older activity
              aren’t visible here.
            </p>
          )}
          <span className="pill">
            Commit style:{" "}
            {commitStyle === "Unknown"
              ? "Not enough message data"
              : commitStyle}
          </span>
        </section>
        <section className="panel">
          <h2 className="section-heading">↗ A week in your world</h2>
          <p className="caption">
            Pushes grouped by weekday across the available sample.
          </p>
          <div className="day-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
              <div className="day" key={d}>
                <strong>{days[i]}</strong>
                {d}
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2 className="section-heading">✦ Your exploration log</h2>
          <p className="muted" style={{ marginTop: 16 }}>
            <strong className="gradient">{activity.activeRepos}</strong>{" "}
            repositories pushed to
            <br />
            <strong className="gradient">{activity.prs}</strong> pull request
            events
            <br />
            <strong className="gradient">{activity.stars}</strong> star events
          </p>
          <p className="caption" style={{ marginTop: 12 }}>
            Event counts from your recent public activity, not lifetime totals.
          </p>
        </section>
        <section className="panel wide">
          <h2 className="section-heading">
            ⌘ Things you’ve put into the world
          </h2>
          <p className="caption">
            Your most-starred original repositories in this sample.
          </p>
          <div className="repos">
            {topRepos.map((repo) => (
              <a
                className="repo"
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h3>{repo.name} ↗</h3>
                <p className="muted">
                  {repo.description || "A project waiting for its story."}
                </p>
                <small>
                  ★ {repo.stargazers_count} ·{" "}
                  {repo.language || "No language detected"}
                </small>
              </a>
            ))}
          </div>
          {!topRepos.length && (
            <p className="muted">No original public repositories found.</p>
          )}
          <div className="tags">
            {topTopics.map((t) => (
              <span className="pill" key={t}>
                #{t}
              </span>
            ))}
          </div>
        </section>
      </div>
      <details className="panel">
        <summary>Inside the lab: how your DNA is decoded</summary>
        <p className="muted">
          This report samples up to 300 public repositories sorted by recent
          push and up to 300 public events. This run includes{" "}
          {coverage.repositories} repositories and {coverage.events} events.
          GitHub limits the available event history; this is not a complete
          contribution record. Reports are cached for one hour.
        </p>
        <p className="muted">
          Language percentages count each non-fork repository with a detected
          primary language once. Time traits use the busiest six-hour UTC
          period: night (00–06), morning (06–12), afternoon (12–18), or evening
          (18–24). UTC may differ from your local time. Without pushes, no time
          trait is assigned.
        </p>
        <p className="muted">
          Stack traits follow the leading language. Polyglot means at least
          three primary languages; True Polyglot means at least five. Builder
          means 15 public repositories and Prolific Creator means 40. Star
          traits start at 100 and 500 sampled original-repository stars. Commit
          style is only inferred when messages are available. These are playful
          labels, not measures of ability.
        </p>
      </details>
      <footer className="footer">
        <Link href="/">
          ✳ Everyone has a different code story. Discover another →
        </Link>
        <span>Public data · Playful interpretation</span>
      </footer>
    </main>
  );
}
