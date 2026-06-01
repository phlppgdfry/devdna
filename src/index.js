#!/usr/bin/env node
import ora from 'ora';
import { fetchUser, fetchRepos, fetchEvents } from './github.js';
import { analyze } from './analyzer.js';
import { render } from './renderer.js';

const username = process.argv[2];

if (!username || username === '--help' || username === '-h') {
  console.log('Usage:  devdna <github-username>');
  console.log('        GITHUB_TOKEN=ghp_... devdna <username>');
  console.log('\nExamples:');
  console.log('        devdna torvalds');
  console.log('        devdna KippieG');
  process.exit(username ? 0 : 1);
}

const spinner = ora({
  text: `Sequencing ${username}'s DNA...`,
  color: 'cyan',
}).start();

try {
  spinner.text = `Fetching profile...`;
  const user = await fetchUser(username);

  spinner.text = `Reading ${user.public_repos} repositories...`;
  const [repos, events] = await Promise.all([
    fetchRepos(username),
    fetchEvents(username),
  ]);

  spinner.text = 'Analyzing patterns...';
  const dna = analyze({ user, repos, events });

  spinner.stop();
  render(dna);
} catch (err) {
  spinner.fail(err.message);
  process.exit(1);
}
