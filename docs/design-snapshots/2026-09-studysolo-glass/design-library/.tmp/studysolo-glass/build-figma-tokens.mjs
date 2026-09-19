// Builds a Tokens Studio (Figma Variables plugin) multi-theme token file
// from colors_and_type.css: core structural set + 3 self-contained theme sets.
import fs from 'node:fs';

const CSS = 'd:/projects/Dev-Tools/StudyReview-Platform/.design_library/studysolo-glass/colors_and_type.css';
const OUT = 'd:/projects/Dev-Tools/StudyReview-Platform/.design_library/studysolo-glass/figma/tokens-studio.json';

const css = fs.readFileSync(CSS, 'utf8');

function block(selector) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*{([\\s\\S]*?)}');
  const m = css.match(re);
  if (!m) throw new Error('block not found: ' + selector);
  const decls = {};
  const reDecl = /(--[a-z0-9-]+)\s*:\s*([^;]+)\s*;/gi;
  let d;
  while ((d = reDecl.exec(m[1]))) decls[d[1].slice(2)] = d[2].trim();
  return decls;
}

const root = block(':root');
const dark = block('.dark');
const cream = block('[data-tint="cream"]');

// ---------- classification ----------
const RAMP = /^(primary|accent|neutral|success|warning|info)-\d{2,3}$/;
const isFont = n => /^font-(sans|mono|display|heading|body)$/.test(n);
const isFontSize = n => /^font-size-/.test(n);
const isFontWeight = n => /^font-weight-/.test(n);
const isLineHeight = n => /^line-height-/.test(n);
const SKIP = new Set(['font-display','font-heading','font-body','type-display','type-h1','type-h2','type-body','type-caption']);

// semantic path mapping for theme-owned variables
function themePath(n) {
  const map = {
    primary: ['color','brand','primary'], 'primary-foreground': ['color','brand','primaryForeground'],
    accent: ['color','brand','accent'], 'accent-foreground': ['color','brand','accentForeground'],
    success: ['color','state','success'], warning: ['color','state','warning'], info: ['color','state','info'],
    muted: ['color','neutral','muted'], secondary: ['color','neutral','secondary'],
    ring: ['color','focus','ring'], link: ['color','text','link'],
    'text-primary': ['color','text','primary'], 'text-secondary': ['color','text','secondary'],
    'text-tertiary': ['color','text','tertiary'], 'text-on-primary': ['color','text','onPrimary'],
    'text-on-glass': ['color','text','onGlass'],
    foreground: ['color','text','foreground'], 'muted-foreground': ['color','text','muted'],
    'surface-page': ['color','surface','page'], 'surface-panel': ['color','surface','panel'],
    'surface-sidebar': ['color','surface','sidebar'], 'surface-popover': ['color','surface','popover'],
    'surface-control': ['color','surface','control'], 'surface-sunken': ['color','surface','sunken'],
    background: ['color','surface','background'], card: ['color','surface','card'],
    popover: ['color','surface','popoverAlias'], sidebar: ['color','surface','sidebarAlias'],
    border: ['color','border','default'],
    'glass-window-fill': ['color','glass','windowFill'], 'glass-sidebar-fill': ['color','glass','sidebarFill'],
    'glass-panel-fill': ['color','glass','panelFill'], 'glass-popover-fill': ['color','glass','popoverFill'],
    'glass-control-fill': ['color','glass','controlFill'], 'glass-border': ['color','glass','border'],
    'glass-highlight': ['color','glass','highlight'], 'glass-noise': ['color','glass','noise'],
    'glass-shadow': ['boxShadow','glass'],
    'color-primary': ['color','alias','primary'], 'color-accent': ['color','alias','accent'],
    'color-background': ['color','alias','background'], 'color-foreground': ['color','alias','foreground'],
    'color-muted-foreground': ['color','alias','mutedForeground'], 'color-surface': ['color','alias','surface'],
    'color-card': ['color','alias','card'], 'color-popover': ['color','alias','popover'],
    'color-border': ['color','alias','border'], 'color-ring': ['color','alias','ring'],
    'color-success': ['color','alias','success'], 'color-warning': ['color','alias','warning'],
    'color-info': ['color','alias','info'],
  };
  return map[n] || null;
}
const THEME_OWNED = new Set(Object.keys(themePath('x') || {}));
// rebuild keyset from map by scanning root names
function isThemeOwned(n) { return RAMP.test(n) === false && themePath(n) !== null; }

const COLOR_LITERAL = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i;

function setNested(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]] ||= {};
  cur[path[path.length - 1]] = value;
}
const getNested = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);

// var(...) reference -> tokens-studio reference string, resolved against theme set + core
function refFor(varName, setName, index) {
  // within same theme set?
  const tp = themePath(varName);
  if (tp) {
    const local = getNested(index[setName], tp);
    if (local !== undefined) return '{' + tp.join('.') + '}';
  }
  // core ramp
  const m = varName.match(RAMP);
  if (m) return `{color.ramp.${m[1]}.${varName.split('-')[1]}}`;
  // core structural
  const c = CORE_REF[varName];
  if (c) return '{' + c.join('.') + '}';
  return null;
}

// ---------- shadow parser ----------
function parseShadow(str) {
  const parts = [];
  const re = /(inset\s+)?(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)px)?\s+(rgba?\([^)]+\)|#[0-9a-f]+)/gi;
  let m;
  while ((m = re.exec(str))) {
    parts.push({
      x: `${m[2]}px`, y: `${m[3]}px`, blur: `${m[4]}px`, spread: `${m[5] || 0}px`,
      color: m[6], type: m[1] ? 'inner' : 'dropShadow',
    });
  }
  return parts.length ? (parts.length === 1 ? parts[0] : parts) : str;
}

// ---------- core set ----------
const core = {};
const CORE_REF = {}; // css var name -> core token path
function registerCore(varName, path) { CORE_REF[varName] = path; }

for (const [n, v] of Object.entries(root)) {
  if (RAMP.test(n)) {
    const [g, step] = n.split('-');
    const path = ['color','ramp', g, step];
    setNested(core, path, { value: v, type: 'color' });
    registerCore(n, path);
  } else if (SKIP.has(n)) { continue; }
  else if (isFont(n)) {
    const which = n.split('-')[1];
    const fam = which === 'mono' ? 'JetBrains Mono' : 'Inter';
    const path = ['fontFamilies', which === 'sans' ? 'sans' : which];
    setNested(core, path, { value: fam, type: 'fontFamilies' });
    registerCore(n, path);
  } else if (isFontSize(n)) {
    const path = ['fontSizes', n.replace('font-size-','')];
    setNested(core, path, { value: v, type: 'fontSizes' });
    registerCore(n, path);
  } else if (isFontWeight(n)) {
    const path = ['fontWeights', n.replace('font-weight-','')];
    setNested(core, path, { value: v, type: 'fontWeights' });
    registerCore(n, path);
  } else if (isLineHeight(n)) {
    const path = ['lineHeights', n.replace('line-height-','')];
    setNested(core, path, { value: v, type: 'lineHeights' });
    registerCore(n, path);
  } else if (n.startsWith('space-')) {
    const path = ['spacing', n.slice(6)];
    setNested(core, path, { value: v, type: 'spacing' });
    registerCore(n, path);
  } else if (n.startsWith('size-')) {
    const path = ['sizing', n.slice(5)];
    setNested(core, path, { value: v, type: 'sizing' });
    registerCore(n, path);
  } else if (n.startsWith('radius-')) {
    const path = ['borderRadius', n.slice(7)];
    const vm = v.match(/^var\(--([a-z0-9-]+)\)$/i);
    setNested(core, path, vm ? { value: '{borderRadius.' + vm[1].slice(7) + '}', type: 'borderRadius' } : { value: v, type: 'borderRadius' });
    registerCore(n, path);
  } else if (/^shadow-[1-5]$/.test(n)) {
    setNested(core, ['boxShadow', n.slice(7)], { value: parseShadow(v), type: 'boxShadow' });
    registerCore(n, ['boxShadow', n.slice(7)]);
  } else if (n.startsWith('duration-')) {
    setNested(core, ['motion','duration', n.slice(9)], { value: v, type: 'number' });
    registerCore(n, ['motion','duration', n.slice(9)]);
  } else if (n.startsWith('ease-')) {
    setNested(core, ['motion','easing', n.slice(5)], { value: v, type: 'other' });
    registerCore(n, ['motion','easing', n.slice(5)]);
  } else if (/^glass-blur-/.test(n)) {
    setNested(core, ['glass','blur', n.slice(11)], { value: v, type: 'number' });
    registerCore(n, ['glass','blur', n.slice(11)]);
  } else if (n === 'glass-saturate' || n === 'glass-brightness') {
    setNested(core, ['glass', n === 'glass-saturate' ? 'saturate' : 'brightness'], { value: v.replace('%',''), type: 'number' });
    registerCore(n, ['glass', n === 'glass-saturate' ? 'saturate' : 'brightness']);
  }
}

// composite typography styles
const TYPO = ['display','h1','h2','h3','h4','body','lead','caption'];
for (const t of TYPO) {
  setNested(core, ['typography', t], {
    value: {
      fontFamily: '{fontFamilies.sans}',
      fontSize: `{fontSizes.${t}}`,
      fontWeight: `{fontWeights.${t}}`,
      lineHeight: `{lineHeights.${t}}`,
    },
    type: 'typography',
  });
}
setNested(core, ['typography','mono'], {
  value: { fontFamily: '{fontFamilies.mono}', fontSize: '{fontSizes.mono}', fontWeight: '{fontWeights.mono}', lineHeight: '{lineHeights.mono}' },
  type: 'typography',
});

// ---------- theme sets ----------
const index = { core, aqua: {}, dark: {}, cream: {} };
function buildTheme(name, overrides) {
  const set = {};
  index[name] = set; // publish early so same-set var() refs resolve in declaration order
  const merged = { ...root, ...overrides };
  for (const [n, v] of Object.entries(merged)) {
    if (RAMP.test(n) || SKIP.has(n)) continue;
    const path = themePath(n);
    if (!path) continue; // structural token lives in core
    let value;
    const vm = v.match(/^var\(--([a-z0-9-]+)\)$/i);
    if (vm) {
      const r = refFor(vm[1], name, index);
      if (!r) continue;
      value = r;
    } else if (path[0] === 'boxShadow') {
      value = parseShadow(v);
    } else {
      value = v;
    }
    const type = path[0] === 'boxShadow' ? 'boxShadow' : 'color';
    setNested(set, path, { value, type });
  }
  index[name] = set;
  return set;
}
const aqua = buildTheme('aqua', {});
const darkSet = buildTheme('dark', dark);
const creamSet = buildTheme('cream', cream);

const doc = {
  core,
  aqua,
  dark: darkSet,
  cream: creamSet,
  $themes: [
    { id: 'aqua', name: '雾蓝浅色 · Aqua Glass', selectedTokenSets: { core: 'enabled', aqua: 'source' } },
    { id: 'dark', name: '深色暖炭 · Dark Glass', selectedTokenSets: { core: 'enabled', dark: 'source' } },
    { id: 'cream', name: '奶油暖黄 · Cream Glass', selectedTokenSets: { core: 'enabled', cream: 'source' } },
  ],
  $metadata: {
    tokenSetOrder: ['core','aqua','dark','cream'],
    brand: 'StudySolo Glass',
    cssSource: 'colors_and_type.css',
    figmaMappingHint: 'core → Collection "StudySolo Core" (1 mode); aqua/dark/cream → Collection "StudySolo Color & Glass" (3 modes)',
  },
};

fs.mkdirSync(new URL('.', new URL('file://' + OUT.replace(/\\/g, '/'))), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2), 'utf8');

const count = o => (typeof o === 'object' && o !== null && 'value' in o) ? 1 : Object.values(o).reduce((s, x) => s + (typeof x === 'object' && x ? count(x) : 0), 0);
console.log(JSON.stringify({
  ok: true,
  out: OUT,
  counts: { core: count(core), aqua: count(aqua), dark: count(darkSet), cream: count(creamSet) },
  themes: doc.$themes.length,
}, null, 2));
