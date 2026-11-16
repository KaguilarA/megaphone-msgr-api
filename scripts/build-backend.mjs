import { cp, mkdir, mkdtemp, appendFile, writeFile } from 'node:fs/promises';
import { protectModule } from './protect-module.mjs';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
await mkdir(join(root, 'dist'), { recursive: true });
const output = await mkdtemp(join(root, 'dist/backend-'));
// Explicit allowlist: never publish database exports, credentials, or test data.
for (const directory of ['app', 'consts', 'controllers', 'integrations', 'middlewares', 'models', 'routes', 'utils', 'setup']) {
  await cp(join(root, directory), join(output, directory), {
    recursive: true,
    filter: source => !source.endsWith('.md') && !source.endsWith('testSetup.js'),
  });
}
for (const file of ['index.js', 'package.json', 'package-lock.json']) {
  await cp(join(root, file), join(output, file));
}
await mkdir(join(output, 'scripts'));
for (const file of ['setup.js', 'migrate-phone-numbers.js']) {
  await cp(join(root, 'scripts', file), join(output, 'scripts', file));
}
const pkg = JSON.parse(await readFile(join(output, 'package.json'), 'utf8'));
pkg.scripts = { start: 'node index.js', setup: 'node scripts/setup.js', 'migrate:phones': 'node scripts/migrate-phone-numbers.js' };
await writeFile(join(output, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
async function protectTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await protectTree(path);
    else if (entry.name.endsWith('.js')) {
      try { await writeFile(path, await protectModule(await readFile(path, 'utf8'), true)); }
      catch (error) { throw new Error(`Cannot protect ${path}`, { cause: error }); }
    }
  }
}
await protectTree(output);
await writeFile(join(output, '.node-version'), '24\n');
console.log(`Backend artifact: ${output}`);
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `directory=${output}\n`);
