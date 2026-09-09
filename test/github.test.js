import test from "node:test";
import assert from "node:assert/strict";
import { fetchRepos, fetchEvents } from "../src/github.js";
test("API failures are not silently converted into empty reports", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 500 });
  try {
    await assert.rejects(fetchRepos("octocat"), /500/);
    await assert.rejects(fetchEvents("octocat"), /500/);
  } finally {
    globalThis.fetch = original;
  }
});
test("repository pagination removes duplicate ids", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json([{ id: 1 }, { id: 2 }]);
  try {
    assert.equal((await fetchRepos("octocat")).length, 2);
  } finally {
    globalThis.fetch = original;
  }
});
