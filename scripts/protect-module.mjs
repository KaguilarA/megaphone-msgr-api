import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { init, parse } from 'es-module-lexer';
import { minify } from 'terser';

/**
 * Conservative protection for application chunks without eval or property renaming.
 *
 * @property protectionOptions
 */
export const protectionOptions = Object.freeze({
  target: 'browser-no-eval',
  compact: true,
  seed: 42026,
  identifierNamesGenerator: 'mangled-shuffled',
  renameGlobals: false,
  renameProperties: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  selfDefending: false,
  numbersToExpressions: false,
  splitStrings: false,
  stringArray: false,
  stringArrayThreshold: 0.1,
  stringArrayEncoding: [],
  stringArrayRotate: false,
  stringArrayIndexShift: false,
  stringArrayCallsTransform: false,
  stringArrayWrappersChainedCalls: false,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
  sourceMap: false,
  ignoreImports: true,
  reservedStrings: ['^\\./.*\\.js$'],
});

/**
 * Protects a production module while preserving its module and HTTP contracts.
 *
 * @function protectModule
 * @param code - Optimized ESM produced by Angular, never TypeScript source.
 * @param protectStrings - Whether this domain module also needs selective string indirection.
 * @returns Deterministic obfuscated ESM with the same imports and exported names.
 */
export async function protectModule(code, protectStrings = false) {
  await init;
  const originalCode = code;
  const before = parse(code);
  // Name anonymous default declarations before obfuscator appends string helpers.
  // This avoids its ambiguous `export default function () {} function ...` output.
  const defaultName = '__megaphoneDefault_' + createHash('sha256').update(code).digest('hex').slice(0, 12);
  assert.ok(!code.includes(defaultName));
  code = code.replace(/^export default (async\s+)?function\s*\(/gm,
    (_, asyncKeyword = '') => `export default ${asyncKeyword}function ${defaultName}(`);
  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    ...protectionOptions,
    stringArray: protectStrings,
  }).getObfuscatedCode();
  const { code: protectedCode } = await minify(obfuscated, {
    module: true,
    ecma: 2022,
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false },
  });
  const after = parse(protectedCode);
  const dependency = (item, text) => item.specifier ?? item.n ??
    text.slice(item.s ?? item.start, item.e ?? item.end).replace(/^['"`]|['"`]$/g, '');
  assert.deepEqual(
    after[0].map((item) => dependency(item, protectedCode)),
    before[0].map((item) => dependency(item, originalCode)),
    'Protection changed a module dependency.',
  );
  assert.deepEqual(
    after[1].map((item) => (item.name ?? item.n)).sort(),
    before[1].map((item) => (item.name ?? item.n)).sort(),
    'Protection changed an exported contract.',
  );
  return protectedCode;
}

