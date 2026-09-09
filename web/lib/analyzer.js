const MOBILE_LANGS = new Set(["Swift", "Kotlin", "Dart", "Objective-C"]);
const FRONTEND_LANGS = new Set([
  "JavaScript",
  "TypeScript",
  "CSS",
  "HTML",
  "Vue",
  "Svelte",
]);
const BACKEND_LANGS = new Set([
  "Go",
  "Rust",
  "Java",
  "Python",
  "Ruby",
  "PHP",
  "C#",
  "C++",
  "C",
  "Elixir",
  "Haskell",
  "Scala",
]);

export function analyze({ user, repos, events }) {
  const languages = analyzeLanguages(repos);
  const timing = analyzeTiming(events);
  const activity = analyzeActivity(events);
  const stats = analyzeStats(repos);
  const dnaTraits = computeDNATraits({
    user,
    languages,
    timing,
    stats,
    activity,
  });
  const commitStyle = computeCommitStyle(events);

  return {
    user,
    languages,
    timing,
    activity,
    stats,
    dnaTraits,
    commitStyle,
    coverage: {
      repositories: repos.length,
      events: events.length,
      pushes: timing.pushCount,
      timezone: "UTC",
      languageMethod: "Primary language per non-fork repository",
      repositoryLimit: 300,
      eventLimit: 300,
    },
  };
}

function analyzeLanguages(repos) {
  const bytes = Object.create(null);
  const repoCounts = Object.create(null);

  for (const repo of repos) {
    if (!repo.language || repo.fork) continue;
    bytes[repo.language] = (bytes[repo.language] || 0) + 1;
    repoCounts[repo.language] = (repoCounts[repo.language] || 0) + 1;
  }

  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, size]) => ({
      lang,
      pct: Math.round((size / total) * 100),
      repos: repoCounts[lang] || 0,
    }));
}

function analyzeTiming(events) {
  const hours = new Array(24).fill(0);
  const days = new Array(7).fill(0);
  let pushCount = 0;

  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const date = new Date(event.created_at);
    if (Number.isNaN(date.getTime())) continue;
    hours[date.getUTCHours()]++;
    days[date.getUTCDay()]++;
    pushCount++;
  }

  const peakHour = pushCount ? hours.indexOf(Math.max(...hours)) : null;

  // Compute which period has the most activity
  const morning = hours.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoon = hours.slice(12, 18).reduce((a, b) => a + b, 0);
  const evening = hours.slice(18, 24).reduce((a, b) => a + b, 0);
  const night = hours.slice(0, 6).reduce((a, b) => a + b, 0);

  return {
    hours,
    days,
    peakHour,
    pushCount,
    morning,
    afternoon,
    evening,
    night,
  };
}

function analyzeActivity(events) {
  const recentPushes = events.filter((e) => e.type === "PushEvent");
  const repos = new Set(recentPushes.map((e) => e.repo?.name).filter(Boolean));
  const stars = events.filter((e) => e.type === "WatchEvent").length;
  const forks = events.filter((e) => e.type === "ForkEvent").length;
  const prs = events.filter((e) => e.type === "PullRequestEvent").length;

  return {
    recentPushCount: recentPushes.length,
    activeRepos: repos.size,
    stars,
    forks,
    prs,
  };
}

function analyzeStats(repos) {
  const original = repos.filter((r) => !r.fork);
  const totalStars = original.reduce(
    (a, r) => a + (r.stargazers_count || 0),
    0,
  );
  const totalForks = original.reduce((a, r) => a + (r.forks_count || 0), 0);
  const totalWatchers = original.reduce(
    (a, r) => a + (r.watchers_count || 0),
    0,
  );

  const topRepos = original
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3);

  const topics = original
    .flatMap((r) => r.topics || [])
    .reduce((acc, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, Object.create(null));

  const topTopics = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  return {
    totalStars,
    totalForks,
    totalWatchers,
    topRepos,
    topTopics,
    originalCount: original.length,
  };
}

function computeDNATraits({ user, languages, timing, stats, activity }) {
  const traits = [];
  const topLang = languages[0]?.lang;

  // TIME TRAITS
  const maxPeriod = Math.max(
    timing.morning,
    timing.afternoon,
    timing.evening,
    timing.night,
  );
  if (!timing.pushCount) {
    /* No timing trait without observations. */
  } else if (maxPeriod === timing.night) traits.push("Night Owl");
  else if (maxPeriod === timing.morning) traits.push("Early Bird");
  else if (maxPeriod === timing.evening) traits.push("Evening Coder");
  else traits.push("Nine-to-Fiver");

  // STACK TRAIT
  if (topLang && MOBILE_LANGS.has(topLang)) traits.push("Mobile Architect");
  else if (topLang && FRONTEND_LANGS.has(topLang)) traits.push("UI Craftsman");
  else if (topLang && BACKEND_LANGS.has(topLang))
    traits.push("Backend Pragmatist");
  else if (topLang) traits.push("Systems Thinker");

  // POLYGLOT TRAIT
  const langCount = languages.length;
  if (langCount >= 5) traits.push("True Polyglot");
  else if (langCount >= 3) traits.push("Polyglot");

  // CREATOR TRAIT
  if (user.public_repos >= 40) traits.push("Prolific Creator");
  else if (user.public_repos >= 15) traits.push("Builder");

  // SOCIAL TRAIT
  if (stats.totalStars >= 500) traits.push("Open Source Hero");
  else if (stats.totalStars >= 100) traits.push("Open Source Contributor");

  return traits;
}

function computeCommitStyle(events) {
  const pushEvents = events.filter((e) => e.type === "PushEvent");
  if (pushEvents.length === 0) return "Unknown";

  const sizes = pushEvents
    .flatMap((e) => e.payload?.commits || [])
    .filter((c) => c.message?.trim())
    .map((c) => c.message.length);
  if (!sizes.length) return "Unknown";

  const avgLen =
    sizes.length > 0 ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;

  const messages = pushEvents
    .flatMap((e) => e.payload?.commits || [])
    .filter((c) => c.message?.trim())
    .map((c) => c.message.toLowerCase());

  const emojiCount = messages.filter((m) =>
    /[\u{1F300}-\u{1FFFF}]/u.test(m),
  ).length;
  const fixCount = messages.filter((m) => /\bfix\b|\bbug\b/.test(m)).length;
  const wip = messages.filter((m) =>
    /\bwip\b|\btemp\b|\btest\b|\btodo\b/.test(m),
  ).length;

  if (emojiCount / messages.length > 0.3) return "Emoji Committer 🎨";
  if (wip / messages.length > 0.2) return "Chaotic Genius";
  if (avgLen > 80) return "Documenter";
  if (fixCount / messages.length > 0.3) return "Bug Hunter";
  if (avgLen < 15) return "YOLO Committer";
  return "Clean & Intentional";
}
