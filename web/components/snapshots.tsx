"use client";
import { useEffect, useState } from "react";
import type { DNAData } from "../lib/github";
import {
  readLocal,
  snapshot,
  snapshotDelta,
  validSnapshot,
} from "../lib/insights.js";
import { useLocale } from "./preferences";
type Snapshot = ReturnType<typeof snapshot>;
const key = "devdna-snapshots-v1";
const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;
export default function Snapshots({ report }: { report: DNAData }) {
  const { t, locale } = useLocale();
  const [items, setItems] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    try {
      setItems(readLocal(localStorage, key, validSnapshot));
    } catch {}
  }, []);
  const mine = items.filter(
    (s) => s.username.toLowerCase() === report.user.login.toLowerCase(),
  );
  const old = mine.find((s) => s.id === selected) || mine[0];
  const current = snapshot(report);
  const delta = old ? snapshotDelta(old, current) : null;
  function save() {
    try {
      const latest: Snapshot[] = readLocal(localStorage, key, validSnapshot);
      const saved = snapshot(report, crypto.randomUUID());
      const next = [saved, ...latest].slice(0, 100);
      localStorage.setItem(key, JSON.stringify(next));
      setItems(next);
      setSelected(old?.id || saved.id);
      setStatus(
        t(
          "Snapshot saved in this browser.",
          "Momentopname opgeslagen in deze browser.",
        ),
      );
    } catch {
      setStatus(
        t(
          "Could not save. Browser storage is unavailable or full.",
          "Opslaan mislukt. Browseropslag is niet beschikbaar of vol.",
        ),
      );
    }
  }
  function remove() {
    if (!old) return;
    try {
      const next = readLocal(localStorage, key, validSnapshot).filter(
        (s: Snapshot) => s.id !== old.id,
      );
      localStorage.setItem(key, JSON.stringify(next));
      setItems(next);
      setSelected("");
      setStatus(t("Snapshot removed.", "Momentopname verwijderd."));
    } catch {
      setStatus(
        t(
          "Could not update browser storage.",
          "Browseropslag kon niet worden bijgewerkt.",
        ),
      );
    }
  }
  return (
    <section className="panel">
      <h2 className="section-heading">
        {t("Your DNA, evolving", "Je DNA in ontwikkeling")}
      </h2>
      <p className="caption">
        {t(
          "Save a snapshot today and compare on a later visit. Up to 100 snapshots are kept in this browser only. Clearing browser data removes them.",
          "Bewaar vandaag een momentopname en vergelijk bij een volgend bezoek. Maximaal 100 momentopnames blijven alleen in deze browser. Browserdata wissen verwijdert ze.",
        )}
      </p>
      <div className="actions" style={{ marginTop: 16 }}>
        <button
          className="button primary"
          onClick={save}
          disabled={
            report.languageMode === "bytes" &&
            report.byteCoverage?.completed !== report.byteCoverage?.total
          }
        >
          {t("Save snapshot", "Momentopname bewaren")}
        </button>
        {mine.length > 0 && (
          <>
            <label className="field-label">
              {t("Compare current report with", "Vergelijk huidig rapport met")}
              <select
                aria-label={t(
                  "Compare current report with",
                  "Vergelijk huidig rapport met",
                )}
                value={old?.id || ""}
                onChange={(e) => setSelected(e.target.value)}
              >
                {mine.map((s) => (
                  <option key={s.id} value={s.id}>
                    {new Date(s.savedAt).toLocaleString(locale)} ·{" "}
                    {s.mode === "bytes"
                      ? t("bytes", "bytes")
                      : t("repos", "repos")}{" "}
                    · {s.timezone}
                  </option>
                ))}
              </select>
            </label>
            <button className="button" onClick={remove}>
              {t("Delete selected", "Geselecteerde verwijderen")}
            </button>
          </>
        )}
      </div>
      {delta && (
        <>
          <div className="stats">
            <div className="stat">
              <small>{t("Public repos", "Publieke repos")}</small>
              <strong>{signed(delta.repos)}</strong>
            </div>
            <div className="stat">
              <small>{t("Followers", "Volgers")}</small>
              <strong>{signed(delta.followers)}</strong>
            </div>
            <div className="stat">
              <small>{t("Sampled stars", "Sterren in steekproef")}</small>
              <strong>
                {delta.stars === null ? "—" : signed(delta.stars)}
              </strong>
            </div>
          </div>
          {delta.compatible ? (
            <>
              <p className="caption">
                {t(
                  "Language share change (percentage points):",
                  "Verschil in taalaandeel (procentpunten):",
                )}
              </p>
              <div className="tags">
                {delta.languages.map((l: { lang: string; delta: number }) => (
                  <span className="pill" key={l.lang}>
                    {l.lang} {signed(l.delta)} pp
                  </span>
                ))}
              </div>
              <p className="caption" style={{ marginTop: 12 }}>
                {t(
                  "Sample sizes and public activity windows can change. Changes are observations, not a productivity score. Cached data may show no change.",
                  "Steekproefgroottes en publieke activiteitvensters kunnen veranderen. Verschillen zijn observaties, geen productiviteitsscore. Gecachte data kan geen verandering tonen.",
                )}
              </p>
            </>
          ) : (
            <p className="caption">
              {t(
                "Language and star comparisons need the same timezone, analysis method and repository limit, with a complete byte scan. Match those settings to compare.",
                "Vergelijken van talen en sterren vereist dezelfde tijdzone, analysemethode en repositorylimiet, met een volledige bytescan. Kies dezelfde instellingen.",
              )}
            </p>
          )}
        </>
      )}
      <p className="status" role="status">
        {status}
      </p>
    </section>
  );
}
