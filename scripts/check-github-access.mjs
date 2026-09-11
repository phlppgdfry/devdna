const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is not configured in this process.");
  process.exit(1);
}
try {
  const response = await fetch("https://api.github.com/rate_limit", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "devdna-access-check/2.0",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    console.error(
      `GitHub rejected the credential check (HTTP ${response.status}).`,
    );
    process.exit(1);
  }
  const scopes = response.headers.get("x-oauth-scopes");
  if (scopes === null) {
    console.error(
      "GitHub did not report classic token scopes. Verify permissions in GitHub settings; least privilege is not verified.",
    );
    process.exit(1);
  }
  if (scopes.trim()) {
    console.error(
      "This token has assigned scopes. Use a dedicated classic token with no selected scopes.",
    );
    process.exit(1);
  }
  const body = await response.json();
  const core = body.resources?.core;
  if (!core || !Number.isFinite(core.limit)) {
    console.error("GitHub returned an unexpected rate-limit response.");
    process.exit(1);
  }
  console.log(
    JSON.stringify(
      {
        authentication: "valid",
        access: "public information, read-only (no scopes)",
        limit: core.limit,
        remaining: core.remaining,
        resetAt: new Date(core.reset * 1000).toISOString(),
      },
      null,
      2,
    ),
  );
} catch {
  console.error(
    "Could not complete the GitHub access check. Check connectivity and retry.",
  );
  process.exit(1);
}
