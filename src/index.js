#!/usr/bin/env node
import ora from "ora";
import { fetchUser, fetchRepos, fetchEvents } from "./github.js";
import { analyze } from "./analyzer.js";
import { render } from "./renderer.js";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const username = args.find((arg) => !arg.startsWith("-"));
const help = args.includes("--help") || args.includes("-h");

if (!username || help) {
  console.log("Usage:  devdna <github-username> [--json]");
  console.log("        GITHUB_TOKEN=ghp_... devdna <username>");
  console.log("\nExamples:");
  console.log("        devdna torvalds");
  console.log("        devdna KippieG");
  process.exit(help ? 0 : 1);
}

if (
  !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) ||
  username.includes("--") ||
  args.some((arg) => arg.startsWith("-") && arg !== "--json") ||
  args.filter((arg) => !arg.startsWith("-")).length !== 1
) {
  console.error("Use a valid GitHub username and optional --json flag.");
  process.exit(1);
}

const spinner = ora({
  isSilent: jsonOutput,
  text: `Sequencing ${username}'s DNA...`,
  color: "cyan",
}).start();

try {
  spinner.text = `Fetching profile...`;
  const user = await fetchUser(username);

  spinner.text = `Reading ${user.public_repos} repositories...`;
  const [repos, events] = await Promise.all([
    fetchRepos(username),
    fetchEvents(username),
  ]);

  spinner.text = "Analyzing patterns...";
  const dna = analyze({ user, repos, events });

  spinner.stop();
  if (jsonOutput) console.log(JSON.stringify(dna, null, 2));
  else render(dna);
} catch (err) {
  spinner.stop();
  console.error(err.message);
  process.exit(1);
}
