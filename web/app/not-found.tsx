"use client";
import Link from "next/link";
import { Nav, useLocale } from "../components/preferences";
export default function NotFound() {
  const { t } = useLocale();
  return (
    <main className="shell">
      <Nav />
      <div className="loading">
        <span className="eyebrow">
          {t("Specimen not found", "Specimen niet gevonden")}
        </span>
        <h1>
          {t(
            "That profile is still a mystery.",
            "Dat profiel blijft een mysterie.",
          )}
        </h1>
        <p className="muted">
          {t(
            "Check the GitHub username and give it another go.",
            "Controleer de GitHub-gebruikersnaam en probeer opnieuw.",
          )}
        </p>
        <Link className="button primary" style={{ marginTop: 20 }} href="/">
          {t("Back to the lab", "Terug naar het lab")}
        </Link>
      </div>
    </main>
  );
}
