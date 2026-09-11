/** Fetch a bounded sample; the fetcher is injected so pagination is testable. */
export async function collectRepositories(
  fetchPage,
  limit = 300,
  count = limit,
) {
  const cap = limit === 1000 ? 1000 : 300;
  const pages = Math.max(1, Math.ceil(Math.min(cap, Math.max(0, count)) / 100));
  const data = await Promise.all(
    Array.from({ length: pages }, (_, i) => fetchPage(i + 1)),
  );
  const seen = new Set();
  return data
    .flat()
    .filter((repo) => {
      if (seen.has(repo.id)) return false;
      seen.add(repo.id);
      return true;
    })
    .slice(0, cap);
}
