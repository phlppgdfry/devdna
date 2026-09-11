"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { DNAData } from "../lib/github";
import { viewReport } from "../lib/insights.js";
import { Nav, Footer, useLocale, traitLabel } from "./preferences";
import { rememberProfile } from "./recent";
import Timezone from "./timezone";
import { Languages, Rhythm, Summary } from "./charts";
import ReportActions from "./report-actions";
import Snapshots from "./snapshots";
export default function Profile({ data }: { data: DNAData }) {
  const { t, locale } = useLocale();
  const [zone, setZone] = useState("UTC");
  const [values, setValues] = useState<Record<string, Record<string, number>>>(
    {},
  );
  const [mode, setMode] = useState<"repositories" | "bytes">("repositories");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [storageError, setStorageError] = useState(false);
  const offset = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    setStorageError(!rememberProfile(data.user.login));
    return () => controller.current?.abort();
  }, [data.user.login]);
  const report = useMemo(
    () => viewReport(data, zone, mode === "bytes" ? values : null) as DNAData,
    [data, zone, mode, values],
  );
  const originals = data.repositories.filter((r) => !r.fork);
  const completed = originals.filter((r) => Object.hasOwn(values, r.id)).length;
  async function scan() {
    setBusy(true);
    setMode("bytes");
    setStatus("");
    const abort = new AbortController();
    controller.current = abort;
    try {
      while (offset.current < originals.length) {
        const response = await fetch(
          `/api/languages?username=${encodeURIComponent(data.user.login)}&offset=${offset.current}&extended=${data.coverage.repositoryLimit > 300 ? "1" : "0"}`,
          { signal: abort.signal },
        );
        if (!response.ok) {
          if (response.status === 429) {
            const failure = await response.json();
            setStatus(
              failure.retryAt
                ? t(
                    `GitHub’s request limit was reached. Resume after ${new Date(failure.retryAt).toLocaleTimeString(locale)}.`,
                    `GitHubs verzoeklimiet is bereikt. Hervat na ${new Date(failure.retryAt).toLocaleTimeString(locale)}.`,
                  )
                : t(
                    "GitHub’s request limit was reached. Wait before resuming.",
                    "GitHubs verzoeklimiet is bereikt. Wacht voor je hervat.",
                  ),
            );
            return;
          }
          throw Error("api");
        }
        const batch = await response.json();
        if (!batch.results.length || batch.nextOffset <= offset.current)
          throw Error("changed");
        setValues((previous) => ({
          ...previous,
          ...Object.fromEntries(
            batch.results.map(
              (r: { id: number; languages: Record<string, number> }) => [
                r.id,
                r.languages,
              ],
            ),
          ),
        }));
        offset.current = batch.nextOffset;
      }
      setStatus(t("Codebase scan finished.", "Codebasescan afgerond."));
    } catch {
      setStatus(
        abort.signal.aborted
          ? t(
              "Scan paused. Resume whenever you like.",
              "Scan gepauzeerd. Hervat wanneer je wilt.",
            )
          : t(
              "GitHub could not finish the scan. Your partial results are kept; wait and resume.",
              "GitHub kon de scan niet afronden. Gedeeltelijke resultaten blijven bewaard; wacht en hervat.",
            ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell">
      <Nav />
      <section className="panel profile-hero">
        <img
          className="avatar"
          src={data.user.avatar_url}
          width={88}
          height={88}
          alt={data.user.login}
        />
        <div>
          <span className="eyebrow">
            {t("Your developer DNA / decoded", "Jouw developer-DNA / ontleed")}
          </span>
          <h1>{data.user.name || data.user.login}</h1>
          <a
            className="muted"
            href={data.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{data.user.login} ↗
          </a>
          <p className="muted">{data.user.bio}</p>
          <div className="actions" style={{ marginTop: 14 }}>
            <Link className="button" href={`/compare?left=${data.user.login}`}>
              {t("Compare with someone", "Met iemand vergelijken")}
            </Link>
          </div>
        </div>
      </section>
      {storageError && (
        <p className="caption">
          {t(
            "Recent profiles could not be stored in this browser.",
            "Recente profielen konden niet in deze browser worden opgeslagen.",
          )}
        </p>
      )}
      <section className="panel controls">
        <Timezone value={zone} onChange={setZone} />
        <div className="actions">
          <label className="field-label">
            {t("Language analysis", "Taalanalyse")}
            <select
              aria-label={t("Language analysis", "Taalanalyse")}
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            >
              <option value="repositories">
                {t("Repository share", "Repository-aandeel")}
              </option>
              <option value="bytes">
                {t("Codebase bytes", "Codevolume in bytes")}
              </option>
            </select>
          </label>
          <Link
            className="button"
            href={`/${data.user.login}${data.coverage.repositoryLimit > 300 ? "" : "?extended=1"}`}
          >
            {data.coverage.repositoryLimit > 300
              ? t("Use quick scan (300)", "Snelle scan (300)")
              : t("Explore up to 1,000 repos", "Bekijk tot 1.000 repos")}
          </Link>
        </div>
        <p className="caption">
          {data.coverage.repositories} / {data.user.public_repos}{" "}
          {t("public repositories sampled", "publieke repositories bekeken")} ·{" "}
          {t("Limit", "Limiet")}: {data.coverage.repositoryLimit}.{" "}
          {t(
            "Larger profiles remain partial. Public events stay capped at 300.",
            "Grotere profielen blijven gedeeltelijk. Publieke events blijven beperkt tot 300.",
          )}
        </p>
        {mode === "bytes" && (
          <div className="scan">
            <p className="caption">
              {t(
                "Read the real language-byte breakdown of each original codebase. This makes extra GitHub requests and may take several minutes or hit a rate limit.",
                "Lees de echte taalverdeling in bytes van elke originele codebase. Dit gebruikt extra GitHub-verzoeken en kan enkele minuten duren of een verzoeklimiet bereiken.",
              )}
            </p>
            <progress
              value={completed}
              max={Math.max(1, originals.length)}
              aria-label={t("Codebase scan progress", "Voortgang codebasescan")}
            />
            <p className="caption">
              {completed} / {originals.length}{" "}
              {t("codebases analyzed", "codebases geanalyseerd")} ·{" "}
              {completed === originals.length
                ? t("Complete for this sample", "Volledig voor deze steekproef")
                : t(
                    "Partial analysis — percentages may change",
                    "Gedeeltelijke analyse — percentages kunnen veranderen",
                  )}
            </p>
            <div className="actions" style={{ marginTop: 10 }}>
              {busy ? (
                <button
                  className="button"
                  onClick={() => controller.current?.abort()}
                >
                  {t("Pause scan", "Scan pauzeren")}
                </button>
              ) : (
                <button
                  className="button primary"
                  disabled={completed === originals.length}
                  onClick={scan}
                >
                  {completed === originals.length
                    ? t("Scan complete", "Scan voltooid")
                    : offset.current
                      ? t("Resume scan", "Scan hervatten")
                      : t("Analyze codebases", "Codebases analyseren")}
                </button>
              )}
            </div>
            <p className="status" role="status">
              {status}
            </p>
          </div>
        )}
      </section>
      <div className="stats">
        {[
          [t("Sampled stars", "Sterren in steekproef"), report.totalStars],
          [
            t("Public repositories", "Publieke repositories"),
            report.user.public_repos,
          ],
          [
            t("Peak hour", "Piekuur"),
            report.peakHour === null ? "—" : `${report.peakHour}:00`,
          ],
          [t("Followers", "Volgers"), report.user.followers],
        ].map(([label, value]) => (
          <div className="panel stat" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <Summary report={report} />
      <div className="report-grid" style={{ marginTop: 20 }}>
        <Languages report={report} values={mode === "bytes" ? values : null} />
        <Rhythm report={report} />
        <section className="panel">
          <h2 className="section-heading">
            ✦ {t("Your exploration log", "Jouw ontdekkingslogboek")}
          </h2>
          <p className="muted">
            {report.activity.activeRepos}{" "}
            {t("recently active repositories", "recent actieve repositories")}
            <br />
            {report.activity.prs}{" "}
            {t("pull request events", "pull-requestevents")}
            <br />
            {report.activity.stars} {t("star events", "ster-events")}
          </p>
          <p className="caption">
            {t("Commit style", "Commitstijl")}:{" "}
            {traitLabel(report.commitStyle, locale)}
          </p>
          <p className="caption">
            {t(
              "Message analysis needs messages in the public event payload. Event counts are not lifetime totals.",
              "Berichtenanalyse vereist berichten in publieke events. Eventaantallen zijn geen totalen over de hele accountgeschiedenis.",
            )}
          </p>
        </section>
        <section className="panel">
          <h2 className="section-heading">
            ⌘{" "}
            {t(
              "Things you’ve put into the world",
              "Dingen die je hebt gemaakt",
            )}
          </h2>
          <div className="repo-list">
            {report.topRepos.map((r) => (
              <a
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
                key={r.id}
              >
                {r.name} ↗ <small>★ {r.stargazers_count}</small>
              </a>
            ))}
          </div>
          <div className="tags">
            {report.topTopics.map((topic) => (
              <span className="pill" key={topic}>
                #{topic}
              </span>
            ))}
          </div>
        </section>
      </div>
      <div className="section-stack">
        <ReportActions username={report.user.login} report={report} />
        <Snapshots report={report} />
        <details className="panel">
          <summary>
            {t(
              "Inside the lab: data and methodology",
              "In het lab: gegevens en methode",
            )}
          </summary>
          <p className="muted">
            {t(
              "Quick scans include up to 300 recently pushed public repositories; extended scans include up to 1,000. Forks are excluded from language and star totals. Codebase mode aggregates GitHub language bytes, including all reported languages. Large repositories therefore weigh more. This is not a measure of skill or authorship.",
              "Snelle scans bevatten tot 300 recent gepushte publieke repositories; uitgebreide scans tot 1.000. Forks tellen niet mee voor talen en sterren. Codebasemodus telt door GitHub gerapporteerde taalbytes op. Grote repositories wegen dus zwaarder. Dit meet geen vaardigheid of auteurschap.",
            )}
          </p>
          <p className="muted">
            {t(
              "Public event history is limited by GitHub. We use push-event timestamps, not individual commit times. Timezones are applied to each timestamp with daylight-saving rules. Reports and codebase requests are cached for one hour. A fresh visit may return the same data.",
              "GitHub beperkt de publieke eventgeschiedenis. We gebruiken tijdstippen van push-events, geen individuele commits. Tijdzones worden per tijdstip toegepast met zomer- en wintertijd. Rapporten en codebaseverzoeken worden één uur gecachet. Een nieuw bezoek kan dezelfde data tonen.",
            )}
          </p>
          <p className="caption">
            {t("Report generated", "Rapport gegenereerd")}:{" "}
            {new Date(data.generatedAt).toLocaleString(locale)} ·{" "}
            {data.coverage.events} {t("events sampled", "events bekeken")}
          </p>
        </details>
      </div>
      <Footer />
    </main>
  );
}
