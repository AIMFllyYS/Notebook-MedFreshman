// Pushes tokens-studio.json into an existing Figma file via the Variables REST API.
//
// Usage:
//   $env:FIGMA_TOKEN='figd_xxx'                       # PowerShell
//   node figma/push-variables.mjs <fileKeyOrFigmaURL>
//
// Creates two collections:
//   StudySolo Core            (1 mode)  — structural tokens
//   StudySolo Color & Glass   (3 modes) — Dark / Aqua / Cream
// Skips typography & boxShadow tokens (Figma Variables cannot hold those types;
// sync them as Text/Effect styles via Tokens Studio — see figma/README.md).

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const arg = process.argv[2];
const token = process.env.FIGMA_TOKEN;
if (!arg) { console.error('missing figma file key or URL'); process.exit(1); }
if (!token) { console.error('missing FIGMA_TOKEN env var'); process.exit(1); }
const keyMatch = arg.match(/(?:design|file)\/([A-Za-z0-9]+)/);
const fileKey = keyMatch ? keyMatch[1] : arg;

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const doc = JSON.parse(fs.readFileSync(path.join(here, 'tokens-studio.json'), 'utf8'));

const FLOAT_TYPES = new Set(['spacing', 'sizing', 'borderRadius', 'fontSizes', 'fontWeights', 'lineHeights', 'number']);
function flatten(o, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(o)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && 'value' in v) out.push([p, v]);
    else if (v && typeof v === 'object') out.push(...flatten(v, p));
  }
  return out;
}
function figmaName(p) { return p.replace(/\./g, '/'); }
function num(v) { return parseFloat(String(v).replace(/px|%/g, '')); }
function rgb(s) {
  s = s.trim();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255, a: 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
  if (m) return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255, a: m[4] === undefined ? 1 : +m[4] };
  return null;
}

const collections = [
  { action: 'CREATE', id: 'collection:core', name: 'StudySolo Core', defaultModeId: 'mode:core', initialModeIds: ['mode:core'] },
  { action: 'CREATE', id: 'collection:color', name: 'StudySolo Color & Glass', defaultModeId: 'mode:dark', initialModeIds: ['mode:dark', 'mode:aqua', 'mode:cream'] },
];
const modes = [
  { action: 'CREATE', id: 'mode:core', name: 'Default', variableCollectionId: 'collection:core' },
  { action: 'CREATE', id: 'mode:dark', name: 'Dark', variableCollectionId: 'collection:color' },
  { action: 'CREATE', id: 'mode:aqua', name: 'Aqua', variableCollectionId: 'collection:color' },
  { action: 'CREATE', id: 'mode:cream', name: 'Cream', variableCollectionId: 'collection:color' },
];

const variableChanges = [];
const modeCodeChanges = [];
const pathToVar = new Map(); // token path -> {id, resolvedType, collection}
let skip = 0, seq = 0;

function ensureVariable(p, type, collectionId) {
  if (pathToVar.has(p)) return pathToVar.get(p);
  const id = `variable:${++seq}`;
  const resolvedType = type === 'color' ? 'COLOR' : FLOAT_TYPES.has(type) ? 'FLOAT' : 'STRING';
  variableChanges.push({ action: 'CREATE', id, name: figmaName(p), variableCollectionId: collectionId, resolvedType });
  const rec = { id, resolvedType, collection: collectionId };
  pathToVar.set(p, rec);
  return rec;
}
function resolveValue(raw, ownerRec) {
  if (typeof raw === 'string') {
    const ref = raw.match(/^\{([^}]+)\}$/);
    if (ref) {
      const target = pathToVar.get(ref[1]);
      if (!target) throw new Error(`unresolved alias ${raw}`);
      return { type: 'VARIABLE_ALIAS', id: target.id };
    }
    if (ownerRec.resolvedType === 'COLOR') {
      const c = rgb(raw);
      if (!c) throw new Error(`bad color ${raw}`);
      return c;
    }
    if (ownerRec.resolvedType === 'FLOAT') return num(raw);
    return raw;
  }
  return raw;
}

// core: one variable per token, value on Default mode
for (const [p, t] of flatten(doc.core)) {
  if (t.type === 'typography' || t.type === 'boxShadow') { skip++; continue; }
  const rec = ensureVariable(p, t.type, 'collection:core');
  modeCodeChanges.push({ variableId: rec.id, modeId: 'mode:core', value: resolveValue(t.value, rec) });
}
// themes: shared variable per path, one mode value per theme
for (const setName of ['dark', 'aqua', 'cream']) {
  for (const [p, t] of flatten(doc[setName])) {
    if (t.type === 'boxShadow') { skip++; continue; }
    const rec = ensureVariable(p, 'color', 'collection:color');
    modeCodeChanges.push({ variableId: rec.id, modeId: `mode:${setName}`, value: resolveValue(t.value, rec) });
  }
}

const body = { variableCollections: collections, variableModes: modes, variableChanges, modeCodeChanges };
console.log(`variables: ${variableChanges.length}, mode values: ${modeCodeChanges.length}, skipped (typography/shadow): ${skip}`);

const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables`, {
  method: 'POST',
  headers: { 'X-Figma-Token': token, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Figma API ${res.status}: ${text}`);
  process.exit(1);
}
console.log('pushed OK →', `https://www.figma.com/design/${fileKey}/`);
console.log(text.slice(0, 800));
