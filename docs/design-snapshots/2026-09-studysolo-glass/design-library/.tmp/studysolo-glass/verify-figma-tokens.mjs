import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('d:/projects/Dev-Tools/StudyReview-Platform/.design_library/studysolo-glass/figma/tokens-studio.json', 'utf8'));
function flat(o, p = '') {
  const r = {};
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && 'value' in v) r[p + k] = v;
    else if (v && typeof v === 'object') Object.assign(r, flat(v, p + k + '.'));
  }
  return r;
}
const sets = ['core', 'aqua', 'dark', 'cream'];
const F = Object.fromEntries(sets.map(s => [s, flat(d[s])]));
let bad = 0;
function checkRef(s, key, str) {
  for (const ref of str.match(/\{[^}]+\}/g) || []) {
    const p = ref.slice(1, -1);
    if (!F[s][p] && !F.core[p]) { console.log('BROKEN', s, key, ref); bad++; }
  }
}
for (const s of sets) {
  for (const [k, t] of Object.entries(F[s])) {
    if (typeof t.value === 'string') checkRef(s, k, t.value);
    const vals = Array.isArray(t.value) ? t.value : [t.value];
    for (const val of vals) {
      if (val && typeof val === 'object') for (const inner of Object.values(val)) if (typeof inner === 'string') checkRef(s, k, inner);
    }
  }
}
console.log('broken refs:', bad);
console.log('aqua alias.primary =', JSON.stringify(F.aqua['color.alias.primary']));
console.log('aqua surface.background =', JSON.stringify(F.aqua['color.surface.background']));
console.log('dark shadow.glass =', JSON.stringify(F.dark['boxShadow.glass'].value));
console.log('core shadow.2 =', JSON.stringify(F.core['boxShadow.2'].value));
console.log('core shadow.5 parts =', Array.isArray(F.core['boxShadow.5'].value) ? F.core['boxShadow.5'].value.length : 1);
console.log('cream glass.panelFill =', JSON.stringify(F.cream['color.glass.panelFill']));
console.log('themes =', d.$themes.map(t => t.name).join(' | '));
process.exit(bad ? 1 : 0);
