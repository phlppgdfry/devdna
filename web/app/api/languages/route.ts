import { fetchRepos, fetchUser, get, GitHubError } from "../../../lib/github";
import { normalizeUsername } from "../../../lib/username.js";
export const maxDuration = 60;
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const username = normalizeUsername(params.get("username"));
  const offset = Number(params.get("offset") || 0);
  if (!username || !Number.isInteger(offset) || offset < 0 || offset >= 1000)
    return Response.json({ error: "Invalid request" }, { status: 400 });
  try {
    const user = await fetchUser(username);
    const repos = (
      await fetchRepos(
        user.login,
        params.get("extended") === "1" ? 1000 : 300,
        user.public_repos,
      )
    ).filter((r) => !r.fork);
    const selected = repos.slice(offset, offset + 10);
    const results: Array<{
      id: number;
      languages: Record<string, number> | null;
    }> = [];
    for (let i = 0; i < selected.length; i += 5) {
      const batch = await Promise.all(
        selected.slice(i, i + 5).map(async (repo) => ({
          id: repo.id,
          languages: await get<Record<string, number>>(
            `/repos/${encodeURIComponent(user.login)}/${encodeURIComponent(repo.name)}/languages`,
          ),
        })),
      );
      results.push(...batch);
    }
    return Response.json(
      { results, total: repos.length, nextOffset: offset + selected.length },
      { headers: { "Cache-Control": "private, max-age=3600" } },
    );
  } catch (error) {
    return Response.json(
      {
        retryAt: error instanceof GitHubError ? error.retryAt : undefined,
        error:
          error instanceof GitHubError && error.status === 404
            ? "Profile or repository no longer available"
            : "GitHub could not finish this batch. Wait and retry.",
      },
      {
        status:
          error instanceof GitHubError && error.status === 404
            ? 404
            : error instanceof GitHubError && error.status === 429
              ? 429
              : 503,
      },
    );
  }
}
