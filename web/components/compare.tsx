"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DNAData } from "../lib/github";
import { normalizeUsername } from "../lib/username.js";
import { viewReport, compareReports } from "../lib/insights.js";
import { Nav, Footer, useLocale, traitLabel } from "./preferences";
import Timezone from "./timezone";
import { Languages, Rhythm } from "./charts";
export default function Compare({
  left,
  right,
  names,
  errors,
  extended,
}: {
  left: DNAData | null;
  right: DNAData | null;
  names: [string, string];
  errors: [string | null, string | null];
  extended: boolean;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [zone, setZone] = useState("UTC");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const a = useMemo(
    () => (left ? (viewReport(left, zone) as DNAData) : null),
    [left, zone],
  );
  const b = useMemo(
    () => (right ? (viewReport(right, zone) as DNAData) : null),
    [right, zone],
  );
  const common = a && b ? compareReports(a, b) : null;
  return (
    <main className="shell">
      <Nav />
      <span className="eyebrow">
        {t("Find your common ground", "Ontdek wat jullie delen")}
      </span>
      <h1 className="compare-title">
        {t(
          "Two profiles. Two code stories.",
          "Twee profielen. Twee codeverhalen.",
        )}
      </h1>
      <p className="muted">
        {t(
          "Explore languages, rhythms and shared traits side by side. No winners, just different patterns.",
          "Bekijk talen, ritmes en gedeelde kenmerken naast elkaar. Geen winnaars, wel verschillende patronen.",
        )}
      </p>
      <form
        className="compare-form"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const l = normalizeUsername(form.get("left")),
            r = normalizeUsername(form.get("right"));
          if (!l || !r) {
            setError(
              t(
                "Enter two valid usernames or GitHub profile URLs.",
                "Vul twee geldige gebruikersnamen of GitHub-profiel-URLs in.",
              ),
            );
            return;
          }
          setError("");
          startTransition(() =>
            router.push(
              `/compare?left=${encodeURIComponent(l)}&right=${encodeURIComponent(r)}${form.get("extended") ? "&extended=1" : ""}`,
            ),
          );
        }}
      >
        <label className="field-label">
          {t("First profile", "Eerste profiel")}
          <input
            name="left"
            defaultValue={names[0]}
            key={`l-${names[0]}`}
            placeholder="octocat"
            required
            maxLength={200}
          />
        </label>
        <label className="field-label">
          {t("Second profile", "Tweede profiel")}
          <input
            name="right"
            defaultValue={names[1]}
            key={`r-${names[1]}`}
            placeholder="phlppgdfry"
            required
            maxLength={200}
          />
        </label>
        <button className="button primary" disabled={pending}>
          {pending
            ? t("Comparing…", "Vergelijken…")
            : t("Compare DNA ↗", "Vergelijk DNA ↗")}
        </button>
        <label className="caption">
          <input type="checkbox" name="extended" defaultChecked={extended} />{" "}
          {t(
            "Extended scan (up to 1,000 repos each)",
            "Uitgebreide scan (tot 1.000 repos per profiel)",
          )}
        </label>
      </form>
      <p role="status" className="status">
        {error}
      </p>
      <Timezone value={zone} onChange={setZone} />
      {common && (
        <section className="panel comparison-insights">
          <h2 className="section-heading">
            {t("Where your worlds meet", "Waar jullie werelden samenkomen")}
          </h2>
          <div className="tags">
            {common.sharedLanguages.length ? (
              common.sharedLanguages.map((lang: string) => (
                <span className="pill" key={lang}>
                  {lang}
                </span>
              ))
            ) : (
              <p className="caption">
                {t(
                  "No shared languages observed.",
                  "Geen gedeelde talen waargenomen.",
                )}
              </p>
            )}
          </div>
          <p className="muted" style={{ marginTop: 16 }}>
            {t("Shared traits", "Gedeelde kenmerken")}:{" "}
            {common.sharedTraits.length
              ? common.sharedTraits
                  .map((trait: string) => traitLabel(trait, locale))
                  .join(" · ")
              : t("None observed", "Geen waargenomen")}
          </p>
          <p className="muted">
            {t("Hourly rhythm overlap", "Overlap van het uurritme")}:{" "}
            <strong>
              {common.overlap === null
                ? t("Not enough data", "Onvoldoende gegevens")
                : `${common.overlap}%`}
            </strong>
          </p>
          <p className="caption">
            {t(
              "Overlap sums the smaller share of pushes in each hour, after normalizing each profile separately. It describes these public samples, not compatibility or productivity. Languages use primary-repository share on both sides.",
              "Overlap telt het kleinste aandeel pushes per uur op, na normalisatie per profiel. Het beschrijft deze publieke steekproeven, geen compatibiliteit of productiviteit. Talen gebruiken aan beide kanten het primaire repository-aandeel.",
            )}
          </p>
          {a?.user.login.toLowerCase() === b?.user.login.toLowerCase() && (
            <p className="caption">
              {t(
                "You selected the same profile twice. Choose another to explore differences.",
                "Je hebt twee keer hetzelfde profiel gekozen. Kies een ander om verschillen te ontdekken.",
              )}
            </p>
          )}
        </section>
      )}
      <div className="compare-columns">
        {[a, b].map((report, i) => (
          <div className="compare-column" key={i}>
            {report ? (
              <>
                <section className="panel profile-hero">
                  <img
                    className="avatar"
                    src={report.user.avatar_url}
                    alt={report.user.login}
                    width={60}
                    height={60}
                  />
                  <div>
                    <h2>{report.user.name || report.user.login}</h2>
                    <Link
                      className="muted"
                      href={`/${report.user.login}${extended ? "?extended=1" : ""}`}
                    >
                      @{report.user.login} ↗
                    </Link>
                    <p className="caption">
                      {report.coverage.repositories} /{" "}
                      {report.user.public_repos} repos ·{" "}
                      {report.coverage.pushes} pushes · ★ {report.totalStars}
                    </p>
                  </div>
                </section>
                <Languages report={report} />
                <Rhythm report={report} />
                <div className="tags">
                  {report.traits.map((trait) => (
                    <span className="pill" key={trait}>
                      {traitLabel(trait, locale)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <section className="panel empty">
                <h2>
                  {i === 0
                    ? t("First profile", "Eerste profiel")
                    : t("Second profile", "Tweede profiel")}
                </h2>
                <p className="muted">
                  {errors[i] === "not-found"
                    ? t(
                        "Profile not found. Check the username.",
                        "Profiel niet gevonden. Controleer de gebruikersnaam.",
                      )
                    : errors[i] === "rate-limit"
                      ? t(
                          "GitHub’s request limit was reached. Please try again later.",
                          "De GitHub-verzoeklimiet is bereikt. Probeer later opnieuw.",
                        )
                      : errors[i]
                        ? t(
                            "GitHub could not load this profile. Try again later.",
                            "GitHub kon dit profiel niet laden. Probeer later opnieuw.",
                          )
                        : t(
                            "Choose a profile above to start exploring.",
                            "Kies hierboven een profiel om te beginnen.",
                          )}
                </p>
              </section>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </main>
  );
}
