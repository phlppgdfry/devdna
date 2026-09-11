# Production GitHub access

DevDNA needs only public GitHub profile, repository, event and language data. Keep credentials on the server, separate from the GitHub CLI credential used to develop this repository.

## Dedicated credential

Use a dedicated **classic personal access token with no selected scopes**, named `DevDNA production public-read`, with a 90-day expiration. GitHub documents that a token with no scopes has read-only access to public information. Do not select `repo`, `public_repo`, `workflow`, `gist`, organization, user, or administration scopes: DevDNA does not require them.

Create it through the account owner's GitHub settings. GitHub may require a personal sudo-mode confirmation. Do not copy the token into chat, source files, screenshots, shell command arguments, CI logs or release notes.

Reference: [GitHub OAuth scope documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps).

## Vercel configuration

In the existing **devdna** Vercel project:

1. Open Settings → Environment Variables.
2. Add `GITHUB_TOKEN`, mark it Sensitive, and select **Production** only.
3. Paste the dedicated token into the secret value field and save it.
4. Redeploy production so the new variable is available to server functions.
5. Verify the live profile and comparison pages. Do not expose a diagnostic endpoint containing token values or GitHub response headers.

Development and preview deployments can run anonymously or use separate dedicated credentials. Never name the variable `NEXT_PUBLIC_GITHUB_TOKEN`, and never reuse the short-lived GitHub Actions `GITHUB_TOKEN` for hosting.

## Validate without revealing the credential

The optional check reads `GITHUB_TOKEN` from an already configured process environment and prints only scope/rate-limit metadata:

```sh
node scripts/check-github-access.mjs
```

It rejects a classic token with assigned scopes. It does not claim that a token is least-privileged if GitHub omits the scope header; review that token's permissions in GitHub settings instead. Exit status is nonzero for missing, expired, invalid or overprivileged credentials.

## Rotation and limits

Record the expiration date privately and replace the token before it expires. Save the replacement in Vercel, redeploy and verify, then revoke the old token. Do not put secret values in the rotation record.

Authenticated access increases the API allowance but does not make it unlimited. Multiple visitors share the credential's allowance. Codebase scans add one language request per original repository; the interface preserves partial results and reports when a retry may succeed. Cached API responses have a one-hour lifetime.

A successful build or browser-test run is not proof that a production token has been configured. Check the actual Vercel environment and deployment separately.
