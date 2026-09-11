"use client";
import Link from "next/link";
import Search from "./search";
import Helix from "./helix";
import Recent from "./recent";
import { Nav, Footer, useLocale } from "./preferences";
export default function Home() {
  const { t } = useLocale();
  return (
    <main className="shell">
      <Nav />
      <section className="hero">
        <div>
          <span className="eyebrow">
            {t("The developer identity lab", "Het developer-identiteitslab")}
          </span>
          <h1>
            {t("Your code tells a", "Jouw code vertelt een")}{" "}
            <span className="gradient">{t("story.", "verhaal.")}</span>
          </h1>
          <p className="muted">
            {t(
              "Discover your coding alter ego. Compare profiles, explore your rhythm, and make a DNA card that feels like you.",
              "Ontdek je code-alter ego. Vergelijk profielen, ontdek je ritme en maak een DNA-kaart die bij je past.",
            )}
          </p>
          <Search />
          <div className="examples">
            {t("Take a peek:", "Neem een kijkje:")}{" "}
            <Link href="/octocat">octocat</Link>
            <Link href="/phlppgdfry">phlppgdfry</Link>
            <Link href="/antfu">antfu</Link>
          </div>
          <p className="caption" style={{ marginTop: 18 }}>
            {t(
              "English by default. No sign-up. Public data only. A playful portrait, never a developer ranking.",
              "Geen account nodig. Alleen publieke data. Een speels portret, geen ranglijst van developers.",
            )}
          </p>
        </div>
        <div className="panel specimen">
          <div className="specimen-top">
            <span className="eyebrow">
              {t("DNA specimen / preview", "DNA-specimen / voorbeeld")}
            </span>
            <span className="pill">{t("Illustrative", "Illustratief")}</span>
          </div>
          <Helix />
          <h2>
            {t("One profile.", "Eén profiel.")}
            <br />
            <span className="gradient">
              {t("Many superpowers.", "Veel superkrachten.")}
            </span>
          </h2>
          <div className="tags">
            <span className="pill">☾ {t("Night Owl", "Nachtuil")}</span>
            <span className="pill">⌘ {t("UI Craftsman", "UI-vakmens")}</span>
            <span className="pill">
              ✦ {t("True Polyglot", "Echte talenkenner")}
            </span>
          </div>
          <p className="caption" style={{ marginTop: 22 }}>
            {t(
              "Your own report explains the observations behind every trait. These are example traits.",
              "Jouw rapport verklaart de observaties achter elk kenmerk. Dit zijn voorbeeldkenmerken.",
            )}
          </p>
        </div>
      </section>
      <Recent />
      <section className="feature-grid">
        {[
          [
            t("01 / DISCOVER", "01 / ONTDEK"),
            t("More than a language list", "Meer dan een talenlijst"),
            t(
              "Explore codebase bytes, click through to repositories, and see your rhythm in your timezone.",
              "Bekijk codevolume, klik door naar repositories en ontdek je ritme in jouw tijdzone.",
            ),
          ],
          [
            t("02 / COMPARE", "02 / VERGELIJK"),
            t("Find your common ground", "Ontdek wat jullie delen"),
            t(
              "Compare two profiles side by side or save snapshots to follow your own evolution.",
              "Vergelijk twee profielen naast elkaar of bewaar momentopnames van je eigen evolutie.",
            ),
          ],
          [
            t("03 / CREATE", "03 / MAAK"),
            t("Make it yours", "Maak het persoonlijk"),
            t(
              "Choose a card theme and export a crisp PNG or SVG. Your next portfolio detail is ready.",
              "Kies een kaartthema en exporteer een scherpe PNG of SVG voor je portfolio.",
            ),
          ],
        ].map(([n, title, body]) => (
          <article className="panel" key={n}>
            <span className="eyebrow">{n}</span>
            <h3>{title}</h3>
            <p className="muted">{body}</p>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
