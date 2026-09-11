import Compare from "../../components/compare";
import { getDNA, GitHubError } from "../../lib/github";
import { normalizeUsername } from "../../lib/username.js";
export const revalidate = 3600;
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string; extended?: string }>;
}) {
  const query = await searchParams;
  const names: [string, string] = [query.left || "", query.right || ""];
  const extended = query.extended === "1";
  const results = await Promise.allSettled(
    names.map(async (name) => {
      if (!name) return null;
      const normalized = normalizeUsername(name);
      if (!normalized) throw new GitHubError("Invalid username", 404);
      return getDNA(normalized, extended);
    }),
  );
  const errors = results.map((result) =>
    result.status === "rejected"
      ? result.reason instanceof GitHubError && result.reason.status === 404
        ? "not-found"
        : result.reason instanceof GitHubError && result.reason.status === 429
          ? "rate-limit"
          : "unavailable"
      : null,
  ) as [string | null, string | null];
  return (
    <Compare
      left={results[0].status === "fulfilled" ? results[0].value : null}
      right={results[1].status === "fulfilled" ? results[1].value : null}
      names={names}
      errors={errors}
      extended={extended}
    />
  );
}
