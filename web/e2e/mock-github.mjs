// Loaded only by the Playwright webServer command, never by application code.
if (process.env.VERCEL || process.env.DEVDNA_E2E !== "1") {
  throw new Error("The GitHub fixture requires a local E2E test process.");
}
const originalFetch = globalThis.fetch;
const avatar = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88"><rect width="88" height="88" fill="#83f5c5"/></svg>')}`;
const people = {
  "test-alice": {
    name: "Alice Example",
    languages: ["TypeScript", "Python"],
    hours: [2, 3],
  },
  "test-bob": {
    name: "Bob Example",
    languages: ["Python", "Go"],
    hours: [2, 4],
  },
  "test-empty": { name: "Empty Example", languages: [], hours: [] },
  "test-scan": {
    name: "Scan Example",
    languages: ["Python", "TypeScript"],
    hours: [12],
  },
};
const json = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers });
function repo(username, language, i) {
  return {
    id: i + 1,
    name: `project-${i + 1}`,
    description: `A fixture ${language} project.`,
    language,
    stargazers_count: i + 2,
    forks_count: 0,
    fork: false,
    size: 50,
    topics: ["testing"],
    html_url: `https://github.com/${username}/project-${i + 1}`,
  };
}
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(
    typeof input === "string" || input instanceof URL ? input : input.url,
  );
  if (url.hostname !== "api.github.com") return originalFetch(input, init);
  if (
    new Headers(
      init.headers || (input instanceof Request ? input.headers : undefined),
    ).has("authorization")
  )
    throw new Error("E2E tests must not use GitHub credentials.");
  const parts = url.pathname.split("/").filter(Boolean);
  const username = parts[1];
  if (username === "test-limited")
    return json({ message: "Fixture rate limit" }, 403, {
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": "4102444800",
    });
  if (username === "test-broken")
    return json({ message: "Fixture unavailable" }, 503);
  const person = people[username];
  if (!person) return json({ message: "Not Found" }, 404);
  if (parts[0] === "repos" && parts[3] === "languages") {
    if (username === "test-scan")
      return json({ message: "Fixture scan limit" }, 403, {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "4102444800",
      });
    return json(
      parts[2] === "project-1"
        ? { TypeScript: 900, HTML: 100 }
        : { Python: 1000 },
    );
  }
  if (parts[0] !== "users")
    throw new Error(`Unexpected fixture endpoint: ${url.pathname}`);
  if (parts.length === 2)
    return json({
      login: username,
      name: person.name,
      bio: "A deterministic public test profile.",
      avatar_url: avatar,
      location: null,
      followers: 10,
      following: 2,
      public_repos: person.languages.length,
      created_at: "2020-01-01T00:00:00Z",
      html_url: `https://github.com/${username}`,
    });
  if (parts[2] === "repos")
    return json(
      Number(url.searchParams.get("page") || 1) > 1
        ? []
        : person.languages.map((l, i) => repo(username, l, i)),
    );
  if (parts[2] === "events")
    return json(
      Number(url.searchParams.get("page") || 1) > 1
        ? []
        : person.hours.map((hour, i) => ({
            type: "PushEvent",
            created_at: `2026-09-01T${String(hour).padStart(2, "0")}:00:00Z`,
            repo: { name: `${username}/project-1` },
            payload: {
              commits: [{ message: "feat: add an accessible feature" }],
            },
            id: String(i),
          })),
    );
  throw new Error(`Unexpected fixture endpoint: ${url.pathname}`);
};
