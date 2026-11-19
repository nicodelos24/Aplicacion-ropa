// check-syntax.cjs — chequeo de sintaxis sin navegador.
// La app pasó a módulos ES (type=module src=src/main.js), así que ya no hay
// un <script> inline en index.html que evaluar con vm.Script. En su lugar se
// usa `node --check` sobre cada archivo fuente, el service worker y los tests.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

const archivos = [
  ...walk('src'),
  'sw.js',
  ...fs.readdirSync('tests').filter((f) => f.endsWith('.test.mjs')).map((f) => path.join('tests', f)),
];

let fallos = 0;
for (const archivo of archivos) {
  try {
    execFileSync(process.execPath, ['--check', archivo], { stdio: 'pipe' });
  } catch (e) {
    fallos++;
    process.stderr.write(`Syntax error en ${archivo}:\n${e.stderr ? e.stderr.toString() : e.message}\n`);
  }
}

if (fallos) {
  console.error(`${fallos} archivo(s) con error de sintaxis.`);
  process.exit(1);
}
console.log(`Sintaxis OK: ${archivos.length} archivos (src/**, sw.js, tests/*.test.mjs).`);
