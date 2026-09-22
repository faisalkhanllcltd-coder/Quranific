import { execSync } from 'child_process';

function runGitCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    console.error(`ERROR: Git command failed: "${cmd}"`);
    if (error.stderr) {
      console.error(error.stderr.trim());
    }
    process.exit(1);
  }
}

// 1. Verify working tree is clean
const status = runGitCommand('git status --porcelain');
if (status.length > 0) {
  console.error('ERROR: Working tree has uncommitted or untracked changes.');
  console.error('Production deployments require a completely clean working tree.');
  console.error('\nDirty files:\n' + status);
  process.exit(1);
}

// 2. Verify current branch is main
const branch = runGitCommand('git branch --show-current');
if (branch !== 'main') {
  console.error(`ERROR: Production deployments are strictly restricted to the 'main' branch.`);
  console.error(`Current branch: '${branch || 'DETACHED HEAD'}'`);
  process.exit(1);
}

console.log('✔ Deploy guard check passed: clean working tree on branch main.');
process.exit(0);
