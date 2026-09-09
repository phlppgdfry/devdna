import { analyze } from "./analyzer.js";
const BASE = "https://api.github.com";

function makeHeaders() {
  return {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "devdna-web/1.0",
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    }),
  };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: makeHeaders(),
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 3600 }, // cache 1 hour
  });
  if (res.status === 404) throw new GitHubError("User not found", 404);
  if (res.status === 403 || res.status === 429)
    throw new Error("Rate limit exceeded");
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`);
  return res.json();
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
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
    [1, 2, 3].map((p) =>
      get<GHRepo[]>(
        `/users/${username}/repos?per_page=100&page=${p}&sort=pushed&type=owner`,
      ),
    ),
  );
  const seen = new Set<number>();
  return pages.flat().filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export async function fetchEvents(username: string) {
  const pages = await Promise.all(
    [1, 2, 3].map((p) =>
      get<GHEvent[]>(`/users/${username}/events/public?per_page=100&page=${p}`),
    ),
  );
  return pages.flat();
}

export interface DNAData {
  user: GHUser;
  languages: Array<{ lang: string; pct: number; repos: number }>;
  peakHour: number | null;
  coverage: {
    repositories: number;
    events: number;
    pushes: number;
    timezone: string;
    languageMethod: string;
    repositoryLimit: number;
    eventLimit: number;
  };
  activity: {
    recentPushCount: number;
    activeRepos: number;
    stars: number;
    forks: number;
    prs: number;
  };
  days: number[];
  hours: number[];
  totalStars: number;
  topRepos: GHRepo[];
  traits: string[];
  commitStyle: string;
  topTopics: string[];
}

export async function getDNA(username: string): Promise<DNAData> {
  if (
    !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) ||
    username.includes("--")
  )
    throw new GitHubError("Invalid username", 404);
  const [user, repos, events] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
    fetchEvents(username),
  ]);

  const result = analyze({ user, repos, events });
  return {
    user,
    languages: result.languages,
    peakHour: result.timing.peakHour,
    hours: result.timing.hours,
    days: result.timing.days,
    totalStars: result.stats.totalStars,
    topRepos: result.stats.topRepos,
    traits: result.dnaTraits,
    commitStyle: result.commitStyle,
    topTopics: result.stats.topTopics,
    coverage: result.coverage,
    activity: result.activity,
  };
}
