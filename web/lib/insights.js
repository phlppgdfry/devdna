import { analyzeTiming, computeDNATraits } from "./analyzer.js";
export function byteLanguages(repositories, values) {
  const totals = new Map();
  const counts = new Map();
  for (const repo of repositories.filter((r) => !r.fork)) {
    for (const [lang, value] of Object.entries(values[repo.id] || {})) {
      if (!Number.isFinite(value) || value <= 0) continue;
      totals.set(lang, (totals.get(lang) || 0) + value);
      counts.set(lang, (counts.get(lang) || 0) + 1);
    }
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals]
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => ({
      lang,
      bytes,
      pct: Math.round((bytes / total) * 1000) / 10,
      repos: counts.get(lang),
    }));
}
/** @param {any} report @param {string} timezone @param {Record<string, Record<string, number>> | null} values */
export function viewReport(report, timezone, values = null) {
  const timing = analyzeTiming(
    report.pushTimestamps.map((created_at) => ({
      type: "PushEvent",
      created_at,
    })),
    timezone,
  );
  const languages = values
    ? byteLanguages(report.repositories, values)
    : report.languages;
  const traits = computeDNATraits({
    user: report.user,
    languages,
    timing,
    stats: { totalStars: report.totalStars },
    activity: report.activity,
  });
  return {
    ...report,
    languages,
    traits,
    hours: timing.hours,
    days: timing.days,
    peakHour: timing.peakHour,
    languageMode: values ? "bytes" : "repositories",
    byteCoverage: values
      ? {
          completed: report.repositories.filter(
            (r) => !r.fork && Object.hasOwn(values, r.id),
          ).length,
          total: report.repositories.filter((r) => !r.fork).length,
        }
      : undefined,
    coverage: {
      ...report.coverage,
      timezone,
      languageMethod: values
        ? "GitHub language bytes across analyzed original repositories"
        : "Primary language per non-fork repository",
    },
  };
}
export function compareReports(a, b) {
  const sharedLanguages = a.languages
    .filter((l) => b.languages.some((other) => other.lang === l.lang))
    .map((l) => l.lang);
  const sharedTraits = a.traits.filter((t) => b.traits.includes(t));
  const totalA = a.hours.reduce((n, x) => n + x, 0),
    totalB = b.hours.reduce((n, x) => n + x, 0);
  const overlap =
    totalA && totalB
      ? Math.round(
          a.hours.reduce(
            (n, x, i) => n + Math.min(x / totalA, b.hours[i] / totalB),
            0,
          ) * 100,
        )
      : null;
  return { sharedLanguages, sharedTraits, overlap };
}
export function snapshot(
  report,
  id = "current",
  savedAt = new Date().toISOString(),
) {
  return {
    version: 1,
    id,
    savedAt,
    sourceAt: report.generatedAt,
    username: report.user.login,
    publicRepos: report.user.public_repos,
    stars: report.totalStars,
    followers: report.user.followers,
    languages: report.languages,
    traits: report.traits,
    hours: report.hours,
    timezone: report.coverage.timezone,
    mode: report.languageMode,
    limit: report.coverage.repositoryLimit,
    sampled: report.coverage.repositories,
    bytesComplete:
      report.languageMode !== "bytes" ||
      report.byteCoverage?.completed === report.byteCoverage?.total,
  };
}
export function snapshotDelta(old, current) {
  const compatible =
    old.version === 1 &&
    current.version === 1 &&
    old.username.toLowerCase() === current.username.toLowerCase() &&
    old.timezone === current.timezone &&
    old.mode === current.mode &&
    old.limit === current.limit &&
    old.bytesComplete &&
    current.bytesComplete;
  return {
    compatible,
    repos: current.publicRepos - old.publicRepos,
    followers: current.followers - old.followers,
    stars: compatible ? current.stars - old.stars : null,
    languages: compatible
      ? [
          ...new Set(
            [...old.languages, ...current.languages].map((l) => l.lang),
          ),
        ].map((lang) => ({
          lang,
          delta:
            Math.round(
              ((current.languages.find((l) => l.lang === lang)?.pct || 0) -
                (old.languages.find((l) => l.lang === lang)?.pct || 0)) *
                10,
            ) / 10,
        }))
      : [],
  };
}
export function readLocal(storage, key, validate) {
  try {
    const value = JSON.parse(storage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter(validate) : [];
  } catch {
    return [];
  }
}
export function validSnapshot(s) {
  return (
    s &&
    s.version === 1 &&
    typeof s.id === "string" &&
    typeof s.username === "string" &&
    typeof s.savedAt === "string" &&
    Number.isFinite(Date.parse(s.savedAt)) &&
    ["publicRepos", "stars", "followers", "limit", "sampled"].every((k) =>
      Number.isFinite(s[k]),
    ) &&
    typeof s.timezone === "string" &&
    ["bytes", "repositories"].includes(s.mode) &&
    Array.isArray(s.languages) &&
    s.languages.every(
      (l) => typeof l.lang === "string" && Number.isFinite(l.pct),
    ) &&
    Array.isArray(s.traits) &&
    s.traits.every((t) => typeof t === "string")
  );
}
