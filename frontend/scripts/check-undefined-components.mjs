/**
 * Finds JSX components that are used but never imported/defined (they crash the page at runtime).
 *   node scripts/check-undefined-components.mjs         # report
 *   node scripts/check-undefined-components.mjs --fix   # add imports for components we can locate
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;
const FIX = process.argv.includes('--fix');
const srcDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(srcDir);
// Where each exported component lives (named exports), for --fix.
const exportsByName = new Map();
for (const file of files) {
  if (!/components[\\/]/.test(file)) continue;
  const code = readFileSync(file, 'utf8');
  for (const m of code.matchAll(/export (?:function|const|class) ([A-Z][A-Za-z0-9]*)/g)) {
    if (!exportsByName.has(m[1])) exportsByName.set(m[1], file);
  }
}
let lucide = new Set();
try {
  const types = readFileSync(join(srcDir, '../node_modules/lucide-react/dist/lucide-react.d.ts'), 'utf8');
  lucide = new Set([...types.matchAll(/declare const ([A-Z][A-Za-z0-9]*): LucideIcon/g)].map((m) => m[1]));
} catch {
  // icons unavailable; report only
}

let problems = 0;
for (const file of files) {
  if (/[\\/]tests[\\/]/.test(file)) continue;
  const code = readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
  } catch {
    continue;
  }
  const missing = new Set();
  traverse(ast, {
    JSXOpeningElement(path) {
      const n = path.node.name;
      if (n.type !== 'JSXIdentifier' || !/^[A-Z]/.test(n.name)) return;
      if (!path.scope.hasBinding(n.name)) missing.add(n.name);
    },
  });
  if (!missing.size) continue;
  problems += missing.size;
  const rel = relative(srcDir, file);
  const fixes = [];
  const unresolved = [];
  for (const name of missing) {
    const home = exportsByName.get(name);
    if (home) {
      let path = relative(dirname(file), home).replace(/\\/g, '/').replace(/\.jsx?$/, '');
      if (!path.startsWith('.')) path = `./${path}`;
      fixes.push(`import { ${name} } from '${path}';`);
    } else if (lucide.has(name)) {
      fixes.push(`import { ${name} } from 'lucide-react';`);
    } else {
      unresolved.push(name);
    }
  }
  console.log(`${rel}: missing ${[...missing].join(', ')}${unresolved.length ? `  (UNRESOLVED: ${unresolved.join(', ')})` : ''}`);
  if (FIX && fixes.length) {
    const lastImport = [...code.matchAll(/^import [\s\S]*?;\s*$/gm)].pop();
    const at = lastImport ? lastImport.index + lastImport[0].length + 1 : 0;
    writeFileSync(file, code.slice(0, at) + fixes.join('\n') + '\n' + code.slice(at));
  }
}
console.log(problems ? `\n${problems} undefined component reference(s).` : 'No undefined components.');
