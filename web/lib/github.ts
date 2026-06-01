const BASE = 'https://api.github.com';

function makeHeaders() {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'devdna-web/1.0',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    }),
  };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: makeHeaders(),
    next: { revalidate: 3600 }, // cache 1 hour
  });
  if (res.status === 404) throw new Error('User not found');
  if (res.status === 403) throw new Error('Rate limit exceeded');
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`);
  return res.json();
}

export interface GHUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  html_url: string;
}

export interface GHRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  size: number;
  topics: string[];
  html_url: string;
}

export interface GHEvent {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    commits?: Array<{ message: string }>;
  };
}

export async function fetchUser(username: string) {
  return get<GHUser>(`/users/${username}`);
}

export async function fetchRepos(username: string) {
  const pages = await Promise.all(
    [1, 2].map(p =>
      get<GHRepo[]>(`/users/${username}/repos?per_page=100&page=${p}&sort=pushed&type=owner`)
        .catch(() => [] as GHRepo[])
    )
  );
  const seen = new Set<number>();
  return pages.flat().filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export async function fetchEvents(username: string) {
  const pages = await Promise.all(
    [1, 2].map(p =>
      get<GHEvent[]>(`/users/${username}/events/public?per_page=100&page=${p}`)
        .catch(() => [] as GHEvent[])
    )
  );
  return pages.flat();
}

export interface DNAData {
  user: GHUser;
  languages: Array<{ lang: string; pct: number; repos: number }>;
  peakHour: number;
  hours: number[];
  totalStars: number;
  topRepos: GHRepo[];
  traits: string[];
  commitStyle: string;
  topTopics: string[];
}

export async function getDNA(username: string): Promise<DNAData> {
  const [user, repos, events] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
    fetchEvents(username),
  ]);

  // Languages
  const bytes: Record<string, number> = {};
  const repoCounts: Record<string, number> = {};
  for (const repo of repos) {
    if (!repo.language || repo.fork) continue;
    bytes[repo.language] = (bytes[repo.language] || 0) + Math.max(repo.size, 1);
    repoCounts[repo.language] = (repoCounts[repo.language] || 0) + 1;
  }
  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  const languages = Object.entries(bytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, size]) => ({
      lang,
      pct: Math.round((size / Math.max(total, 1)) * 100),
      repos: repoCounts[lang] || 0,
    }));

  // Timing
  const hours = new Array(24).fill(0);
  for (const e of events) {
    if (e.type !== 'PushEvent') continue;
    hours[new Date(e.created_at).getHours()]++;
  }
  const peakHour = hours.indexOf(Math.max(...hours));

  // Stats
  const original = repos.filter(r => !r.fork);
  const totalStars = original.reduce((a, r) => a + r.stargazers_count, 0);
  const topRepos = original.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);

  // Topics
  const topicMap: Record<string, number> = {};
  for (const r of original) for (const t of r.topics || []) topicMap[t] = (topicMap[t] || 0) + 1;
  const topTopics = Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  // Traits
  const traits: string[] = [];
  const nightHours = hours.slice(0, 5).reduce((a, b) => a + b, 0) + hours.slice(22).reduce((a, b) => a + b, 0);
  const dayHours = hours.slice(9, 18).reduce((a, b) => a + b, 0);
  traits.push(nightHours > dayHours ? 'Night Owl' : peakHour < 10 ? 'Early Bird' : 'Nine-to-Fiver');

  const MOBILE = ['Swift', 'Kotlin', 'Dart', 'Objective-C'];
  const FRONTEND = ['JavaScript', 'TypeScript', 'CSS', 'HTML', 'Vue', 'Svelte'];
  const topLang = languages[0]?.lang;
  if (topLang && MOBILE.includes(topLang)) traits.push('Mobile Architect');
  else if (topLang && FRONTEND.includes(topLang)) traits.push('UI Craftsman');
  else if (topLang) traits.push('Backend Pragmatist');

  if (languages.length >= 5) traits.push('True Polyglot');
  else if (languages.length >= 3) traits.push('Polyglot');
  if (user.public_repos >= 30) traits.push('Prolific Creator');
  if (totalStars >= 100) traits.push('Open Source Contributor');

  // Commit style
  const messages = events
    .filter(e => e.type === 'PushEvent')
    .flatMap(e => e.payload?.commits || [])
    .map(c => (c.message || '').toLowerCase());
  const emojiRate = messages.filter(m => /[\u{1F300}-\u{1FFFF}]/u.test(m)).length / Math.max(messages.length, 1);
  const wipRate = messages.filter(m => /\bwip\b|\btemp\b/.test(m)).length / Math.max(messages.length, 1);
  const avgLen = messages.reduce((a, m) => a + m.length, 0) / Math.max(messages.length, 1);
  let commitStyle = 'Clean & Intentional';
  if (emojiRate > 0.3) commitStyle = 'Emoji Committer 🎨';
  else if (wipRate > 0.2) commitStyle = 'Chaotic Genius';
  else if (avgLen > 80) commitStyle = 'Documenter';
  else if (avgLen < 15) commitStyle = 'YOLO Committer';

  return { user, languages, peakHour, hours, totalStars, topRepos, traits, commitStyle, topTopics };
}
