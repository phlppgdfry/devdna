import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUsername } from "../web/lib/username.js";
import { createShareCard } from "../web/lib/share-card.js";
test("search accepts usernames, handles, and profile URLs", () => {
  for (const input of [
    " octocat ",
    "@octocat",
    "https://github.com/octocat/",
    "github.com/octocat",
    "https://www.github.com/octocat?tab=repositories",
  ])
    assert.equal(normalizeUsername(input), "octocat");
});
test("search rejects other hosts, repository URLs, and malformed names", () => {
  for (const input of [
    "https://evil.example/octocat",
    "https://github.com/octocat/repo",
    "https://github.com.evil.example/octocat",
    "bad--name",
    "-name",
    "",
    "a".repeat(40),
  ])
    assert.equal(normalizeUsername(input), null);
});
test("export escapes profile strings so they remain SVG text", () => {
  const svg = createShareCard({
    user: { login: "octocat", name: '<script>&"', public_repos: 2 },
    traits: ['<image onload="bad">'],
    languages: [{ lang: "A&B", pct: 999 }],
    totalStars: 1,
    coverage: { pushes: 3 },
  });
  assert.ok(svg.includes("&lt;script&gt;&amp;&quot;"));
  assert.ok(svg.includes("A&amp;B"));
  assert.ok(!svg.includes("<script>"));
  assert.ok(!svg.includes("<image"));
  assert.ok(svg.includes("100%"));
});
test("empty profiles still produce an honest card", () => {
  const svg = createShareCard({
    user: { login: "octocat", public_repos: 0 },
    traits: [],
    languages: [],
    totalStars: 0,
    coverage: { pushes: 0 },
  });
  assert.ok(svg.includes("No public language data"));
  assert.ok(!svg.includes("undefined"));
});
