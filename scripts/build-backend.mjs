import { cp, mkdir, mkdtemp, appendFile, writeFile } from 'node:fs/promises';
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
await writeFile(join(output, '.node-version'), '24\n');
console.log(`Backend artifact: ${output}`);
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `directory=${output}\n`);
