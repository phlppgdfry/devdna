"use client";
import { useMemo, useState } from "react";
import type { DNAData } from "../lib/github";
import { createShareCard } from "../lib/share-card.js";
import { useLocale, traitLabel } from "./preferences";
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ReportActions({
  username,
  report,
}: {
  username: string;
  report: DNAData;
}) {
  const { locale, t } = useLocale();
  const [status, setStatus] = useState("");
  const [theme, setTheme] = useState("cyberpunk");
  const [busy, setBusy] = useState(false);
  const svg = useMemo(
    () =>
      createShareCard(
        { ...report, traits: report.traits.map((s) => traitLabel(s, locale)) },
        { theme, locale },
      ),
    [report, theme, locale],
  );
  async function copy(markdown = false) {
    try {
      await navigator.clipboard.writeText(
        markdown
          ? `[🧬 ${username} — DevDNA](${window.location.href})`
          : window.location.href,
      );
      setStatus(t("Copied to clipboard.", "Gekopieerd naar klembord."));
    } catch {
      setStatus(
        t(
          "Clipboard unavailable. Copy the URL from the address bar.",
          "Klembord niet beschikbaar. Kopieer de URL uit de adresbalk.",
        ),
      );
    }
  }
  async function png() {
    setBusy(true);
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("canvas");
      ctx.drawImage(img, 0, 0, 1600, 1280);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(Error("png"))),
          "image/png",
        ),
      );
      saveBlob(blob, `devdna-${username}-${theme}.png`);
      setStatus(
        t(
          "PNG card downloaded (1600 × 1280).",
          "PNG-kaart gedownload (1600 × 1280).",
        ),
      );
    } catch {
      setStatus(
        t(
          "PNG export failed. Try SVG instead.",
          "PNG-export mislukt. Probeer SVG.",
        ),
      );
    } finally {
      URL.revokeObjectURL(url);
      setBusy(false);
    }
  }
  return (
    <section className="panel export-panel">
      <h2 className="section-heading">
        {t("Your DNA, your style", "Jouw DNA, jouw stijl")}
      </h2>
      <p className="caption">
        {t(
          "The preview and exports use your current language, timezone and analysis mode.",
          "Voorbeeld en exports gebruiken je huidige taal, tijdzone en analysemethode.",
        )}
      </p>
      <div className="export-grid">
        <div>
          <label className="field-label">
            {t("Card theme", "Kaartthema")}
            <select
              aria-label={t("Card theme", "Kaartthema")}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="cyberpunk">Cyberpunk</option>
              <option value="terminal">Terminal</option>
              <option value="minimal">Minimal</option>
              <option value="light">{t("Light", "Licht")}</option>
            </select>
          </label>
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="button primary" onClick={png} disabled={busy}>
              {busy
                ? t("Rendering…", "Bezig…")
                : t("Download PNG", "PNG downloaden")}
            </button>
            <button
              className="button"
              onClick={() => {
                saveBlob(
                  new Blob([svg], { type: "image/svg+xml" }),
                  `devdna-${username}-${theme}.svg`,
                );
                setStatus(t("SVG card downloaded.", "SVG-kaart gedownload."));
              }}
            >
              SVG
            </button>
            <button
              className="button"
              onClick={() => {
                saveBlob(
                  new Blob([JSON.stringify(report, null, 2)], {
                    type: "application/json",
                  }),
                  `devdna-${username}.json`,
                );
                setStatus(t("JSON downloaded.", "JSON gedownload."));
              }}
            >
              JSON
            </button>
          </div>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="button" onClick={() => copy()}>
              {t("Copy profile link", "Profiellink kopiëren")}
            </button>
            <button className="button" onClick={() => copy(true)}>
              README
            </button>
            <button className="button" onClick={() => window.print()}>
              {t("Print / PDF", "Afdrukken / PDF")}
            </button>
          </div>
          <p className="status" role="status">
            {status}
          </p>
        </div>
        <img
          className="card-preview"
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
          alt={t(
            "Preview of your downloadable DNA card",
            "Voorbeeld van je downloadbare DNA-kaart",
          )}
          width={800}
          height={640}
        />
      </div>
    </section>
  );
}
