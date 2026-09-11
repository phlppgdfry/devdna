import { collectRepositories } from "./pagination.js";
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

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: makeHeaders(),
    signal: AbortSignal.timeout(15000),
    next: { revalidate: 3600 }, // cache 1 hour
  });
  if (res.status === 404) throw new GitHubError("User not found", 404);
  if (
    res.status === 429 ||
    (res.status === 403 &&
      (res.headers.get("x-ratelimit-remaining") === "0" ||
        res.headers.has("retry-after")))
  ) {
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    throw new GitHubError(
      "Rate limit exceeded",
      429,
      reset ? new Date(reset * 1000).toISOString() : undefined,
    );
  }
  if (!res.ok) throw new Error(`GitHub error: ${res.status}`);
  return res.json();
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAt?: string,
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
  const {
    login,
    name,
    bio,
    avatar_url,
    location,
    followers,
    following,
    public_repos,
    created_at,
    html_url,
  } = await get<GHUser>(`/users/${username}`);
  return {
    login,
    name,
    bio,
    avatar_url,
    location,
    followers,
    following,
    public_repos,
    created_at,
    html_url,
  };
}

export async function fetchRepos(username: string, limit = 300, count = limit) {
  const repos = (await collectRepositories(
    (page: number) =>
      get<GHRepo[]>(
        `/users/${username}/repos?per_page=100&page=${page}&sort=pushed&type=owner`,
      ),
    limit,
    count,
  )) as GHRepo[];
  // Keep large scans below response limits by sending only fields the UI needs.
  return repos.map(
    ({
      id,
      name,
      description,
      language,
      stargazers_count,
      forks_count,
      fork,
      size,
      topics,
      html_url,
    }) => ({
      id,
      name,
      description,
      language,
      stargazers_count,
      forks_count,
      fork,
      size,
      topics,
      html_url,
    }),
  );
}

export async function fetchEvents(username: string) {
  const events: GHEvent[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await get<GHEvent[]>(
      `/users/${username}/events/public?per_page=100&page=${page}`,
    );
    events.push(...batch);
    if (batch.length < 100) break;
  }
  return events;
}

export interface DNAData {
  repositories: GHRepo[];
  pushTimestamps: string[];
  generatedAt: string;
  languageMode: "repositories" | "bytes";
  byteCoverage?: { completed: number; total: number };
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

export async function getDNA(
  username: string,
  extended = false,
): Promise<DNAData> {
  if (
    !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) ||
    username.includes("--")
  )
    throw new GitHubError("Invalid username", 404);
  const user = await fetchUser(username);
  const limit = extended ? 1000 : 300;
  const [repos, events] = await Promise.all([
    fetchRepos(user.login, limit, user.public_repos),
    fetchEvents(user.login),
  ]);

  const result = analyze({ user, repos, events });
  return {
    user,
    repositories: repos,
    generatedAt: new Date().toISOString(),
    languageMode: "repositories",
    pushTimestamps: events
      .filter(
        (e) =>
          e.type === "PushEvent" && Number.isFinite(Date.parse(e.created_at)),
      )
      .map((e) => e.created_at),
    languages: result.languages,
    peakHour: result.timing.peakHour,
    hours: result.timing.hours,
    days: result.timing.days,
    totalStars: result.stats.totalStars,
    topRepos: result.stats.topRepos,
    traits: result.dnaTraits,
    commitStyle: result.commitStyle,
    topTopics: result.stats.topTopics,
    coverage: { ...result.coverage, repositoryLimit: limit },
    activity: result.activity,
  };
}
