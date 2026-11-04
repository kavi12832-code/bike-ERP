/**
 * One-off refactor: moves record arrays hardcoded in pages into the database.
 *
 *   node scripts/extract-page-data.mjs          # dry run (report only)
 *   node scripts/extract-page-data.mjs --write  # rewrite pages + write src/data/fixtures/pageCollections.js
 *
 * Only pure data is moved: arrays of >= 2 objects that each have a string `id`, built from
 * literals and a few date helpers. Arrays with icons, JSX, functions or references to other code
 * are left alone. Each moved array becomes `useCollection(name)` (state) or `useCollectionItems(name)`
 * (read-only), and its records go to the fixture file that `npm run export:seed` sends to the backend.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;
const WRITE = process.argv.includes('--write');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const fixturesFile = join(srcDir, 'data/fixtures/pageCollections.js');
const hookFile = join(srcDir, 'hooks/useCollection.js');

// Workflow / reference definitions the UI is built around: they stay in code, not the database.
const KEEP_IN_CODE = /(^|_)STAGES$|^MANDATORY_DOCS$|^KB_ARTICLES$/;
const HELPERS = new Set(['relativeDateIso', 'relativeDateString', 'subDays', 'addDays', 'format']);
const GLOBALS = new Set(['Date', 'Math', 'Number', 'String', 'undefined', 'Infinity', 'NaN']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** True if the array is plain data we can safely move to the DB. Records helper usage. */
function isPureData(node, usedHelpers) {
  let ok = true;
  const visit = (n) => {
    if (!ok || !n) return;
    switch (n.type) {
      case 'StringLiteral': case 'NumericLiteral': case 'BooleanLiteral': case 'NullLiteral':
        return;
      case 'TemplateLiteral': n.expressions.forEach(visit); return;
      case 'UnaryExpression': visit(n.argument); return;
      case 'BinaryExpression': visit(n.left); visit(n.right); return;
      case 'ArrayExpression': n.elements.forEach(visit); return;
      case 'ObjectExpression':
        for (const prop of n.properties) {
          if (prop.type !== 'ObjectProperty' || prop.computed) { ok = false; return; }
          visit(prop.value);
        }
        return;
      case 'CallExpression': case 'NewExpression': {
        const callee = n.callee;
        if (callee.type === 'Identifier' && (HELPERS.has(callee.name) || GLOBALS.has(callee.name))) {
          if (HELPERS.has(callee.name)) usedHelpers.add(callee.name);
        } else if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier' &&
                   GLOBALS.has(callee.object.name)) {
          // Date.now(), Math.round(...)
        } else if (callee.type === 'MemberExpression' && callee.object.type === 'NewExpression') {
          visit(callee.object); // new Date(...).toISOString()
        } else { ok = false; return; }
        n.arguments.forEach(visit);
        return;
      }
      case 'MemberExpression':
        if (n.object.type === 'Identifier' && GLOBALS.has(n.object.name)) return;
        ok = false; return;
      case 'Identifier':
        if (GLOBALS.has(n.name)) return;
        ok = false; return;
      default:
        ok = false;
    }
  };
  visit(node);
  return ok;
}

function isRecordArray(node) {
  if (!node || node.type !== 'ArrayExpression' || node.elements.length < 2) return false;
  return node.elements.every((el) => el && el.type === 'ObjectExpression' && el.properties.some(
    (p) => p.type === 'ObjectProperty' && !p.computed && (p.key.name === 'id' || p.key.value === 'id') &&
      (p.value.type === 'StringLiteral' || (p.value.type === 'TemplateLiteral' && !p.value.expressions.length))));
}

const MODULE_ALIASES = { stockVehicles: 'stock', stockParts: 'stock', testRides: 'sales', vehicleFinance: 'finance' };
function collectionName(file, varName, taken) {
  const rel = relative(join(srcDir, 'features'), file).split(/[\\/]/);
  const module = MODULE_ALIASES[rel[0]] || rel[0] || 'ui';
  const stem = basename(file).replace(/\.(jsx?|tsx?)$/, '').replace(/Page$/, '');
  const pageKey = stem.charAt(0).toLowerCase() + stem.slice(1);
  const clean = varName.replace(/^(INITIAL|SEED(ED)?|DEFAULT|MOCK|SAMPLE)_?/i, '').replace(/^_+/, '') || varName;
  const key = /^[A-Z0-9_]+$/.test(clean)
    ? clean.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
    : clean.charAt(0).toLowerCase() + clean.slice(1);
  let name = `${module}.${pageKey}.${key}`.slice(0, 64);
  for (let i = 2; taken.has(name); i++) name = `${module}.${pageKey}.${key}${i}`.slice(0, 64);
  taken.add(name);
  return name;
}

function componentOf(path) {
  // Nearest enclosing function that looks like a React component (capitalised name or default export).
  let fn = path.getFunctionParent();
  let outer = null;
  while (fn) {
    outer = fn;
    fn = fn.parentPath.getFunctionParent();
  }
  if (!outer) return null;
  const node = outer.node;
  let name = node.id?.name;
  if (!name && outer.parentPath.isVariableDeclarator()) name = outer.parentPath.node.id.name;
  const isDefault = outer.parentPath.isExportDefaultDeclaration();
  if ((name && /^[A-Z]/.test(name)) || isDefault) {
    if (node.body.type !== 'BlockStatement') return null;
    return outer;
  }
  return null;
}

const report = { moved: [], skipped: [] };
const fixtures = new Map(); // name -> source text
const usedHelpersAll = new Set();
const taken = new Set();

for (const file of walk(join(srcDir, 'features')).concat(walk(join(srcDir, 'components')))) {
  if (/tests?[\\/]/.test(file)) continue;
  const code = readFileSync(file, 'utf8');
  if (!code.includes('id:')) continue;
  let ast;
  try {
    ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
  } catch (err) {
    report.skipped.push(`${relative(srcDir, file)}: parse error ${err.message}`);
    continue;
  }
  const edits = []; // { start, end, text }
  const inserts = new Map(); // component body start -> [lines]
  let needCollection = false;
  let needItems = false;
  const rel = relative(srcDir, file);

  traverse(ast, {
    ArrayExpression(path) {
      const node = path.node;
      if (!isRecordArray(node)) return;
      const helpers = new Set();
      if (!isPureData(node, helpers)) {
        report.skipped.push(`${rel}:${node.loc.start.line} array has non-data values (icons/functions/refs)`);
        return;
      }
      const source = code.slice(node.start, node.end);
      const parent = path.parentPath;

      // (a) useState([...]) / useState(() => [...])
      let stateCall = null;
      if (parent.isCallExpression() && parent.node.callee.name === 'useState' && parent.node.arguments[0] === node) {
        stateCall = parent;
      } else if (parent.isArrowFunctionExpression() && parent.parentPath.isCallExpression() &&
                 parent.parentPath.node.callee.name === 'useState') {
        stateCall = parent.parentPath;
      }
      if (stateCall) {
        const decl = stateCall.parentPath;
        if (!decl.isVariableDeclarator() || decl.node.id.type !== 'ArrayPattern' || !componentOf(stateCall)) {
          report.skipped.push(`${rel}:${node.loc.start.line} useState not in a component`);
          return;
        }
        const varName = decl.node.id.elements[0]?.name || 'items';
        const name = collectionName(file, varName, taken);
        fixtures.set(name, source);
        helpers.forEach((h) => usedHelpersAll.add(h));
        edits.push({ start: stateCall.node.start, end: stateCall.node.end, text: `useCollection('${name}')` });
        needCollection = true;
        report.moved.push(`${rel}:${node.loc.start.line} useState(${varName}) -> ${name}`);
        return;
      }

      // (b)/(c) const NAME = [...]
      if (!parent.isVariableDeclarator() || parent.node.init !== node || parent.node.id.type !== 'Identifier') return;
      const varName = parent.node.id.name;
      if (KEEP_IN_CODE.test(varName)) {
        report.skipped.push(`${rel}:${node.loc.start.line} ${varName} is a workflow definition (kept in code)`);
        return;
      }
      const declaration = parent.parentPath;
      if (declaration.node.declarations.length !== 1 || declaration.parentPath.isExportNamedDeclaration()) {
        report.skipped.push(`${rel}:${node.loc.start.line} ${varName} is exported or multi-declared`);
        return;
      }
      const binding = path.scope.getBinding(varName) || parent.scope.getBinding(varName);
      if (!binding || binding.constantViolations.length) {
        report.skipped.push(`${rel}:${node.loc.start.line} ${varName} is reassigned`);
        return;
      }
      const isModuleLevel = declaration.parentPath.isProgram();
      const insideComponent = !isModuleLevel && componentOf(parent);

      if (!isModuleLevel) {
        // Component-local constant: must be a top-level statement of the component body.
        if (!insideComponent || declaration.parentPath.node !== insideComponent.node.body) {
          report.skipped.push(`${rel}:${node.loc.start.line} ${varName} declared inside a nested block`);
          return;
        }
        const name = collectionName(file, varName, taken);
        fixtures.set(name, source);
        helpers.forEach((h) => usedHelpersAll.add(h));
        edits.push({ start: node.start, end: node.end, text: `useCollectionItems('${name}')` });
        needItems = true;
        report.moved.push(`${rel}:${node.loc.start.line} const ${varName} (in component) -> ${name}`);
        return;
      }

      // Module-level constant: every reference must be inside a component; `useState(NAME)` becomes the
      // stateful hook, other reads get a `const NAME = useCollectionItems(...)` at the component's top.
      const refs = binding.referencePaths;
      if (!refs.length) return;
      const comps = new Map();
      for (const ref of refs) {
        const comp = componentOf(ref);
        if (!comp) {
          report.skipped.push(`${rel}:${node.loc.start.line} ${varName} used outside a component`);
          return;
        }
        comps.set(comp.node.start, comp);
      }
      const name = collectionName(file, varName, taken);
      fixtures.set(name, source);
      helpers.forEach((h) => usedHelpersAll.add(h));
      edits.push({ start: declaration.node.start, end: declaration.node.end, text: `// ${varName}: loaded from the database (collection "${name}")` });
      for (const ref of refs) {
        const call = ref.parentPath;
        if (call.isCallExpression() && call.node.callee.name === 'useState' && call.node.arguments[0] === ref.node) {
          edits.push({ start: call.node.start, end: call.node.end, text: `useCollection('${name}')` });
          needCollection = true;
        }
      }
      const readRefs = refs.filter((ref) => !(ref.parentPath.isCallExpression() && ref.parentPath.node.callee.name === 'useState'));
      const readComps = new Map();
      for (const ref of readRefs) {
        const comp = componentOf(ref);
        readComps.set(comp.node.start, comp);
      }
      for (const comp of readComps.values()) {
        const bodyStart = comp.node.body.start + 1;
        const lines = inserts.get(bodyStart) || [];
        lines.push(`  const ${varName} = useCollectionItems('${name}');`);
        inserts.set(bodyStart, lines);
        needItems = true;
      }
      report.moved.push(`${rel}:${node.loc.start.line} module const ${varName} (${refs.length} refs) -> ${name}`);
    },
  });

  if (!edits.length) continue;
  for (const [pos, lines] of inserts) edits.push({ start: pos, end: pos, text: `\n${lines.join('\n')}` });
  edits.sort((a, b) => b.start - a.start);
  let out = code;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);

  const names = [needCollection && 'useCollection', needItems && 'useCollectionItems'].filter(Boolean);
  let importPath = relative(dirname(file), hookFile).replace(/\\/g, '/').replace(/\.js$/, '');
  if (!importPath.startsWith('.')) importPath = `./${importPath}`;
  const importLine = `import { ${names.join(', ')} } from '${importPath}';\n`;
  const lastImport = [...out.matchAll(/^import [\s\S]*?;\s*$/gm)].pop();
  const at = lastImport ? lastImport.index + lastImport[0].length + 1 : 0;
  out = out.slice(0, at) + importLine + out.slice(at);
  if (WRITE) writeFileSync(file, out);
}

if (WRITE && fixtures.size) {
  mkdirSync(dirname(fixturesFile), { recursive: true });
  const helperImports = [];
  const dates = ['relativeDateIso', 'relativeDateString'].filter((h) => usedHelpersAll.has(h));
  const fns = ['subDays', 'addDays', 'format'].filter((h) => usedHelpersAll.has(h));
  if (dates.length) helperImports.push(`import { ${dates.join(', ')} } from '../../lib/dates';`);
  if (fns.length) helperImports.push(`import { ${fns.join(', ')} } from 'date-fns';`);
  const body = [...fixtures].map(([name, src]) => `  '${name}': ${src},`).join('\n');
  writeFileSync(fixturesFile, `/**
 * Demo records that pages used to hardcode. NOT imported by the app: scripts/export-seed.mjs sends
 * them to the backend (seed_demo), and pages load them from the API via useCollection(name).
 * Generated by scripts/extract-page-data.mjs.
 */
${helperImports.join('\n')}

export const PAGE_COLLECTIONS = {
${body}
};
`);
}

console.log(`${WRITE ? 'MOVED' : 'WOULD MOVE'} ${report.moved.length} arrays into ${fixtures.size} collections:`);
report.moved.forEach((m) => console.log('  +', m));
console.log(`\nSKIPPED ${report.skipped.length}:`);
report.skipped.forEach((m) => console.log('  -', m));
