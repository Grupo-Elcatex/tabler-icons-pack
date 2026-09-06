#!/usr/bin/env node
// Builds the Material-style layout (src/ + png/ + metadata/) from the @tabler/icons npm package.
// Usage: node update/build.mjs <path-to-extracted-@tabler/icons-package> [--skip-png]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DPS = [18, 24, 36, 48];
const DENSITIES = [1, 2, 4];
const COLOR = { name: 'black', value: '#000000' };

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

if (isMainThread) {
  const [pkgDir, ...flags] = process.argv.slice(2);
  if (!pkgDir) { console.error('usage: node update/build.mjs <pkgDir> [--skip-png]'); process.exit(1); }
  const skipPng = flags.includes('--skip-png');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  const icons = JSON.parse(fs.readFileSync(path.join(pkgDir, 'icons.json'), 'utf8'));

  const jobs = [];
  const index = [];
  const categories = {};
  for (const [name, meta] of Object.entries(icons)) {
    const cat = slug(meta.category || 'uncategorized');
    (categories[cat] ??= { name: meta.category || 'Uncategorized', icons: [] }).icons.push(name);
    const entry = { name, category: cat, tags: (meta.tags || []).map(String), styles: {} };
    for (const [style, sm] of Object.entries(meta.styles)) {
      const srcSvg = path.join(pkgDir, 'icons', style, `${name}.svg`);
      if (!fs.existsSync(srcSvg)) continue;
      const dstDir = path.join(ROOT, 'src', cat, name, style);
      fs.mkdirSync(dstDir, { recursive: true });
      fs.copyFileSync(srcSvg, path.join(dstDir, '24px.svg'));
      entry.styles[style] = { version: sm.version, unicode: sm.unicode, svg: path.relative(ROOT, path.join(dstDir, '24px.svg')) };
      if (!skipPng) jobs.push({ svg: srcSvg, outDir: path.join(ROOT, 'png', cat, name, style), name, style });
    }
    index.push(entry);
  }

  fs.mkdirSync(path.join(ROOT, 'metadata'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'metadata', 'icons.json'), JSON.stringify(index, null, 1));
  fs.writeFileSync(path.join(ROOT, 'metadata', 'categories.json'), JSON.stringify(categories, null, 1));
  fs.writeFileSync(path.join(ROOT, 'metadata', 'source.json'), JSON.stringify({
    package: pkg.name, version: pkg.version, license: pkg.license, homepage: pkg.homepage,
    repository: 'https://github.com/tabler/tabler-icons', builtAt: new Date().toISOString(),
    png: { dps: DPS, densities: DENSITIES, colors: [COLOR.name] },
  }, null, 2));
  console.log(`svg: ${index.length} icons, ${Object.keys(categories).length} categories, ${jobs.length} icon/style pairs`);
  if (skipPng) process.exit(0);

  const n = Math.max(1, os.cpus().length);
  const chunk = Math.ceil(jobs.length / n);
  let done = 0, finished = 0;
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: jobs.slice(i * chunk, (i + 1) * chunk) });
    w.on('message', (m) => { done += m; if (done % 500 < m) process.stdout.write(`\rpng: ${done}/${jobs.length}`); });
    w.on('error', (e) => { console.error(e); process.exit(1); });
    w.on('exit', () => { if (++finished === n) console.log(`\rpng: ${done}/${jobs.length} pairs in ${((Date.now() - t0) / 1000).toFixed(0)}s`); });
  }
} else {
  const { Resvg } = await import('@resvg/resvg-js');
  let count = 0;
  for (const job of workerData) {
    const svg = fs.readFileSync(job.svg, 'utf8').replaceAll('currentColor', COLOR.value);
    for (const dp of DPS) for (const d of DENSITIES) {
      const dir = path.join(job.outDir, `${dp}dp`, `${d}x`);
      fs.mkdirSync(dir, { recursive: true });
      const png = new Resvg(svg, { fitTo: { mode: 'width', value: dp * d }, font: { loadSystemFonts: false } }).render().asPng();
      fs.writeFileSync(path.join(dir, `${job.style}_${job.name}_${COLOR.name}_${dp}dp.png`), png);
    }
    if (++count % 50 === 0) { parentPort.postMessage(50); count = 0; }
  }
  if (count) parentPort.postMessage(count);
}
