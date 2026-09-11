"use client";
import Helix from "./helix";
import { useLocale } from "./preferences";
export default function Loading() {
  const { t } = useLocale();
  return (
    <main className="shell loading" role="status">
      <Helix />
      <h1>{t("Sequencing your DNA…", "Je DNA ontleden…")}</h1>
      <p className="muted">
        {t(
          "Reading public repositories and finding your patterns.",
          "Publieke repositories lezen en je patronen ontdekken.",
        )}
      </p>
    </main>
  );
}
