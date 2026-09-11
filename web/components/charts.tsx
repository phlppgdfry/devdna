"use client";
import { useState } from "react";
import type { DNAData } from "../lib/github";
import { useLocale, traitLabel } from "./preferences";
export const colors = [
  "#83f5c5",
  "#bca6ff",
  "#7dcfff",
  "#ffcc85",
  "#ff99bc",
  "#9eb0ff",
];
export function Rhythm({ report }: { report: DNAData }) {
  const { t } = useLocale();
  const max = Math.max(...report.hours, 1);
  return (
    <section className="panel">
      <h2 className="section-heading">
        ☾ {t("When inspiration strikes", "Wanneer inspiratie toeslaat")}
      </h2>
      <p className="caption">
        {report.coverage.pushes}{" "}
        {t("sampled public pushes", "publieke pushes in steekproef")} ·{" "}
        {report.coverage.timezone}
      </p>
      {report.coverage.pushes ? (
        <>
          <div
            className="heatmap"
            role="img"
            aria-label={report.hours.map((n, h) => `${h}:00 ${n}`).join(", ")}
          >
            {report.hours.map((n, h) => (
              <div
                key={h}
                title={`${h}:00: ${n}`}
                style={{
                  height: `${Math.max(5, (n / max) * 100)}%`,
                  background: h === report.peakHour ? "#ffcc85" : "#83f5c5",
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
          <p className="caption">
            {t("Peak hour", "Piekuur")}: {report.peakHour}:00
          </p>
          <div className="day-grid">
            {[
              t("Sun", "Zo"),
              t("Mon", "Ma"),
              t("Tue", "Di"),
              t("Wed", "Wo"),
              t("Thu", "Do"),
              t("Fri", "Vr"),
              t("Sat", "Za"),
            ].map((d, i) => (
              <div className="day" key={d}>
                <strong>{report.days[i]}</strong>
                {d}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="muted" style={{ marginTop: 20 }}>
          {t(
            "No public push timestamps in this sample. Private and older work is not visible.",
            "Geen publieke pushtijdstippen in deze steekproef. Privéwerk en ouder werk zijn niet zichtbaar.",
          )}
        </p>
      )}
    </section>
  );
}
export function Languages({
  report,
  values,
}: {
  report: DNAData;
  values?: Record<string, Record<string, number>> | null;
}) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const languages = all ? report.languages : report.languages.slice(0, 8);
  const repos = report.repositories.filter(
    (r) =>
      !r.fork &&
      (report.languageMode === "bytes"
        ? !!values?.[r.id]?.[selected || ""]
        : r.language === selected),
  );
  return (
    <section className="panel">
      <h2 className="section-heading">
        ◈ {t("Your language palette", "Jouw talenpalet")}
      </h2>
      <p className="caption">
        {report.languageMode === "bytes"
          ? t(
              "GitHub language bytes. Click a language to explore its codebases.",
              "Taalvolume in bytes van GitHub. Klik op een taal om codebases te bekijken.",
            )
          : t(
              "Primary language per original repository. Click a language to explore.",
              "Primaire taal per originele repository. Klik op een taal voor meer.",
            )}
      </p>
      {languages.map(({ lang, pct, repos }, i) => (
        <button
          className="language language-button"
          key={lang}
          aria-pressed={selected === lang}
          onClick={() => setSelected(selected === lang ? null : lang)}
        >
          <span className="language-label">
            <span>
              {lang} <span className="caption">· {repos} repos</span>
            </span>
            <strong>{pct}%</strong>
          </span>
          <span className="track">
            <span
              style={{
                width: `${pct}%`,
                background: colors[i % colors.length],
              }}
            />
          </span>
        </button>
      ))}
      {!languages.length && (
        <p className="muted">
          {t(
            "No language data available yet.",
            "Nog geen taalgegevens beschikbaar.",
          )}
        </p>
      )}
      {report.languages.length > 8 && (
        <button
          className="button"
          style={{ marginTop: 12 }}
          onClick={() => setAll(!all)}
        >
          {all
            ? t("Show less", "Minder tonen")
            : t("Show all languages", "Alle talen tonen")}
        </button>
      )}
      {selected && (
        <div className="drilldown">
          <h3>
            {selected} · {repos.length} {t("repositories", "repositories")}
          </h3>
          <div className="repo-list">
            {repos.map((r) => (
              <a
                key={r.id}
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.name} ↗{" "}
                {report.languageMode === "bytes" && (
                  <small>
                    {values?.[r.id]?.[selected]?.toLocaleString()} bytes
                  </small>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
      <p className="caption" style={{ marginTop: 18 }}>
        {t(
          "Shares describe the available sample, not skill or time spent. Rounding can affect the total.",
          "Aandelen beschrijven de steekproef, geen vaardigheid of bestede tijd. Afronding kan het totaal beïnvloeden.",
        )}
      </p>
    </section>
  );
}
export function Summary({ report }: { report: DNAData }) {
  const { t, locale } = useLocale();
  const leading = report.languages[0]?.lang;
  const night = report.hours.slice(0, 6).reduce((a, b) => a + b, 0),
    morning = report.hours.slice(6, 12).reduce((a, b) => a + b, 0),
    afternoon = report.hours.slice(12, 18).reduce((a, b) => a + b, 0),
    evening = report.hours.slice(18).reduce((a, b) => a + b, 0);
  function reason(trait: string) {
    const periods: Record<string, [number, string]> = {
      "Night Owl": [night, "00–06"],
      "Early Bird": [morning, "06–12"],
      "Nine-to-Fiver": [afternoon, "12–18"],
      "Evening Coder": [evening, "18–24"],
    };
    if (periods[trait])
      return `${periods[trait][0]} ${t("pushes in your busiest six-hour period", "pushes in je drukste periode van zes uur")} (${periods[trait][1]}, ${report.coverage.timezone}).`;
    if (trait.includes("Polyglot"))
      return `${report.languages.length} ${t("languages observed; Polyglot starts at 3, True Polyglot at 5.", "talen waargenomen; Talenkenner vanaf 3, Echte talenkenner vanaf 5.")}`;
    if (trait === "Builder" || trait === "Prolific Creator")
      return `${report.user.public_repos} ${t("public repos; Builder starts at 15, Prolific Creator at 40.", "publieke repos; Bouwer vanaf 15, Veelzijdige maker vanaf 40.")}`;
    if (trait.startsWith("Open Source"))
      return `${report.totalStars} ${t("sampled original-repository stars; Contributor starts at 100, Hero at 500.", "sterren in originele repositories; Bijdrager vanaf 100, Held vanaf 500.")}`;
    return `${leading} ${t("leads your selected language analysis and determines your stack trait.", "leidt in de gekozen taalanalyse en bepaalt je stackkenmerk.")}`;
  }
  return (
    <section className="panel summary-panel">
      <span className="eyebrow">
        {t("Meet your coding alter ego", "Ontmoet je code-alter ego")}
      </span>
      <h2 className="section-heading" style={{ marginTop: 14 }}>
        {leading
          ? `${leading} ${t("at heart. Curiosity in motion.", "in je hart. Nieuwsgierigheid in actie.")}`
          : t("A story still unfolding.", "Een verhaal in ontwikkeling.")}
      </h2>
      <p className="muted">
        {leading
          ? t(
              `Your palette starts with ${leading}, with ${report.languages.length} languages in this analysis. Your public trail touches ${report.activity.activeRepos} recently active repositories.`,
              `Je palet begint met ${leading}, met ${report.languages.length} talen in deze analyse. Je publieke spoor raakt ${report.activity.activeRepos} recent actieve repositories.`,
            )
          : t(
              "There is not enough public language data to describe your stack yet. Your next public project can add another piece to the picture.",
              "Er zijn nog niet genoeg publieke taalgegevens om je stack te beschrijven. Je volgende publieke project kan het beeld aanvullen.",
            )}
      </p>
      <div className="tags">
        {report.traits.map((trait) => (
          <span className="pill" key={trait}>
            ✦ {traitLabel(trait, locale)}
          </span>
        ))}
      </div>
      <details>
        <summary>{t("Why these traits?", "Waarom deze kenmerken?")}</summary>
        <ul className="evidence">
          {report.traits.map((trait) => (
            <li key={trait}>
              <strong>{traitLabel(trait, locale)}</strong> — {reason(trait)}
            </li>
          ))}
        </ul>
        <p className="caption">
          {t(
            "A rule-based, playful summary of public signals. Time ties prefer night, morning, evening, then afternoon. No hidden AI score.",
            "Een speelse samenvatting op basis van vaste regels en publieke signalen. Bij gelijke tijdvakken: nacht, ochtend, avond, middag. Geen verborgen AI-score.",
          )}
        </p>
      </details>
    </section>
  );
}
