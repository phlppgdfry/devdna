import test from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/analyzer.js";
const user = { public_repos: 0 };
const repo = (language, size = 1, extra = {}) => ({
  language,
  size,
  stargazers_count: 0,
  forks_count: 0,
  watchers_count: 0,
  ...extra,
});
test("empty profiles do not invent time or commit traits", () => {
  const dna = analyze({ user, repos: [], events: [] });
  assert.equal(dna.timing.peakHour, null);
  assert.equal(dna.commitStyle, "Unknown");
  assert.deepEqual(dna.dnaTraits, []);
  assert.deepEqual(dna.languages, []);
});
test("pushes without messages do not imply YOLO commit style", () => {
  const dna = analyze({
    user,
    repos: [],
    events: [
      {
        type: "PushEvent",
        created_at: "2026-09-01T23:00:00-02:00",
        payload: {},
      },
    ],
  });
  assert.equal(dna.commitStyle, "Unknown");
  assert.equal(dna.timing.hours[1], 1);
  assert.equal(dna.timing.days[3], 1);
  assert.ok(dna.dnaTraits.includes("Night Owl"));
  assert.equal(dna.activity.activeRepos, 0);
});
test("language share counts original repositories, not repository disk size", () => {
  const dna = analyze({
    user,
    repos: [
      repo("JavaScript", 99999),
      repo("Python", 1),
      repo("Rust", 99999, { fork: true }),
    ],
    events: [],
  });
  assert.deepEqual(
    dna.languages.map((l) => l.pct),
    [50, 50],
  );
  assert.equal(dna.stats.originalCount, 2);
});
test("invalid event dates do not corrupt timing arrays", () => {
  const dna = analyze({
    user,
    repos: [],
    events: [{ type: "PushEvent", created_at: "invalid" }],
  });
  assert.equal(dna.timing.peakHour, null);
  assert.equal(dna.timing.pushCount, 0);
});
test("commit message evidence and star thresholds produce expected traits", () => {
  const dna = analyze({
    user: { public_repos: 40 },
    repos: [repo("Swift", 1, { stargazers_count: 500 })],
    events: [
      {
        type: "PushEvent",
        created_at: "2026-09-01T09:00:00Z",
        payload: {
          commits: [{ message: "fix: repair the broken export flow" }],
        },
      },
    ],
  });
  assert.equal(dna.commitStyle, "Bug Hunter");
  assert.deepEqual(dna.dnaTraits, [
    "Early Bird",
    "Mobile Architect",
    "Prolific Creator",
    "Open Source Hero",
  ]);
});
