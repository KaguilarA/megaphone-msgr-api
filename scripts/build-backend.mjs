import { mkdir, mkdtemp, appendFile, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { protectModule } from './protect-module.mjs';
import { readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
await mkdir(join(root, 'dist'), { recursive: true });
const output = await mkdtemp(join(root, 'dist/backend-'));
execFileSync(
  process.execPath,
  [
    join(root, 'node_modules/typescript/bin/tsc'),
    '--project',
    join(root, 'tsconfig.json'),
    '--outDir',
    output,
    '--declaration',
    'false',
  ],
  { cwd: root, stdio: 'inherit' },
);
await rm(join(output, 'types'), { recursive: true, force: true });
await writeFile(join(output, 'package.json'), await readFile(join(root, 'package.json')));
await writeFile(join(output, 'package-lock.json'), await readFile(join(root, 'package-lock.json')));
const pkg = JSON.parse(await readFile(join(output, 'package.json'), 'utf8'));
pkg.main = 'index.js';
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
