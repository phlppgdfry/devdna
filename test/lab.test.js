import test from "node:test";
import assert from "node:assert/strict";
import { analyzeTiming } from "../web/lib/analyzer.js";
import {
  byteLanguages,
  compareReports,
  readLocal,
  snapshotDelta,
  validSnapshot,
  viewReport,
} from "../web/lib/insights.js";
import { collectRepositories } from "../web/lib/pagination.js";
import { createShareCard } from "../web/lib/share-card.js";
const event = (created_at) => ({ type: "PushEvent", created_at });
test("timezone applies DST at each timestamp, not the current UTC offset", () => {
  const result = analyzeTiming(
    [event("2026-01-01T12:00:00Z"), event("2026-07-01T12:00:00Z")],
    "Europe/Brussels",
  );
  assert.equal(result.hours[13], 1);
  assert.equal(result.hours[14], 1);
});
test("fractional offsets and day boundaries are respected", () => {
  const result = analyzeTiming(
    [event("2026-01-01T23:40:00Z")],
    "Asia/Kathmandu",
  );
  assert.equal(result.hours[5], 1);
  assert.equal(result.days[5], 1);
});
test("codebase bytes include secondary languages and exclude forks and invalid values", () => {
  const result = byteLanguages(
    [
      { id: 1, fork: false },
      { id: 2, fork: false },
      { id: 3, fork: true },
    ],
    {
      1: { Python: 300, HTML: 100 },
      2: { HTML: 600, Invalid: -1 },
      3: { Rust: 9999 },
    },
  );
  assert.deepEqual(result, [
    { lang: "HTML", bytes: 700, pct: 70, repos: 2 },
    { lang: "Python", bytes: 300, pct: 30, repos: 1 },
  ]);
  assert.deepEqual(byteLanguages([{ id: 1 }], {}), []);
});
test("comparison normalizes activity volume and handles missing activity", () => {
  const a = {
    languages: [{ lang: "Python" }],
    traits: ["Builder"],
    hours: [2, ...Array(23).fill(0)],
  };
  const b = { ...a, hours: [100, ...Array(23).fill(0)] };
  assert.equal(compareReports(a, b).overlap, 100);
  assert.deepEqual(compareReports(a, b).sharedLanguages, ["Python"]);
  assert.equal(
    compareReports(a, { ...b, hours: Array(24).fill(0) }).overlap,
    null,
  );
  assert.equal(
    compareReports(a, { ...b, hours: [0, 100, ...Array(22).fill(0)] }).overlap,
    0,
  );
});
test("extended pagination fetches beyond 300 and stays bounded at 1000", async () => {
  const pages = [];
  const result = await collectRepositories(
    async (page) => {
      pages.push(page);
      return Array.from({ length: 100 }, (_, i) => ({ id: page * 100 + i }));
    },
    1000,
    2500,
  );
  assert.equal(result.length, 1000);
  assert.equal(Math.max(...pages), 10);
  assert.equal(
    (await collectRepositories(async (page) => [{ id: page }], 300, 401))
      .length,
    3,
  );
  await assert.rejects(
    collectRepositories(
      async () => {
        throw Error("rate limit");
      },
      1000,
      900,
    ),
    /rate limit/,
  );
});
const snap = {
  version: 1,
  id: "one",
  savedAt: "2026-09-01T00:00:00Z",
  username: "octocat",
  publicRepos: 2,
  followers: 10,
  stars: 2,
  languages: [{ lang: "Python", pct: 100 }],
  traits: [],
  timezone: "UTC",
  mode: "repositories",
  limit: 300,
  sampled: 2,
  bytesComplete: true,
};
test("snapshot comparisons report deltas and reject mismatched methods and timezones", () => {
  const current = {
    ...snap,
    publicRepos: 3,
    stars: 5,
    languages: [
      { lang: "Python", pct: 80 },
      { lang: "Go", pct: 20 },
    ],
  };
  assert.equal(snapshotDelta(snap, current).repos, 1);
  assert.equal(snapshotDelta(snap, current).stars, 3);
  assert.deepEqual(snapshotDelta(snap, current).languages, [
    { lang: "Python", delta: -20 },
    { lang: "Go", delta: 20 },
  ]);
  for (const override of [
    { mode: "bytes" },
    { timezone: "Europe/Brussels" },
    { limit: 1000 },
    { bytesComplete: false },
  ]) {
    const delta = snapshotDelta(snap, { ...current, ...override });
    assert.equal(delta.compatible, false);
    assert.equal(delta.stars, null);
    assert.deepEqual(delta.languages, []);
  }
});
test("malformed or blocked local storage degrades safely", () => {
  assert.deepEqual(
    readLocal({ getItem: () => "{broken" }, "x", validSnapshot),
    [],
  );
  assert.deepEqual(
    readLocal(
      {
        getItem: () => {
          throw Error("blocked");
        },
      },
      "x",
      validSnapshot,
    ),
    [],
  );
  assert.deepEqual(
    readLocal(
      { getItem: () => JSON.stringify([null, snap, { version: 1 }]) },
      "x",
      validSnapshot,
    ),
    [snap],
  );
});
test("card themes and language mode preserve accurate labels", () => {
  const report = {
    user: { login: "octocat", public_repos: 2 },
    traits: [],
    languages: [],
    totalStars: 2,
    coverage: { pushes: 0, timezone: "UTC", repositories: 2 },
    languageMode: "bytes",
    byteCoverage: { completed: 1, total: 2 },
  };
  const svg = createShareCard(report, { theme: "light", locale: "nl" });
  assert.ok(svg.includes("#f2f7ff"));
  assert.ok(svg.includes("CODEVOLUME IN BYTES"));
  assert.ok(svg.includes("1/2 codebases"));
});
