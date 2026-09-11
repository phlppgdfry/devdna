"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
type Locale = "en" | "nl";
const Context = createContext({
  locale: "en" as Locale,
  setLocale: (_locale: Locale) => {},
  t: (en: string, _nl: string) => en,
});
export function Preferences({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    try {
      if (localStorage.getItem("devdna-locale") === "nl") setLocaleState("nl");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem("devdna-locale", next);
    } catch {}
  }
  return (
    <Context.Provider
      value={{ locale, setLocale, t: (en, nl) => (locale === "en" ? en : nl) }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLocale = () => useContext(Context);
export function Nav() {
  const { locale, setLocale, t } = useLocale();
  return (
    <nav className="nav">
      <Link className="brand" href="/">
        ✳ dev<span>dna</span>
      </Link>
      <div className="actions">
        <Link className="button" href="/compare">
          {t("Compare profiles", "Profielen vergelijken")}
        </Link>
        <label className="locale">
          <span className="sr-only">{t("Language", "Taal")}</span>
          <select
            aria-label="Language / Taal"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
          </select>
        </label>
      </div>
    </nav>
  );
}
export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="footer">
      <Link href="/">
        ✳{" "}
        {t(
          "Everyone has a different code story.",
          "Iedereen heeft een eigen codeverhaal.",
        )}
      </Link>
      <span>
        {t(
          "Public data · Playful interpretation",
          "Publieke data · Speelse interpretatie",
        )}
      </span>
    </footer>
  );
}
const labels: Record<string, string> = {
  "Night Owl": "Nachtuil",
  "Early Bird": "Vroege vogel",
  "Evening Coder": "Avondprogrammeur",
  "Nine-to-Fiver": "Overdagbouwer",
  "Mobile Architect": "Mobiele architect",
  "UI Craftsman": "UI-vakmens",
  "Backend Pragmatist": "Backend-pragmaticus",
  "Systems Thinker": "Systeemdenker",
  "True Polyglot": "Echte talenkenner",
  Polyglot: "Talenkenner",
  "Prolific Creator": "Veelzijdige maker",
  Builder: "Bouwer",
  "Open Source Hero": "Open-sourceheld",
  "Open Source Contributor": "Open-sourcebijdrager",
  Unknown: "Onbekend",
  "Clean & Intentional": "Helder en doelgericht",
  Documenter: "Documenteerder",
  "Bug Hunter": "Bugjager",
  "Chaotic Genius": "Chaotisch genie",
  "YOLO Committer": "YOLO-committer",
  "Emoji Committer 🎨": "Emoji-committer 🎨",
};
export function traitLabel(trait: string, locale: string) {
  return locale === "nl" ? labels[trait] || trait : trait;
}
