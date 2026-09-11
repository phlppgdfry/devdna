const palette = [
  "#83f5c5",
  "#bca6ff",
  "#7dcfff",
  "#ffcc85",
  "#ff99bc",
  "#9eb0ff",
];
function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
}
/** A standalone vector keeps exports crisp without external fonts or images. */
export const cardThemes = {
  cyberpunk: {
    bg: "#1c2942",
    bg2: "#0c1220",
    text: "#edf3ff",
    muted: "#a3b1c9",
    accent: "#83f5c5",
    second: "#bca6ff",
    track: "#26334a",
  },
  terminal: {
    bg: "#05110a",
    bg2: "#071009",
    text: "#d7ffe4",
    muted: "#9abb9e",
    accent: "#71ff8d",
    second: "#bdffca",
    track: "#14371e",
  },
  minimal: {
    bg: "#17191d",
    bg2: "#101114",
    text: "#fafafa",
    muted: "#b7b7bd",
    accent: "#ffffff",
    second: "#d1d1d7",
    track: "#34363c",
  },
  light: {
    bg: "#f2f7ff",
    bg2: "#ffffff",
    text: "#152238",
    muted: "#475569",
    accent: "#087453",
    second: "#6846b4",
    track: "#dce4ee",
  },
};
/** @param {{user:any, traits:string[], languages:any[], totalStars:number, coverage:any, languageMode?:string, byteCoverage?:{completed:number,total:number}}} report */
export function createShareCard(
  { user, traits, languages, totalStars, coverage, languageMode, byteCoverage },
  { theme = "cyberpunk", locale = "en" } = {},
) {
  const c = cardThemes[theme] || cardThemes.cyberpunk;
  const tr = (en, nl) => (locale === "nl" ? nl : en);
  const languageLabel =
    languageMode === "bytes"
      ? tr("CODEBASE BYTES", "CODEVOLUME IN BYTES")
      : tr("REPOSITORY SHARE", "AANDEEL REPOSITORIES");
  const name = String(user.name || user.login);
  const title = name.length > 30 ? `${name.slice(0, 29)}…` : name;
  const bars = languages
    .slice(0, 6)
    .map((language, i) => {
      const y = 315 + i * 34;
      const pct = Math.max(0, Math.min(100, Number(language.pct) || 0));
      return `<text x="52" y="${y}" fill="${c.muted}" font-size="15">${escape(language.lang)}</text><rect x="225" y="${y - 12}" width="420" height="12" rx="6" fill="${c.track}"/><rect x="225" y="${y - 12}" width="${pct * 4.2}" height="12" rx="6" fill="${theme === "cyberpunk" ? palette[i] : i % 2 ? c.second : c.accent}"/><text x="672" y="${y}" fill="${theme === "cyberpunk" ? palette[i] : i % 2 ? c.second : c.accent}" font-size="15">${pct}%</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="640" viewBox="0 0 800 640" role="img" aria-labelledby="title desc">
<title id="title">${escape(user.login)} — DevDNA</title><desc id="desc">${tr("A playful profile based on sampled public GitHub data.", "Een speels profiel op basis van publieke GitHub-data.")}</desc>
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${c.bg}"/><stop offset="1" stop-color="${c.bg2}"/></linearGradient><linearGradient id="accent"><stop stop-color="#83f5c5"/><stop offset="1" stop-color="#bca6ff"/></linearGradient></defs>
<rect width="800" height="640" rx="28" fill="url(#bg)"/><rect x="1" y="1" width="798" height="638" rx="28" fill="none" stroke="#3b4964"/>
<g font-family="Arial, sans-serif"><text x="52" y="62" fill="${c.accent}" font-size="15" letter-spacing="3">DEVDNA / DEVELOPER IDENTITY LAB</text><text x="52" y="125" fill="${c.text}" font-size="36" font-weight="700">${escape(title)}</text><text x="52" y="160" fill="${c.muted}" font-size="19">@${escape(user.login)}</text>
${traits
  .slice(0, 4)
  .map(
    (trait, i) =>
      `<text x="${52 + (i % 2) * 350}" y="${207 + Math.floor(i / 2) * 29}" fill="${i % 2 ? c.second : c.accent}" font-size="17">✦ ${escape(trait)}</text>`,
  )
  .join("")}
<text x="52" y="282" fill="${c.muted}" font-size="12" letter-spacing="2">${tr("LANGUAGE PALETTE", "TALENPALET")} / ${languageLabel}</text>${bars || `<text x="52" y="320" fill="${c.muted}" font-size="16">${tr("No public language data in this sample yet.", "Nog geen publieke taalgegevens in deze steekproef.")}</text>`}
<path d="M52 531 H748" stroke="#344159"/><text x="52" y="563" fill="${c.text}" font-size="14">${escape(user.public_repos)} ${tr("public repos", "publieke repos")} · ${escape(totalStars)} ${tr("sampled stars", "sterren in steekproef")} · ${escape(coverage.pushes)} ${tr("sampled pushes", "pushes in steekproef")}</text><text x="52" y="585" fill="${c.muted}" font-size="11">${escape(coverage.timezone || "UTC")} · ${languageMode === "bytes" ? `${byteCoverage?.completed || 0}/${byteCoverage?.total || 0} ${tr("codebases", "codebases")}` : `${coverage.repositories ?? "—"} ${tr("sampled repos", "repos in steekproef")}`}</text><text x="52" y="618" fill="${c.muted}" font-size="12">${tr("Public data. Playful interpretation. Not a developer ranking.", "Publieke data. Speelse interpretatie. Geen ranglijst.")}</text><text x="748" y="618" text-anchor="end" fill="${c.accent}" font-size="12">devdna-xi.vercel.app</text></g></svg>`;
}
