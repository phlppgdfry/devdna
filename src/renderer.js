import chalk from "chalk";

const COLS = Math.max(40, Math.min(process.stdout.columns || 72, 80));
const BAR_MAX = 26;

const LANG_COLORS = {
  Swift: "red",
  Kotlin: "magenta",
  Dart: "blue",
  JavaScript: "yellow",
  TypeScript: "cyan",
  Python: "green",
  Go: "cyan",
  Rust: "red",
  Ruby: "red",
  Java: "yellow",
  "C#": "magenta",
  "C++": "blue",
  CSS: "magenta",
  HTML: "red",
};

function langColor(lang) {
  return LANG_COLORS[lang] || "white";
}

function bar(pct, color = "cyan", max = BAR_MAX) {
  const filled = Math.round((pct / 100) * max);
  const empty = max - filled;
  return (
    chalk[color]("█".repeat(Math.max(0, filled))) +
    chalk.gray("░".repeat(Math.max(0, empty)))
  );
}

function traitBar(value, max, color = "green") {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return bar(pct, color);
}

function sep(title = "") {
  if (title) {
    const line = "─".repeat(COLS - title.length - 6);
    console.log(`\n  ${chalk.bold.white(title)} ${chalk.gray(line)}`);
  } else {
    console.log(`  ${chalk.gray("─".repeat(COLS - 4))}`);
  }
}

function hourLabel(h) {
  return String(h).padStart(2, "0") + "h";
}

export function render({
  user,
  languages,
  timing,
  stats,
  dnaTraits,
  commitStyle,
  activity,
}) {
  // ═══ HEADER ═══
  const border = "═".repeat(COLS - 2);
  console.log(chalk.cyan.bold("╔" + border + "╗"));

  const tag = "🧬  D E V   D N A";
  const loginTag = chalk.bold.white(user.login);
  const padLeft = 3;
  const padRight = COLS - 2 - padLeft - tag.length - loginTag.length - 4;
  console.log(
    chalk.cyan.bold("║") +
      " ".repeat(padLeft) +
      chalk.cyan.bold(tag) +
      " ".repeat(Math.max(1, padRight)) +
      loginTag +
      "  " +
      chalk.cyan.bold("║"),
  );

  console.log(chalk.cyan.bold("╚" + border + "╝"));

  // ═══ BIO ═══
  console.log();
  const name = chalk.bold.white((user.name || user.login).toUpperCase());
  console.log(`  ${name}`);
  console.log(`  ${chalk.yellow(dnaTraits.join("  ·  "))}`);
  if (user.bio) console.log(`  ${chalk.gray(user.bio)}`);

  const loc = user.location ? `  📍 ${user.location}` : "";
  const joined = new Date(user.created_at).getFullYear();
  console.log(
    `  ${chalk.gray("★")} ${chalk.white(stats.totalStars)} stars  ·  ${chalk.white(user.public_repos)} repos  ·  since ${joined}${loc}`,
  );

  // ═══ LANGUAGES ═══
  sep("LANGUAGES · REPO SHARE");
  for (const { lang, pct, repos } of languages) {
    const label = lang.padEnd(13);
    const pctStr = (pct + "%").padStart(4);
    const repoStr = chalk.gray(`${repos} repos`);
    console.log(
      `  ${chalk.gray(label)} ${bar(pct, langColor(lang))}  ${chalk.white(pctStr)}  ${repoStr}`,
    );
  }

  // ═══ COMMIT RHYTHM ═══
  sep("PUSH RHYTHM · UTC");
  if (!timing.pushCount) console.log("  No public push events in this sample.");
  const maxHour = Math.max(...timing.hours, 1);

  // Show 8 slots of 3h each
  const slots = [0, 3, 6, 9, 12, 15, 18, 21];
  for (const h of slots) {
    const count =
      timing.hours[h] + (timing.hours[h + 1] || 0) + (timing.hours[h + 2] || 0);
    const isPeak =
      h === timing.peakHour ||
      h + 1 === timing.peakHour ||
      h + 2 === timing.peakHour;
    const label = hourLabel(h).padEnd(5);
    const bColor = isPeak ? "yellow" : "magenta";
    const peakTag = isPeak ? chalk.yellow.bold("  ← peak") : "";
    const barMax = maxHour * 3;
    const b = traitBar(count, Math.max(barMax, 1), bColor);
    console.log(`  ${chalk.gray(label)} ${b}${peakTag}`);
  }

  sep("ACTIVITY SAMPLE");
  console.log(
    `  ${activity.recentPushCount} pushes · ${activity.activeRepos} active repos · ${activity.prs} PR events`,
  );
  console.log("  Public sample only: up to 300 repositories and 300 events.");

  // ═══ TOP REPOS ═══
  sep("TOP REPOS");
  for (const repo of stats.topRepos) {
    const stars = chalk.yellow("★ " + repo.stargazers_count);
    const lang = repo.language ? chalk.gray(" · " + repo.language) : "";
    const forks =
      repo.forks_count > 0 ? chalk.gray(` · ⑂ ${repo.forks_count}`) : "";
    console.log(`  ${chalk.bold.white(repo.name)}  ${stars}${lang}${forks}`);
    if (repo.description) {
      const desc =
        repo.description.length > COLS - 6
          ? repo.description.slice(0, COLS - 9) + "..."
          : repo.description;
      console.log(`  ${chalk.gray(desc)}`);
    }
  }

  if (stats.topTopics.length > 0) {
    console.log(
      `\n  ${stats.topTopics.map((t) => chalk.cyan("#" + t)).join("  ")}`,
    );
  }

  // ═══ COMMIT STYLE ═══
  sep("COMMIT STYLE");
  console.log(`  ${chalk.white(commitStyle)}`);

  // ═══ FOOTER ═══
  console.log();
  sep();
  console.log(
    `  ${chalk.cyan("🧬")} ${chalk.underline.cyan(`https://devdna-xi.vercel.app/${user.login}`)}`,
  );
  console.log(`  ${chalk.gray("Set GITHUB_TOKEN for higher rate limits")}`);
  console.log();
}
