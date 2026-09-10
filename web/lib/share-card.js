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
export function createShareCard({
  user,
  traits,
  languages,
  totalStars,
  coverage,
}) {
  const name = String(user.name || user.login);
  const title = name.length > 30 ? `${name.slice(0, 29)}…` : name;
  const bars = languages
    .slice(0, 6)
    .map((language, i) => {
      const y = 315 + i * 34;
      const pct = Math.max(0, Math.min(100, Number(language.pct) || 0));
      return `<text x="52" y="${y}" fill="#cad5e8" font-size="15">${escape(language.lang)}</text><rect x="225" y="${y - 12}" width="420" height="12" rx="6" fill="#26334a"/><rect x="225" y="${y - 12}" width="${pct * 4.2}" height="12" rx="6" fill="${palette[i]}"/><text x="672" y="${y}" fill="${palette[i]}" font-size="15">${pct}%</text>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="640" viewBox="0 0 800 640" role="img" aria-labelledby="title desc">
<title id="title">${escape(user.login)} — DevDNA</title><desc id="desc">A playful profile based on sampled public GitHub data. Language shares count original repositories.</desc>
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#1c2942"/><stop offset="1" stop-color="#0c1220"/></linearGradient><linearGradient id="accent"><stop stop-color="#83f5c5"/><stop offset="1" stop-color="#bca6ff"/></linearGradient></defs>
<rect width="800" height="640" rx="28" fill="url(#bg)"/><rect x="1" y="1" width="798" height="638" rx="28" fill="none" stroke="#3b4964"/>
<g font-family="Arial, sans-serif"><text x="52" y="62" fill="#83f5c5" font-size="15" letter-spacing="3">DEVDNA / DEVELOPER IDENTITY LAB</text><text x="52" y="125" fill="#edf3ff" font-size="36" font-weight="700">${escape(title)}</text><text x="52" y="160" fill="#a3b1c9" font-size="19">@${escape(user.login)}</text>
${traits
  .slice(0, 4)
  .map(
    (trait, i) =>
      `<text x="${52 + (i % 2) * 350}" y="${207 + Math.floor(i / 2) * 29}" fill="${i % 2 ? "#bca6ff" : "#83f5c5"}" font-size="17">✦ ${escape(trait)}</text>`,
  )
  .join("")}
<text x="52" y="282" fill="#a3b1c9" font-size="12" letter-spacing="2">LANGUAGE PALETTE / REPOSITORY SHARE</text>${bars || '<text x="52" y="320" fill="#a3b1c9" font-size="16">No public language data in this sample yet.</text>'}
<path d="M52 531 H748" stroke="#344159"/><text x="52" y="563" fill="#edf3ff" font-size="16">${escape(user.public_repos)} public repos · ${escape(totalStars)} sampled stars · ${escape(coverage.pushes)} sampled pushes</text><text x="52" y="605" fill="#a3b1c9" font-size="12">Public data. Playful interpretation. Not a developer ranking.</text><text x="748" y="605" text-anchor="end" fill="#83f5c5" font-size="12">devdna-xi.vercel.app</text></g></svg>`;
}
