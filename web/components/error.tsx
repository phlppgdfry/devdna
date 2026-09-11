"use client";
import { Nav, useLocale } from "./preferences";
export default function ErrorView({ reset }: { reset: () => void }) {
  const { t } = useLocale();
  return (
    <main className="shell">
      <Nav />
      <div className="loading">
        <h1>
          {t("The lab needs a moment.", "Het lab heeft even tijd nodig.")}
        </h1>
        <p className="muted">
          {t(
            "GitHub could not supply this report. Please try again later; the API may be busy or rate-limited.",
            "GitHub kon dit rapport niet leveren. Probeer later opnieuw; de API kan druk zijn of een limiet bereikt hebben.",
          )}
        </p>
        <button
          className="button primary"
          style={{ marginTop: 20 }}
          onClick={reset}
        >
          {t("Try again", "Opnieuw proberen")}
        </button>
      </div>
    </main>
  );
}
