const BASE = 'https://api.github.com';

function headers() {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'devdna-cli/1.0',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    }),
  };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  if (res.status === 404) throw new Error(`User not found: "${path.split('/')[2]}"`);
  if (res.status === 403) {
    const reset = res.headers.get('x-ratelimit-reset');
    const resetTime = reset ? new Date(reset * 1000).toLocaleTimeString() : 'soon';
    throw new Error(`Rate limit exceeded (resets at ${resetTime}) — set GITHUB_TOKEN to increase limits`);
  }
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchUser(username) {
  return get(`/users/${username}`);
}

export async function fetchRepos(username) {
  const pages = await Promise.all(
    [1, 2, 3].map(p =>
      get(`/users/${username}/repos?per_page=100&page=${p}&sort=pushed&type=owner`)
        .catch(() => [])
    )
  );
  const all = pages.flat();
  // Remove duplicates (last page may return empty or repeat)
  const seen = new Set();
  return all.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export async function fetchEvents(username) {
  const pages = await Promise.all(
    [1, 2, 3].map(p =>
      get(`/users/${username}/events/public?per_page=100&page=${p}`)
        .catch(() => [])
    )
  );
  return pages.flat();
}
