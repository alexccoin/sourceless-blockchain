#!/usr/bin/env node
// Minimal changelog generator: collects commit subjects since last tag and writes CHANGELOG.md
const { execSync } = require('child_process');
const fs = require('fs');
try {
  const lastTag = execSync('git describe --tags --abbrev=0').toString().trim();
  const log = execSync(`git log ${lastTag}..HEAD --pretty=format:%s`).toString().trim();
  const header = `# Changelog\n\n## Changes since ${lastTag}\n\n`;
  const body = log.split('\n').map(l => `- ${l}`).join('\n') + '\n';
  const out = header + body;
  fs.writeFileSync('CHANGELOG.md', out);
  console.log('CHANGELOG.md updated.');
} catch (err) {
  // If there is no tag yet, collect all commits
  try {
    const log = execSync('git log --pretty=format:%s').toString().trim();
    const header = '# Changelog\n\n## All changes\n\n';
    const body = log.split('\n').map(l => `- ${l}`).join('\n') + '\n';
    fs.writeFileSync('CHANGELOG.md', header + body);
    console.log('CHANGELOG.md created (no previous tags found).');
  } catch (err2) {
    console.error('Failed to generate changelog:', err2.message);
    process.exit(1);
  }
}
